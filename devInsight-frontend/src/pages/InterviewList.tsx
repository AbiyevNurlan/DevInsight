import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Map,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  Settings
} from 'lucide-react'
import api from '../services/api'

interface Interview {
  id: number
  title: string
  description?: string
  isPublic?: boolean
  duration?: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  questionCount?: number
  createdAt?: string
}

export default function InterviewList() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isLoggedIn = !!api.getToken()

  useEffect(() => {
    let mounted = true

    async function fetchInterviews() {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await api.get('/interviews')
        if (mounted) {
          const data = response.data?.data || response.data || []
          setInterviews(Array.isArray(data) ? data : [])
        }
      } catch (err: any) {
        if (mounted) {
          if (err.response?.status === 401) {
            api.clearToken()
            navigate('/login')
          } else {
            setError(err.response?.data?.message || 'Failed to load interviews.')
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchInterviews()
    return () => { mounted = false }
  }, [isLoggedIn, navigate])

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'EASY': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
      case 'MEDIUM': return 'text-white bg-white/10 border-white/20'
      case 'HARD': return 'text-white bg-white/20 border-white/30'
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-text-secondary max-w-lg mb-8">
          Access the full interview library, track your progress, and get analytics insights by signing in.
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="btn-primary-neo px-8 py-3 rounded-xl">Sign In</Link>
          <Link to="/register" className="px-8 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-colors">Create Account</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Interviews</h1>
          <p className="text-text-secondary mt-1">
            {loading ? 'Loading...' : `Found ${interviews.length} available interviews`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search interviews..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && interviews.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {interviews.map(interview => (
            <motion.div key={interview.id} variants={itemAnim}>
              <div className="group h-full glass-panel rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col">
                {/* Card Content */}
                <Link to={`/interviews/${interview.id}`} className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(interview.difficulty)}`}>
                      {interview.difficulty || 'GENERAL'}
                    </div>
                    {interview.isPublic ? (
                      <Unlock size={16} className="text-text-muted" />
                    ) : (
                      <Lock size={16} className="text-text-muted" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {interview.title}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-3 mb-6">
                    {interview.description || 'Test your skills with this technical interview challenge.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    {interview.questionCount && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>{interview.questionCount} Questions</span>
                      </div>
                    )}
                    {interview.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{interview.duration}m</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">
                    Created {new Date(interview.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2">
                    {localStorage.getItem('devinsight_role') === 'HR' && (
                      <Link
                        to={`/interviews/${interview.id}/manage`}
                        className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Manage Interview"
                      >
                        <Settings size={16} />
                      </Link>
                    )}
                    <Link
                      to={`/interviews/${interview.id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
                    >
                      Start
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && interviews.length === 0 && !error && (
        <div className="text-center py-20 px-4 glass-panel rounded-3xl border-dashed border-2 border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Interviews Found</h3>
          <p className="text-text-secondary">
            It seems there are no interviews available right now.
          </p>
        </div>
      )}
    </div>
  )
}
