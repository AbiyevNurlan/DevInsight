import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface InterviewQuestion {
  id: number
  title: string
  description: string
  type: string
  difficulty?: string
}

interface Interview {
  id: number
  title: string
  description?: string
  duration?: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  questionCount?: number
  isPublic?: boolean
  instructions?: string
  questions?: InterviewQuestion[]
}

export default function InterviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isLoggedIn = !!api.getToken()

  useEffect(() => {
    if (!id) {
      setError('Interview ID is required')
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchInterview() {
      try {
        console.log('[InterviewDetail] Loading interview:', id)
        const response = await api.get(`/interviews/${id}`)

        if (mounted) {
          setInterview(response.data?.data || response.data)
          setLoading(false)
        }
      } catch (err: any) {
        console.error('[InterviewDetail] Error:', err)

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

    return () => {
      mounted = false
    }
  }, [id, navigate])

  // Get difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-zinc-800 text-zinc-300 border border-zinc-700'
      case 'MEDIUM': return 'bg-white/10 text-white border border-white/20'
      case 'HARD': return 'bg-white/20 text-white border border-white/30'
      default: return 'bg-zinc-900 text-zinc-500 border border-zinc-800'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="glass-panel p-8 animate-pulse">
            <div className="h-8 bg-slate-900/70 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-slate-900/70 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-900/70 rounded w-3/4 mb-6"></div>
            <div className="flex gap-2 mb-6">
              <div className="h-6 bg-slate-900/70 rounded w-20"></div>
              <div className="h-6 bg-slate-900/70 rounded w-24"></div>
            </div>
            <div className="h-12 bg-slate-900/70 rounded w-40"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[70vh] py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="glass-panel border border-rose-500/60 p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-rose-100 mb-2">Error</h2>
            <p className="text-rose-100/80 mb-6">{error}</p>
            <Link
              to="/interviews"
              className="inline-block btn-primary-neo px-6 py-3 text-sm font-semibold"
            >
              Back to Interviews
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not found
  if (!interview) {
    return (
      <div className="min-h-[70vh] py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-slate-50 mb-4">Interview not found</h2>
          <Link to="/interviews" className="text-sky-300 hover:underline">
            Back to Interviews
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back link */}
        <Link
          to="/interviews"
          className="inline-flex items-center text-sky-300 hover:text-sky-200 mb-6"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Interviews
        </Link>

        {/* Interview Card */}
        <div className="glass-panel overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
            <h1 className="text-3xl font-semibold text-slate-50 mb-2">{interview.title}</h1>
            <div className="flex flex-wrap gap-3">
              {interview.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(interview.difficulty)}`}>
                  {interview.difficulty}
                </span>
              )}
              {interview.questionCount && (
                <span className="px-3 py-1 bg-white/5 text-zinc-300 border border-white/10 rounded-full text-xs font-medium">
                  {interview.questionCount} Questions
                </span>
              )}
              {interview.duration && (
                <span className="px-3 py-1 bg-white/5 text-zinc-300 border border-white/10 rounded-full text-xs font-medium">
                  ⏱️ {interview.duration} min
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-2">Description</h2>
              <p className="text-slate-300 leading-relaxed">
                {interview.description || 'No description provided.'}
              </p>
            </div>

            {/* Instructions */}
            {interview.instructions && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-50 mb-2">Instructions</h2>
                <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                  <p className="text-zinc-300 font-light">{interview.instructions}</p>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900/80 rounded-lg p-4 text-center border border-slate-800/80">
                <p className="text-sm text-slate-400 mb-1">Duration</p>
                <p className="text-xl font-bold text-slate-50">
                  {interview.duration ? `${interview.duration} min` : 'Unlimited'}
                </p>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-4 text-center border border-slate-800/80">
                <p className="text-sm text-slate-400 mb-1">Questions</p>
                <p className="text-xl font-bold text-slate-50">
                  {interview.questionCount || '—'}
                </p>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-4 text-center border border-slate-800/80">
                <p className="text-sm text-slate-400 mb-1">Visibility</p>
                <p className="text-xl font-bold text-slate-50">
                  {interview.isPublic ? '🌐 Public' : '🔒 Private'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isLoggedIn ? (
                <Link
                  to={`/interview/${id}/submit`}
                  className="flex-1 btn-primary-saas px-8 py-4 text-sm font-semibold text-center text-black"
                >
                  🚀 Start Interview
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg text-center transition-colors"
                >
                  Login to Start
                </Link>
              )}
              <Link
                to="/interviews"
                className="px-8 py-4 border-2 border-slate-700 text-slate-200 hover:bg-slate-900 font-semibold rounded-lg text-center transition-colors"
              >
                View All Interviews
              </Link>
            </div>

            {/* Questions Section */}
            {interview.questions && interview.questions.length > 0 && (
              <div className="mt-10 pt-10 border-t-2 border-slate-800/80">
                <h2 className="text-2xl font-semibold text-slate-50 mb-6">📋 Questions ({interview.questions.length})</h2>
                <div className="space-y-4">
                  {interview.questions.map((question, idx) => (
                    <div key={question.id} className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-4 hover:border-sky-400/70 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-slate-50">
                              {idx + 1}. {question.title}
                            </span>
                            <span className="inline-block px-2 py-1 bg-white/5 text-zinc-300 border border-white/10 text-xs font-medium rounded">
                              {question.type}
                            </span>
                            {question.difficulty && (
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${question.difficulty === 'EASY' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' :
                                  question.difficulty === 'MEDIUM' ? 'bg-white/10 text-white border border-white/20' :
                                    'bg-white/20 text-white border border-white/30'
                                }`}>
                                {question.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm">{question.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
