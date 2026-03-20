import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface Question {
  id: number
  title: string
  description: string
  type: 'CODING' | 'BEHAVIORAL' | 'MULTIPLE_CHOICE'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  maxPoints?: number
  timeLimit?: number
}

interface Interview {
  id: number
  title: string
  description?: string
  level?: string
  type?: string
  durationMinutes?: number
  passingScore?: number
  questions?: Question[]
  isPublic?: boolean
  status?: string
}

const InterviewManager: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [interview, setInterview] = useState<Interview | null>(null)
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])

  useEffect(() => {
    if (id) {
      loadInterviewAndQuestions()
    }
  }, [id])

  const loadInterviewAndQuestions = async () => {
    try {
      setLoading(true)
      const [interviewRes, questionsRes] = await Promise.all([
        api.get(`/interviews/${id}`),
        api.get('/questions')
      ])

      const interviewData = interviewRes.data?.data || interviewRes.data
      const questionsData = questionsRes.data?.data || questionsRes.data

      setInterview(interviewData)
      setAvailableQuestions(questionsData)
      setSelectedQuestions(interviewData.questions?.map((q: Question) => q.id) || [])
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError('Failed to load interview data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (questionId: number) => {
    try {
      await api.post(`/interviews/${id}/questions/${questionId}`)
      setSelectedQuestions([...selectedQuestions, questionId])

      // Refresh interview data
      const res = await api.get(`/interviews/${id}`)
      setInterview(res.data?.data || res.data)

      // Close modal if all questions added
      if (selectedQuestions.length + 1 === availableQuestions.length) {
        setShowAddModal(false)
      }
    } catch (err: any) {
      console.error('Error adding question:', err)
      setError('Failed to add question')
    }
  }

  const handleRemoveQuestion = async (questionId: number) => {
    try {
      await api.delete(`/interviews/${id}/questions/${questionId}`)
      setSelectedQuestions(selectedQuestions.filter(q => q !== questionId))

      // Refresh interview data
      const res = await api.get(`/interviews/${id}`)
      setInterview(res.data?.data || res.data)
    } catch (err: any) {
      console.error('Error removing question:', err)
      setError('Failed to remove question')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
      case 'MEDIUM':
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700'
      case 'HARD':
        return 'bg-white/10 text-white border border-white/20'
      default:
        return 'bg-zinc-900 text-zinc-500 border border-zinc-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CODING':
        return 'bg-white/5 text-zinc-300 border border-white/10'
      case 'BEHAVIORAL':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
      case 'MULTIPLE_CHOICE':
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700'
      default:
        return 'bg-zinc-900 text-zinc-500 border border-zinc-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview not found</h2>
        <button
          onClick={() => navigate('/interviews')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Interviews
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/interviews')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{interview.title}</h1>
          <p className="text-gray-600 mt-2">{interview.description}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Interview Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-lg font-semibold text-gray-900">{interview.level || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="text-lg font-semibold text-gray-900">{interview.type || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {interview.durationMinutes ? `${interview.durationMinutes} min` : 'Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900">{interview.status || 'DRAFT'}</p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <span>+</span> Add Question
            </button>
          </div>

          {interview.questions && interview.questions.length > 0 ? (
            <div className="space-y-4">
              {interview.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{question.description}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                      {question.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    {question.maxPoints && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {question.maxPoints} pts
                      </span>
                    )}
                    {question.timeLimit && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        ⏱️ {question.timeLimit}s
                      </span>
                    )}
                  </div>

                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {question.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-white/5 text-zinc-400 border border-white/10 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No questions added yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Your First Question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Questions to Interview</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {availableQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No questions available</p>
                </div>
              ) : (
                availableQuestions
                  .filter((q) => !selectedQuestions.includes(q.id))
                  .map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{question.description}</p>
                        </div>
                        <button
                          onClick={() => handleAddQuestion(question.id)}
                          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                          {question.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewManager
