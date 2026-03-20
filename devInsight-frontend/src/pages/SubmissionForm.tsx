import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Clock, CheckCircle2, Circle } from 'lucide-react'
import api from '../services/api'

// Types
interface Question {
  id: number
  text: string
  type: 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE'
  options?: string[]
  points?: number
}

interface SubmissionData {
  interviewId: number
  answers: {
    questionId: number
    answer: string
  }[]
}

interface SubmissionResponse {
  id: number
  status: string
  score?: number
  feedback?: string
}

export default function SubmissionForm() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SubmissionResponse | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [interviewTitle, setInterviewTitle] = useState<string>('')
  const [autoSaving, setAutoSaving] = useState(false)

  const isLoggedIn = !!api.getToken()
  const currentQuestion = questions[currentQuestionIndex]

  // Load interview questions
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } })
      return
    }

    if (!interviewId) {
      setError('Interview ID is required')
      setLoading(false)
      return
    }

    let mounted = true

    async function loadInterview() {
      try {
        const response = await api.get(`/interviews/${interviewId}`)
        const interview = response.data?.data || response.data

        if (mounted) {
          setInterviewTitle(interview.title || 'Interview')
          setQuestions(interview.questions || [])
          if (interview.duration) {
            setTimeRemaining(interview.duration * 60)
          }
          setLoading(false)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.data?.message || 'Failed to load interview')
          setLoading(false)
        }
      }
    }

    loadInterview()

    return () => { mounted = false }
  }, [interviewId, isLoggedIn, navigate, location])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmit(new Event('submit') as any, true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeRemaining])

  // Auto-save indicator
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setAutoSaving(true)
      const timer = setTimeout(() => {
        setAutoSaving(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [answers])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent, isAutoSubmit = false) => {
    if (e) e.preventDefault()
    if (!interviewId) return

    // Validate
    const unansweredCount = questions.filter(q => !answers[q.id]?.trim()).length
    if (unansweredCount > 0 && !isAutoSubmit) {
      const confirmSubmit = window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)
      if (!confirmSubmit) return
    }

    setSubmitting(true)

    try {
      const submissionData: SubmissionData = {
        interviewId: parseInt(interviewId),
        answers: questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] || ''
        }))
      }

      const response = await api.post('/submissions/start', submissionData)
      setSuccess(response.data?.data || response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate progress
  const progressPercentage = questions.length > 0
    ? ((Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length) / questions.length) * 100
    : 0
  const answeredCount = Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length

  // Timer color logic
  const getTimerColor = () => {
    if (!timeRemaining) return 'text-apple-primary'
    const minutes = Math.floor(timeRemaining / 60)
    if (minutes <= 5) return 'text-red-500'
    if (minutes <= 15) return 'text-amber-500'
    return 'text-apple-primary'
  }

  if (loading) {
    return (
      <div className="exam-page-container flex items-center justify-center min-h-screen">
        <div className="text-apple-secondary text-lg">Loading examination...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="exam-page-container flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="glass-card p-12 max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-apple-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-apple-accent" />
          </div>
          <h1 className="text-3xl font-semibold text-apple-primary mb-3">Submitted Successfully!</h1>
          <p className="text-apple-secondary mb-8 text-lg">Your interview has been recorded.</p>
          {success.score !== undefined && (
            <div className="mb-8">
              <div className="text-6xl font-semibold text-apple-accent tracking-tight mb-2">{success.score}%</div>
              <div className="text-sm text-apple-tertiary uppercase tracking-wider">Score</div>
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary-saas w-full"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="exam-page-container min-h-screen flex bg-apple-bg-primary">
      {/* LEFT SIDEBAR */}
      <aside className="exam-sidebar w-80 flex-shrink-0 border-r border-apple-border bg-apple-bg-secondary">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-apple-border">
            <h1 className="text-lg font-semibold text-apple-primary mb-1 truncate">{interviewTitle}</h1>
            <p className="text-sm text-apple-secondary">Interview Examination</p>
          </div>

          {/* Timer */}
          {timeRemaining !== null && (
            <div className="p-6 border-b border-apple-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-apple-secondary uppercase tracking-wider">Time Remaining</span>
                <Clock size={16} className="text-apple-tertiary" />
              </div>
              <div className={`exam-timer-large ${getTimerColor()} font-mono font-semibold`}>
                {formatTime(timeRemaining)}
              </div>
              {timeRemaining <= 300 && (
                <p className="text-xs text-amber-500 mt-2 animate-pulse">Time is running low!</p>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="p-6 border-b border-apple-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-apple-secondary uppercase tracking-wider">Progress</span>
              <span className="text-sm font-semibold text-apple-primary">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="exam-progress-bar-large mb-2">
              <motion.div
                className="exam-progress-fill-large"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
            <p className="text-xs text-apple-tertiary">
              {answeredCount} of {questions.length} answered
            </p>
          </div>

          {/* Auto-save Indicator */}
          <div className="px-6 py-3 border-b border-apple-border">
            <div className="flex items-center gap-2">
              {autoSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-xs text-amber-500 font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} className="text-apple-accent" />
                  <span className="text-xs text-apple-tertiary">Saved</span>
                </>
              )}
            </div>
          </div>

          {/* Question List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-apple-secondary uppercase tracking-wider mb-3 px-2">
              Questions
            </h3>
            <div className="space-y-2">
              {questions.map((question, index) => {
                const isAnswered = !!answers[question.id]?.trim()
                const isCurrent = index === currentQuestionIndex
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3
                      ${isCurrent 
                        ? 'bg-apple-accent/20 border-2 border-apple-accent' 
                        : 'bg-apple-bg-tertiary border-2 border-transparent hover:border-apple-border hover:bg-apple-bg-tertiary/80'
                      }
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold
                      ${isCurrent 
                        ? 'bg-apple-accent text-white' 
                        : isAnswered 
                          ? 'bg-apple-accent/20 text-apple-accent' 
                          : 'bg-apple-bg-secondary text-apple-tertiary'
                      }
                    `}>
                      {isAnswered ? <Check size={14} /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        text-sm font-medium truncate
                        ${isCurrent ? 'text-apple-primary' : isAnswered ? 'text-apple-secondary' : 'text-apple-tertiary'}
                      `}>
                        Question {index + 1}
                      </div>
                      {question.points && (
                        <div className="text-xs text-apple-tertiary mt-0.5">{question.points} pts</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-apple-bg-primary">
        {/* Top Progress Bar */}
        <div className="h-1 bg-apple-bg-secondary">
          <motion.div
            className="h-full bg-apple-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Question Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-apple-accent/20 text-apple-accent text-lg font-bold border-2 border-apple-accent/30">
                      {currentQuestionIndex + 1}
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-apple-secondary uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </h2>
                      {currentQuestion?.points && (
                        <p className="text-xs text-apple-tertiary mt-0.5">{currentQuestion.points} points</p>
                      )}
                    </div>
                  </div>

                  {/* Question Text - EXTRA LARGE */}
                  <h1 className="exam-question-title">
                    {currentQuestion?.text}
                  </h1>
                </div>

                {/* Answer Section */}
                <div className="mt-10">
                  {currentQuestion?.type === 'MULTIPLE_CHOICE' && currentQuestion.options ? (
                    <div className="space-y-5">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = answers[currentQuestion.id] === option
                        return (
                          <motion.label
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`
                              exam-answer-card block cursor-pointer
                              ${isSelected ? 'exam-answer-card-selected' : ''}
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`
                                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all
                                ${isSelected 
                                  ? 'border-apple-accent bg-apple-accent' 
                                  : 'border-apple-border bg-transparent'
                                }
                              `}>
                                {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                              </div>
                              <input
                                type="radio"
                                name={`q-${currentQuestion.id}`}
                                value={option}
                                checked={isSelected}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="hidden"
                              />
                              <span className="exam-answer-text flex-1">{option}</span>
                            </div>
                          </motion.label>
                        )
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[currentQuestion?.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={
                        currentQuestion?.type === 'CODE' 
                          ? "// Write your code here..." 
                          : "Type your answer here. Be detailed and comprehensive..."
                      }
                      className={`
                        exam-textarea-large
                        ${currentQuestion?.type === 'CODE' ? 'exam-code-textarea' : ''}
                      `}
                      spellCheck={currentQuestion?.type !== 'CODE'}
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="border-t border-apple-border bg-apple-bg-secondary px-8 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="exam-nav-button exam-nav-button-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="text-sm text-apple-tertiary">
              {currentQuestionIndex + 1} / {questions.length}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={(e) => handleSubmit(e as any)}
                disabled={submitting}
                className="exam-nav-button exam-nav-button-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Examination'}
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="exam-nav-button exam-nav-button-primary"
              >
                <span>Next Question</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  )
}
