import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import questionService, { QuestionResponse } from '../../services/questionService'

const QuestionView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [question, setQuestion] = useState<QuestionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Question ID is required')
      setLoading(false)
      return
    }

    const fetchQuestion = async () => {
      try {
        const data = await questionService.getQuestionById(Number(id))
        setQuestion(data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load question')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [id])

  const getTypeColor = (type: string) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'CODING': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
        case 'MULTIPLE_CHOICE': return 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
        case 'BEHAVIORAL': return 'text-pink-400 bg-pink-500/10 border border-pink-500/30'
        case 'SYSTEM_DESIGN': return 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/30'
        default: return 'text-white/50 bg-white/5 border border-white/10'
      }
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    const getDifficultyColor = (difficulty?: string) => {
      switch (difficulty) {
        case 'EASY': return 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        case 'MEDIUM': return 'text-neon-purple bg-neon-purple/10 border border-neon-purple/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
        case 'HARD': return 'text-neon-blue bg-neon-blue/10 border border-neon-blue/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
        default: return 'text-white/50 bg-white/5 border border-white/10'
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
          {error}
        </div>
        <Link to="/admin/questions" className="mt-4 text-neon-cyan hover:text-white transition-colors">
          ← Back to Questions
        </Link>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center text-white">
        <p className="text-white/50">Question not found</p>
        <Link to="/admin/questions" className="mt-4 text-neon-cyan hover:text-white transition-colors">
          ← Back to Questions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/admin/questions" className="text-neon-cyan hover:text-white mb-6 inline-block transition-colors font-medium">
        ← Back to Questions
      </Link>

      <div className="glass-panel p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{question.title}</h1>
            <Link
              to={`/admin/questions/${question.id}/edit`}
              className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10 font-bold tracking-wide transition-all"
            >
              Edit
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(question.type)}`}>
              {question.type}
            </span>
            {question.difficulty && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
          <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{question.description}</p>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-colors">
            <p className="text-sm text-neon-cyan/70 font-semibold mb-1">Created By</p>
            <p className="font-bold text-white">{question.createdByName}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-colors">
            <p className="text-sm text-neon-cyan/70 font-semibold mb-1">Max Points</p>
            <p className="font-bold text-white">{question.maxPoints || 'N/A'}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-colors">
            <p className="text-sm text-neon-cyan/70 font-semibold mb-1">Time Limit</p>
            <p className="font-bold text-white">
              {question.timeLimit ? `${Math.floor(question.timeLimit / 60)} min` : 'N/A'}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-colors">
            <p className="text-sm text-neon-cyan/70 font-semibold mb-1">Created</p>
            <p className="font-bold text-white">{new Date(question.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/5 text-neon-cyan text-sm rounded border border-white/10 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Programming Language */}
        {question.programmingLanguage && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-2">Programming Language</h3>
            <p className="text-white/80 font-mono bg-black/30 inline-block px-2 py-1 rounded border border-white/10">{question.programmingLanguage}</p>
          </div>
        )}

        {/* Evaluation Criteria */}
        {question.evaluationCriteria && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-2">Evaluation Criteria</h3>
            <p className="text-zinc-300 whitespace-pre-wrap">{question.evaluationCriteria}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Link
            to={`/admin/questions/${question.id}/edit`}
            className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all font-bold"
          >
            Edit Question
          </Link>
          <Link
            to="/admin/questions"
            className="px-6 py-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 border border-white/5 hover:text-white transition-colors"
          >
            Back to List
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuestionView
