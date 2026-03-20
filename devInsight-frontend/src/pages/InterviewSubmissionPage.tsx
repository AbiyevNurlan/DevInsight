import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  Send,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Timer,
  Lightbulb,
  Save,
  RefreshCw,
  Award,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
  ShieldCheck
} from 'lucide-react'
import api from '../services/api'
import AntiCheatMonitor from '../components/AntiCheatMonitor'
import { useAIDetection } from '../components/FaceDetection'

interface Question {
  id: number
  title: string
  description: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  maxPoints?: number
  type?: string
}

interface Interview {
  id: number
  title: string
  description?: string
  questions?: Question[]
  durationMinutes?: number
}

// Difficulty Badge with modern design
const DifficultyBadge = ({ level }: { level?: string }) => {
  const config: Record<string, { color: string; bg: string; border: string; glow: string }> = {
    EASY: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
    MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
    HARD: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
  }
  const c = config[level || 'MEDIUM'] || config.MEDIUM

  return (
    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${c.bg} ${c.color} ${c.border} border shadow-lg ${c.glow}`}>
      {level || 'MEDIUM'}
    </span>
  )
}

// Progress Ring Component
const ProgressRing = ({ progress, size = 100 }: { progress: number; size?: number }) => {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
        <span className="text-xs text-slate-400">Complete</span>
      </div>
    </div>
  )
}

// Timer Component
const InterviewTimer = ({ startTime, duration }: { startTime: Date; duration?: number }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const remaining = duration ? duration * 60 - elapsed : null
  const isLowTime = remaining !== null && remaining < 300

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm ${
      isLowTime 
        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
        : 'bg-slate-800/50 border-white/10 text-slate-300'
    }`}>
      <Timer className="w-4 h-4" />
      <span className="font-mono text-sm font-medium">
        {remaining !== null ? formatTime(Math.max(0, remaining)) : formatTime(elapsed)}
      </span>
      {remaining !== null && <span className="text-xs opacity-70">left</span>}
    </div>
  )
}

export default function InterviewSubmissionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Map<number, string>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime] = useState(new Date())
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Anti-Cheat State
  const [violations, setViolations] = useState<Array<{ type: string; details: string; timestamp: Date }>>([])
  const [typingPatterns, setTypingPatterns] = useState<Array<{ questionId: number; keystrokes: number; avgSpeed: number }>>([])

  // Handle anti-cheat violations
  const handleViolation = useCallback((type: string, details: string) => {
    const violation = { type, details, timestamp: new Date() }
    setViolations(prev => [...prev, violation])
    
    // Log to console
    console.warn(`🚨 Security Violation: ${type} - ${details}`)
  }, [])

  // AI Detection Hook
  const { analyzeTyping, reset: resetAIDetection } = useAIDetection(handleViolation)

  useEffect(() => {
    if (!id) {
      setError('Interview ID is required')
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchInterview() {
      try {
        const response = await api.get(`/interviews/${id}`)

        if (mounted) {
          const interviewData = response.data?.data || response.data
          setInterview(interviewData)
          setLoading(false)

          if (interviewData?.questions) {
            const newAnswers = new Map<number, string>()
            interviewData.questions.forEach((q: Question) => {
              newAnswers.set(q.id, '')
            })
            setAnswers(newAnswers)
          }
        }
      } catch (err: any) {
        if (mounted) {
          if (err.response?.status === 404) {
            setError('Interview not found')
          } else if (err.response?.status === 401) {
            api.clearToken()
            navigate('/login')
          } else {
            setError(err.response?.data?.message || 'Failed to load interview')
          }
          setLoading(false)
        }
      }
    }

    fetchInterview()
    return () => { mounted = false }
  }, [id, navigate])

  // Auto-save
  useEffect(() => {
    if (answers.size > 0) {
      setAutoSaveStatus('saving')
      const timer = setTimeout(() => {
        const answersObj: Record<number, string> = {}
        answers.forEach((v, k) => { answersObj[k] = v })
        localStorage.setItem(`interview_${id}_answers`, JSON.stringify(answersObj))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [answers, id])

  // Load saved answers
  useEffect(() => {
    const saved = localStorage.getItem(`interview_${id}_answers`)
    if (saved && interview?.questions) {
      try {
        const parsed = JSON.parse(saved)
        const newAnswers = new Map<number, string>()
        interview.questions.forEach(q => {
          newAnswers.set(q.id, parsed[q.id] || '')
        })
        setAnswers(newAnswers)
      } catch {}
    }
  }, [id, interview])

  const handleAnswerChange = useCallback((questionId: number, value: string, event?: React.KeyboardEvent) => {
    setAnswers(prev => new Map(prev).set(questionId, value))
    
    // Analyze typing for AI detection
    if (event) {
      const isBackspace = event.key === 'Backspace'
      analyzeTyping(value, isBackspace)
    }
  }, [analyzeTyping])

  const goToQuestion = (index: number) => {
    if (interview?.questions && index >= 0 && index < interview.questions.length) {
      setCurrentIndex(index)
    }
  }

  const handleSubmit = async () => {
    if (!interview?.id) return

    setSubmitting(true)
    setError(null)

    try {
      const submitAnswers = interview.questions?.map(q => ({
        questionId: q.id,
        answer: answers.get(q.id) || ''
      })) || []

      // Include anti-cheat data in submission
      const submissionData = {
        answers: submitAnswers,
        metadata: {
          violations: violations.length,
          violationDetails: violations,
          typingPatterns,
          timeSpent: Math.floor((Date.now() - startTime.getTime()) / 1000),
          browserInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        }
      }

      console.log('📊 Submission Data:', submissionData)

      const response = await api.post(`/submissions/interviews/${interview.id}`, submitAnswers)
      localStorage.removeItem(`interview_${id}_answers`)

      const submissionId = response.data?.data?.submissionId
      if (submissionId) {
        navigate(`/submissions/${submissionId}`)
      } else {
        navigate('/interviews')
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        api.clearToken()
        navigate('/login')
      } else {
        setError(err.response?.data?.message || 'Failed to submit answers')
      }
    } finally {
      setSubmitting(false)
      setShowConfirmSubmit(false)
    }
  }

  const currentQuestion = interview?.questions?.[currentIndex]
  const totalQuestions = interview?.questions?.length || 0
  const answeredCount = Array.from(answers.values()).filter(a => a.trim()).length
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400 text-lg">Loading interview...</p>
        </motion.div>
      </div>
    )
  }

  if (!interview || error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Interview Not Available</h2>
          <p className="text-slate-400 mb-8">{error || 'The interview could not be loaded.'}</p>
          <Link
            to="/interviews"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Anti-Cheat Monitor */}
      <AntiCheatMonitor
        interviewId={interview.id}
        onViolation={handleViolation}
        enableCamera={true}
        enableScreenShare={false}
        enableTabSwitch={true}
        enableCopyPaste={true}
        enableFullscreen={true}
        enableFaceDetection={true}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/interviews"
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">{interview.title}</h1>
                <p className="text-xs text-slate-500">{totalQuestions} questions • Interview</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Security Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Secure Mode</span>
              </div>

              <AnimatePresence>
                {autoSaveStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    {autoSaveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                        <span className="text-slate-400">Saving...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Saved</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <InterviewTimer startTime={startTime} duration={interview.durationMinutes || 60} />

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/25"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="sticky top-28 space-y-6">
              {/* Progress Card */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-slate-400 mb-6">Your Progress</h3>
                <div className="flex justify-center mb-4">
                  <ProgressRing progress={progress} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">
                    <span className="text-white font-semibold">{answeredCount}</span> of {totalQuestions} answered
                  </p>
                </div>
              </div>

              {/* Question Navigator */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {interview.questions?.map((q, idx) => {
                    const isAnswered = answers.get(q.id)?.trim()
                    const isCurrent = idx === currentIndex

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(idx)}
                        className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700/50 hover:text-white border border-white/5'
                        }`}
                      >
                        {idx + 1}
                        {isAnswered && !isCurrent && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-sm">Answered</span>
                    </div>
                    <span className="text-white font-semibold">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Target className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-sm">Remaining</span>
                    </div>
                    <span className="text-white font-semibold">{totalQuestions - answeredCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Question Area */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-9"
          >
            {currentQuestion && (
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
                {/* Question Header */}
                <div className="p-6 md:p-8 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 text-sm font-semibold rounded-xl border border-blue-500/20">
                        Question {currentIndex + 1}
                      </span>
                      <DifficultyBadge level={currentQuestion.difficulty} />
                    </div>
                    {currentQuestion.maxPoints && (
                      <div className="flex items-center gap-2 text-amber-400">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-semibold">{currentQuestion.maxPoints} pts</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                    {currentQuestion.title}
                  </h2>
                  {currentQuestion.description && (
                    <p className="text-slate-400 mt-3 leading-relaxed">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>

                {/* Answer Area */}
                <div className="p-6 md:p-8">
                  <div className="mb-4 flex items-center gap-2 text-slate-400 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Your Answer</span>
                  </div>
                  <textarea
                    value={answers.get(currentQuestion.id) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    onKeyDown={(e) => handleAnswerChange(currentQuestion.id, e.currentTarget.value, e)}
                    placeholder="Type your detailed answer here..."
                    className="w-full h-64 bg-slate-800/30 border border-white/10 rounded-xl p-5 text-white text-lg placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{(answers.get(currentQuestion.id) || '').length} characters</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI will analyze your response
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-6 md:p-8 border-t border-white/5 bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors border border-white/5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentIndex < totalQuestions - 1 ? (
                        <button
                          onClick={() => goToQuestion(currentIndex + 1)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowConfirmSubmit(true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
                        >
                          Finish & Submit
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Pro Tips</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Be specific and provide examples where possible</li>
                    <li>• Structure your answer with clear points</li>
                    <li>• Review all answers before final submission</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                  <Send className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Submit Interview?</h3>
                <p className="text-slate-400 mb-6">
                  You have answered <span className="text-white font-semibold">{answeredCount}</span> out of <span className="text-white font-semibold">{totalQuestions}</span> questions.
                  {answeredCount < totalQuestions && (
                    <span className="block mt-2 text-amber-400">
                      ⚠️ {totalQuestions - answeredCount} questions are still unanswered.
                    </span>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-white/5"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
