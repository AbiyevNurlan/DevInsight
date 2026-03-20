import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService, { CreateQuestionRequest } from '../../services/questionService';

const AddQuestion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateQuestionRequest>({
    title: '',
    description: '',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    tags: [],
    options: ['', '', '', ''],
    correctAnswer: '',
    maxPoints: 10,
    timeLimit: 300,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Question title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Question description is required');
      }

      if (formData.type === 'MULTIPLE_CHOICE') {
        if (!formData.options || formData.options.filter(o => o.trim()).length < 2) {
          throw new Error('At least 2 options are required for multiple choice questions');
        }
        if (!formData.correctAnswer || !formData.correctAnswer.trim()) {
          throw new Error('Correct answer is required for multiple choice questions');
        }
      }

      await questionService.createQuestion(formData);
      setSuccess('Question created successfully!');

      // Reset form
      setTimeout(() => {
        navigate('/admin/questions');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] py-8 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-8 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="mb-8 relative z-10">
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Add New Question</h1>
            <p className="text-white/60 mt-2 font-medium">Create a new challenge for the interview bank</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl backdrop-blur-sm">
              <span className="flex items-center gap-2"><span className="text-lg">⚠️</span> {error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-900/20 border border-green-500/30 text-green-200 px-6 py-4 rounded-xl backdrop-blur-sm">
              <span className="flex items-center gap-2"><span className="text-lg">✅</span> {success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Question Title <span className="text-neon-cyan">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter question title"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md"
                required
              />
            </div>

            {/* Question Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Question Description <span className="text-neon-cyan">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed question description"
                rows={4}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md"
                required
              />
            </div>

            {/* Question Type & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Question Type <span className="text-neon-cyan">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md appearance-none"
                >
                  <option value="MULTIPLE_CHOICE" className="bg-zinc-900">Multiple Choice</option>
                  <option value="CODING" className="bg-zinc-900">Coding</option>
                  <option value="BEHAVIORAL" className="bg-zinc-900">Behavioral</option>
                  <option value="SYSTEM_DESIGN" className="bg-zinc-900">System Design</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md appearance-none"
                >
                  <option value="EASY" className="bg-zinc-900">Easy</option>
                  <option value="MEDIUM" className="bg-zinc-900">Medium</option>
                  <option value="HARD" className="bg-zinc-900">Hard</option>
                </select>
              </div>
            </div>

            {/* Multiple Choice Options */}
            {formData.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <h3 className="font-semibold text-white text-lg mb-2">Multiple Choice Options</h3>

                {formData.options?.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Option {index + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Enter option ${index + 1}`}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300"
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="correctAnswer" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                    Correct Answer <span className="text-neon-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    id="correctAnswer"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    placeholder="Enter the correct answer"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Coding Question Fields */}
            {formData.type === 'CODING' && (
              <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <h3 className="font-semibold text-white text-lg">Coding Question Details</h3>

                <div>
                  <label htmlFor="programmingLanguage" className="block text-sm font-medium text-white/70 mb-2">
                    Programming Language
                  </label>
                  <select
                    id="programmingLanguage"
                    name="programmingLanguage"
                    value={formData.programmingLanguage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md appearance-none"
                  >
                    <option value="" className="bg-zinc-900">Select language</option>
                    <option value="java" className="bg-zinc-900">Java</option>
                    <option value="python" className="bg-zinc-900">Python</option>
                    <option value="javascript" className="bg-zinc-900">JavaScript</option>
                    <option value="typescript" className="bg-zinc-900">TypeScript</option>
                    <option value="cpp" className="bg-zinc-900">C++</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="starterCode" className="block text-sm font-medium text-white/70 mb-2">
                    Starter Code
                  </label>
                  <textarea
                    id="starterCode"
                    name="starterCode"
                    value={formData.starterCode}
                    onChange={handleInputChange}
                    placeholder="Enter starter code template"
                    rows={6}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 font-mono text-sm transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Behavioral Question Fields */}
            {formData.type === 'BEHAVIORAL' && (
              <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <h3 className="font-semibold text-white text-lg">Behavioral Question Details</h3>

                <div>
                  <label htmlFor="evaluationCriteria" className="block text-sm font-medium text-white/70 mb-2">
                    Evaluation Criteria
                  </label>
                  <textarea
                    id="evaluationCriteria"
                    name="evaluationCriteria"
                    value={formData.evaluationCriteria}
                    onChange={handleInputChange}
                    placeholder="What should evaluators look for in the answer?"
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                onChange={handleTagsChange}
                placeholder="e.g., algorithms, data structures, arrays"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md"
              />
            </div>

            {/* Scoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxPoints" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Max Points
                </label>
                <input
                  type="number"
                  id="maxPoints"
                  name="maxPoints"
                  value={formData.maxPoints}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md"
                />
              </div>

              <div>
                <label htmlFor="timeLimit" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                  Time Limit (seconds)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  min="60"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Interview ID (Optional) */}
            <div>
              <label htmlFor="interviewId" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Associate with Interview (Optional)
              </label>
              <input
                type="number"
                id="interviewId"
                name="interviewId"
                value={formData.interviewId || ''}
                onChange={handleInputChange}
                placeholder="Enter interview ID to associate this question"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-0 focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-white placeholder-white/30 transition-all duration-300 backdrop-blur-md"
              />
              <p className="mt-1 text-sm text-white/50">
                Leave empty to create a standalone question
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white py-4 px-6 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-white/10 tracking-widest uppercase text-sm"
              >
                {loading ? 'Creating...' : 'Create Question'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/questions')}
                className="px-8 py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 text-white transition-all duration-300 backdrop-blur-md uppercase tracking-widest text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
