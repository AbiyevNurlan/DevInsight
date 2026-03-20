import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    CORRECT: 'bg-white text-black border-white',
    PARTIAL: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    INCORRECT: 'bg-zinc-900 text-zinc-500 border-zinc-800'
  }

  const icons = {
    CORRECT: '✓',
    PARTIAL: '◐',
    INCORRECT: '✕'
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${colors[status as keyof typeof colors] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
      <span>{icons[status as keyof typeof icons] || status}</span>
      {status}
    </span>
  )
}

const ProgressRing = ({ percentage }: { percentage: number }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = (pct: number) => {
    return '#ffffff'
  }

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-white">{percentage.toFixed(1)}</div>
        <div className="text-xs font-medium text-zinc-400">%</div>
      </div>
    </div>
  )
}

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
        console.log('[SubmissionResults] Loading submission:', id)
        const response = await api.get(`/submissions/${id}`)

        if (mounted) {
          const submissionData = response.data?.data || response.data
          setSubmission(submissionData)
          setLoading(false)

          // Auto-show chat modal if score >= 70% and user is a candidate
          const userRole = localStorage.getItem('devinsight_role')
          if (userRole === 'CANDIDATE' && submissionData.percentageScore >= 70) {
            // Add a small delay for better UX
            setTimeout(() => setShowChatModal(true), 1000)
          }
        }
      } catch (err: any) {
        console.error('[SubmissionResults] Error:', err)
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
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Submission Not Found</h2>
          <p className="text-zinc-400 mb-6">{error || 'The submission results you are looking for do not exist'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Return to Interviews
          </button>
        </div>
      </div>
    )
  }

  const isPassed = submission.percentageScore >= 60
  const correctAnswers = submission.results?.filter(r => r.status === 'CORRECT').length || 0
  const partialAnswers = submission.results?.filter(r => r.status === 'PARTIAL').length || 0
  const incorrectAnswers = submission.results?.filter(r => r.status === 'INCORRECT').length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-white font-medium"
        >
          ← Back to Interviews
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Interview Results</h1>
        <p className="text-zinc-400">{submission.interviewTitle}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm font-medium text-red-400">{error}</p>
        </div>
      )}

      {/* Score Summary Card */}
      {/* Score Summary Card */}
      <div className={`mb-8 glass-panel p-8 border border-white/10 rounded-2xl`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Progress Ring */}
          <div className="flex justify-center">
            <ProgressRing percentage={submission.percentageScore} />
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-3xl font-light text-white">
                {submission.totalScore.toFixed(2)} <span className="text-zinc-500 text-lg">/ {submission.results?.reduce((sum, r) => sum + r.maxPoints, 0) || 0}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">Questions Answered</p>
              <p className="text-2xl font-light text-white">
                {submission.answeredQuestions} <span className="text-zinc-500 text-base">/ {submission.totalQuestions}</span>
              </p>
            </div>
          </div>

          {/* Result Badge */}
          <div className="flex flex-col items-center gap-4">
            <div className={`text-6xl filter grayscale`}>
              {isPassed ? '🎉' : '📚'}
            </div>
            <div className="text-center">
              <h3 className={`text-2xl font-light text-white mb-2`}>
                {isPassed ? 'Great Job!' : 'Keep Practicing'}
              </h3>
              <p className="text-sm text-zinc-400 font-light">
                {isPassed
                  ? 'You passed this interview assessment!'
                  : 'Review the answers below and try again'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Statistics */}
      {/* Answer Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-panel border border-white/10 rounded-xl p-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">Correct</p>
          <p className="text-2xl font-light text-white">{correctAnswers}</p>
        </div>
        <div className="glass-panel border border-white/10 rounded-xl p-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">Partial</p>
          <p className="text-2xl font-light text-white">{partialAnswers}</p>
        </div>
        <div className="glass-panel border border-white/10 rounded-xl p-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">Incorrect</p>
          <p className="text-2xl font-light text-white">{incorrectAnswers}</p>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Detailed Results</h2>

        {submission.results?.map((answer, index) => (
          <div key={answer.questionId} className="bg-zinc-950/40 border border-white/10 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow backdrop-blur-2xl">
            {/* Question Header */}
            <button
              onClick={() => setExpandedQuestion(expandedQuestion === answer.questionId ? null : answer.questionId)}
              className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-white text-black rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{answer.questionTitle}</h3>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-3 ml-11">
                  <StatusBadge status={answer.status} />
                  <span className="text-sm font-medium text-zinc-400">
                    {answer.pointsEarned.toFixed(1)}/{answer.maxPoints} pts
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-zinc-800 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                        style={{ width: `${answer.similarityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 w-10 text-right">
                      {answer.similarityScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Expand Icon */}
              <div className="text-zinc-500">
                <svg
                  className={`w-6 h-6 transition-transform ${expandedQuestion === answer.questionId ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedQuestion === answer.questionId && (
              <div className="border-t border-white/10 px-6 py-4 bg-black/20 space-y-4">
                {/* Feedback */}
                <div className="bg-white/5 border-l-4 border-white/20 p-4 rounded">
                  <p className="text-sm font-medium text-white mb-1">AI Feedback</p>
                  <p className="text-sm text-zinc-300">{answer.feedback}</p>
                </div>

                {/* User's Answer */}
                <div>
                  <p className="text-sm font-semibold text-zinc-400 mb-2">Your Answer</p>
                  <div className="bg-black/20 border border-white/10 rounded p-4 text-sm text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {answer.userAnswer || '(No answer provided)'}
                  </div>
                </div>

                {/* Scoring Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 border border-white/10 rounded p-3">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Similarity Score</p>
                    <p className="text-2xl font-bold text-white">{answer.similarityScore.toFixed(1)}%</p>
                  </div>
                  <div className="bg-black/20 border border-white/10 rounded p-3">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Points Earned</p>
                    <p className="text-2xl font-bold text-white">{answer.pointsEarned.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex-1 px-6 py-3 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg transition-colors border-none"
        >
          Take Another Interview
        </button>
        <button
          onClick={() => {
            const data = JSON.stringify(submission, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `submission-${submission.submissionId}.json`
            a.click()
          }}
          className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors"
        >
          Download Results
        </button>
        {submission.percentageScore >= 70 && !hasChatStarted && (
          <button
            onClick={() => setShowChatModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start HR Chat 💬
          </button>
        )}
      </div>

      {/* Congratulations message for passed interviews */}
      {isPassed && (
        <div className="mt-6 glass-panel border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Congratulations! You passed the interview!
              </h3>
              <p className="text-blue-700">
                Since you scored {submission.percentageScore.toFixed(1)}%, you're eligible for a quick HR chat to discuss next steps.
                {!hasChatStarted && " Click 'Start HR Chat' to begin!"}
                {hasChatStarted && " Great job completing the HR chat!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <p className="font-medium mb-2">💡 Understanding Your Results:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Similarity Score:</strong> Percentage match between your answer and the correct answer (Levenshtein + keyword matching)</li>
          <li><strong>Correct (≥80%):</strong> Your answer matches the expected response very closely</li>
          <li><strong>Partial (50-79%):</strong> Your answer has some correct elements but is missing important details</li>
          <li><strong>Incorrect (&lt;50%):</strong> Your answer does not match the expected response</li>
        </ul>
      </div>

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
