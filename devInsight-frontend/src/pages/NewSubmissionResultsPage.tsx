import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Trophy,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  MessageSquare,
  FileText,
  Sparkles,
  BookOpen,
  RefreshCw,
  Home,
  BarChart2
} from 'lucide-react'
import api from '../services/api'
import ChatModal from '../components/Chat/ChatModal'

interface QuestionAnswer {
  answerId: number
  questionId: number
  questionTitle: string
  userAnswer: string
  similarityScore: number
  pointsEarned: number
  maxPoints: number
  feedback: string
  status: 'CORRECT' | 'PARTIAL' | 'INCORRECT'
}

interface SubmissionResult {
  submissionId: number
  interviewId: number
  interviewTitle: string
  totalScore: number
  totalQuestions: number
  answeredQuestions: number
  percentageScore: number
  status: string
  submittedAt: string
  results: QuestionAnswer[]
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    CORRECT: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    PARTIAL: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    INCORRECT: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
  }
  const c = config[status] || config.INCORRECT
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.color} ${c.border} border`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  )
}

// Progress Ring Component
const ScoreRing = ({ percentage }: { percentage: number }) => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  
  const getGradient = (pct: number) => {
    if (pct >= 80) return { start: '#10b981', end: '#06b6d4' }
    if (pct >= 60) return { start: '#f59e0b', end: '#f97316' }
    return { start: '#ef4444', end: '#ec4899' }
  }
  
  const colors = getGradient(percentage)

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-4xl font-bold text-white"
        >
          {percentage.toFixed(0)}%
        </motion.span>
        <span className="text-xs text-slate-400 mt-1">Score</span>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, subValue }: { icon: any; label: string; value: number; color: string; subValue?: string }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-slate-900/60 border border-white/10 rounded-xl p-5 backdrop-blur-xl"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
  </motion.div>
)

export default function SubmissionResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState<SubmissionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [hasChatStarted, setHasChatStarted] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('Submission ID is required')
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchSubmission() {
      try {
        const response = await api.get(`/submissions/${id}`)

        if (mounted) {
          const submissionData = response.data?.data || response.data
          setSubmission(submissionData)
          setLoading(false)

          const userRole = localStorage.getItem('devinsight_role')
          if (userRole === 'CANDIDATE' && submissionData.percentageScore >= 70) {
            setTimeout(() => setShowChatModal(true), 1000)
          }
        }
      } catch (err: any) {
        if (mounted) {
          if (err.response?.status === 404) {
            setError('Submission not found')
          } else if (err.response?.status === 401) {
            api.clearToken()
            navigate('/login')
          } else {
            setError(err.response?.data?.message || 'Failed to load submission results')
          }
          setLoading(false)
        }
      }
    }

    fetchSubmission()
    return () => { mounted = false }
  }, [id, navigate])

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
          <p className="text-slate-400 text-lg">Analyzing your results...</p>
        </motion.div>
      </div>
    )
  }

  if (!submission || error) {
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
          <h2 className="text-2xl font-bold text-white mb-3">Results Not Found</h2>
          <p className="text-slate-400 mb-8">{error || 'The submission results could not be loaded.'}</p>
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

  const isPassed = submission.percentageScore >= 60
  const correctAnswers = submission.results?.filter(r => r.status === 'CORRECT').length || 0
  const partialAnswers = submission.results?.filter(r => r.status === 'PARTIAL').length || 0
  const incorrectAnswers = submission.results?.filter(r => r.status === 'INCORRECT').length || 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        {isPassed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/3 rounded-full blur-[120px]" />
        )}
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/interviews"
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">Interview Results</h1>
                <p className="text-xs text-slate-500">{submission.interviewTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const data = JSON.stringify(submission, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `results-${submission.submissionId}.json`
                  a.click()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl transition-colors border border-white/5"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Score Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Score Ring */}
            <div className="flex justify-center">
              <ScoreRing percentage={submission.percentageScore} />
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Points</p>
                <p className="text-3xl font-bold text-white">
                  {submission.totalScore.toFixed(1)}
                  <span className="text-lg text-slate-500 font-normal ml-1">
                    / {submission.results?.reduce((sum, r) => sum + r.maxPoints, 0) || 0}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Questions Answered</p>
                <p className="text-2xl font-bold text-white">
                  {submission.answeredQuestions}
                  <span className="text-lg text-slate-500 font-normal ml-1">/ {submission.totalQuestions}</span>
                </p>
              </div>
            </div>

            {/* Result Status */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className={`text-7xl mb-4 ${isPassed ? '' : 'grayscale opacity-50'}`}
              >
                {isPassed ? '🎉' : '📚'}
              </motion.div>
              <h2 className={`text-2xl font-bold mb-2 ${isPassed ? 'text-emerald-400' : 'text-slate-300'}`}>
                {isPassed ? 'Congratulations!' : 'Keep Learning'}
              </h2>
              <p className="text-sm text-slate-400">
                {isPassed ? 'You passed this assessment!' : 'Review your answers and try again'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={CheckCircle} label="Correct" value={correctAnswers} color="#10b981" />
          <StatCard icon={AlertCircle} label="Partial" value={partialAnswers} color="#f59e0b" />
          <StatCard icon={XCircle} label="Incorrect" value={incorrectAnswers} color="#ef4444" />
        </div>

        {/* Detailed Results */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Detailed Results
          </h3>

          <div className="space-y-4">
            {submission.results?.map((answer, index) => (
              <motion.div
                key={answer.questionId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl"
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === answer.questionId ? null : answer.questionId)}
                  className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <h4 className="text-white font-semibold">{answer.questionTitle}</h4>
                    </div>

                    <div className="flex items-center gap-4 ml-11">
                      <StatusBadge status={answer.status} />
                      <span className="text-sm text-slate-400">
                        {answer.pointsEarned.toFixed(1)}/{answer.maxPoints} pts
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${answer.similarityScore}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-full rounded-full ${
                              answer.status === 'CORRECT' ? 'bg-emerald-500' :
                              answer.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{answer.similarityScore.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-500">
                    {expandedQuestion === answer.questionId ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedQuestion === answer.questionId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5 overflow-hidden"
                    >
                      <div className="p-5 space-y-4 bg-slate-900/30">
                        {/* AI Feedback */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-white">AI Feedback</span>
                          </div>
                          <p className="text-sm text-slate-300">{answer.feedback}</p>
                        </div>

                        {/* User's Answer */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Your Answer</p>
                          <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 text-sm text-slate-300 max-h-40 overflow-y-auto">
                            {answer.userAnswer || '(No answer provided)'}
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-1">Similarity Score</p>
                            <p className="text-2xl font-bold text-white">{answer.similarityScore.toFixed(1)}%</p>
                          </div>
                          <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-1">Points Earned</p>
                            <p className="text-2xl font-bold text-white">{answer.pointsEarned.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Link
            to="/interviews"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25"
          >
            <RefreshCw className="w-5 h-5" />
            Take Another Interview
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl font-medium transition-colors border border-white/5"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          {submission.percentageScore >= 70 && !hasChatStarted && (
            <button
              onClick={() => setShowChatModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Start HR Chat
            </button>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Understanding Your Results</h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• <strong className="text-slate-300">Similarity Score:</strong> How closely your answer matches the expected response</li>
                <li>• <strong className="text-emerald-400">Correct (≥80%):</strong> Excellent match with expected answer</li>
                <li>• <strong className="text-amber-400">Partial (50-79%):</strong> Some correct elements, but missing details</li>
                <li>• <strong className="text-rose-400">Incorrect (&lt;50%):</strong> Needs improvement</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Chat Modal */}
      {submission && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          interviewId={submission.interviewId}
          interviewScore={submission.percentageScore}
          onChatCompleted={() => {
            setHasChatStarted(true)
            setShowChatModal(false)
          }}
        />
      )}
    </div>
  )
}
