import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import questionService, { QuestionResponse, CreateQuestionRequest } from '../../services/questionService'

const EditQuestion: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<CreateQuestionRequest>({
    title: '',
    description: '',
    type: 'CODING',
    difficulty: 'MEDIUM',
    tags: [],
    maxPoints: 10,
    timeLimit: 300,
  })

  useEffect(() => {
    if (!id) {
      setError('Question ID is required')
      setLoading(false)
      return
    }

    const fetchQuestion = async () => {
      try {
        const data = await questionService.getQuestionById(Number(id))
        setFormData({
          title: data.title,
          description: data.description,
          type: data.type as 'CODING' | 'BEHAVIORAL' | 'MULTIPLE_CHOICE' | 'SYSTEM_DESIGN',
          difficulty: (data.difficulty || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD',
          tags: data.tags || [],
          programmingLanguage: data.programmingLanguage,
          starterCode: data.starterCode,
          solution: data.solution,
          testCases: data.testCases,
          evaluationCriteria: data.evaluationCriteria,
          maxPoints: data.maxPoints,
          timeLimit: data.timeLimit,
        })
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load question')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxPoints' || name === 'timeLimit' ? Number(value) : value
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    try {
      setSaving(true)
      await questionService.updateQuestion(Number(id), formData)
      navigate('/admin/questions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update question')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/admin/questions" className="text-zinc-400 hover:text-white mb-6 inline-block">
        ← Back to Questions
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Question</h1>

        {error && (
          <div className="mb-6 bg-zinc-900 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-600">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CODING">Coding</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="SYSTEM_DESIGN">System Design</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty || 'MEDIUM'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Max Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Points</label>
            <input
              type="number"
              name="maxPoints"
              value={formData.maxPoints || 10}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Limit (in seconds) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit ? Math.floor(formData.timeLimit / 60) : 5}
              onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: Number(e.target.value) * 60 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="java, oop, inheritance"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Programming Language (for CODING type) */}
          {formData.type === 'CODING' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
              <input
                type="text"
                value={formData.programmingLanguage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, programmingLanguage: e.target.value }))}
                placeholder="e.g., Java, Python, JavaScript"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Solution (for CODING type) */}
          {formData.type === 'CODING' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Solution Code</label>
              <textarea
                value={formData.solution || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                placeholder="Enter the solution code..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          )}

          {/* Options (for MULTIPLE_CHOICE type) */}
          {formData.type === 'MULTIPLE_CHOICE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options (one per line)</label>
              <textarea
                value={formData.options?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  options: e.target.value.split('\n').filter(opt => opt.trim())
                }))}
                placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Correct Answer (for MULTIPLE_CHOICE type) */}
          {formData.type === 'MULTIPLE_CHOICE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer <span className="text-red-600">*</span>
              </label>
              {formData.options && formData.options.length > 0 ? (
                <select
                  value={formData.correctAnswer || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select the correct answer --</option>
                  {formData.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.correctAnswer || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Enter the correct answer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              {formData.options && formData.options.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">Selected: {formData.correctAnswer || 'None'}</p>
              )}
            </div>
          )}

          {/* Correct Answer (for TEXT/BEHAVIORAL type) */}
          {(formData.type === 'BEHAVIORAL' || formData.type === 'SYSTEM_DESIGN') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Answer / Solution</label>
              <textarea
                value={formData.solution || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                placeholder="Enter the expected answer or solution for grading reference..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Evaluation Criteria (for BEHAVIORAL type) */}
          {formData.type === 'BEHAVIORAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Criteria</label>
              <textarea
                value={formData.evaluationCriteria || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluationCriteria: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to="/admin/questions"
              className="flex-1 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 text-center font-semibold"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditQuestion
