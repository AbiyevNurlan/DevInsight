import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { generateQuestions } from '../../services/aiRecruitmentService';

interface Question {
  id: number;
  category: string;
  subcategory: string;
  difficulty: string;
  questionText: string;
  tags: string[];
  rating: number;
  usageCount: number;
}

interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  skills: string[];
  expectedAnswer?: string;
}

interface CreateQuestionForm {
  category: string;
  subcategory: string;
  difficulty: string;
  questionText: string;
  expectedKeywords: string;
  suggestedDurationMinutes: number;
  tags: string[];
}

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('TECHNICAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [aiForm, setAiForm] = useState({
    jobTitle: '',
    skills: '',
    experienceLevel: 'SENIOR',
    questionCount: 5
  });

  const [formData, setFormData] = useState<CreateQuestionForm>({
    category: 'TECHNICAL',
    subcategory: '',
    difficulty: 'MEDIUM',
    questionText: '',
    expectedKeywords: '',
    suggestedDurationMinutes: 15,
    tags: [],
  });

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/questions?category=${selectedCategory}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.get(`/hr/questions/search?q=${searchQuery}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error searching', error);
    }
  };

  const handleAddQuestion = async () => {
    try {
      await api.post('/hr/questions', formData);
      setShowForm(false);
      setFormData({
        category: 'TECHNICAL',
        subcategory: '',
        difficulty: 'MEDIUM',
        questionText: '',
        expectedKeywords: '',
        suggestedDurationMinutes: 15,
        tags: [],
      });
      await loadQuestions();
    } catch (error) {
      console.error('Error saving question', error);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/hr/questions/${id}`);
        await loadQuestions();
      } catch (error) {
        console.error('Error deleting question', error);
      }
    }
  };

  // AI Question Generation
  const handleGenerateQuestions = async () => {
    if (!aiForm.jobTitle || !aiForm.skills) {
      alert('Please fill in Job Title and Skills');
      return;
    }
    
    setAiLoading(true);
    try {
      const skillsArray = aiForm.skills.split(',').map(s => s.trim()).filter(s => s);
      const response = await generateQuestions(
        aiForm.jobTitle,
        skillsArray,
        aiForm.experienceLevel,
        aiForm.questionCount
      );
      
      if (response.questions) {
        setGeneratedQuestions(response.questions);
      } else if (response.success === false) {
        // Demo questions if API fails
        setGeneratedQuestions([
          { question: `Explain the core concepts of ${aiForm.jobTitle} role`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: skillsArray },
          { question: `How would you handle a challenging project deadline?`, category: 'BEHAVIORAL', difficulty: 'MEDIUM', skills: ['Problem Solving'] },
          { question: `Describe your experience with ${skillsArray[0] || 'relevant technologies'}`, category: 'TECHNICAL', difficulty: 'EASY', skills: skillsArray },
          { question: `Tell me about a time you had to learn a new technology quickly`, category: 'BEHAVIORAL', difficulty: 'MEDIUM', skills: ['Adaptability'] },
          { question: `What's your approach to code review and quality assurance?`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: ['Code Quality'] },
        ].slice(0, aiForm.questionCount));
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Show demo questions on error
      const skillsArray = aiForm.skills.split(',').map(s => s.trim()).filter(s => s);
      setGeneratedQuestions([
        { question: `Explain the core concepts of ${aiForm.jobTitle} role`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: skillsArray },
        { question: `How would you handle a challenging project deadline?`, category: 'BEHAVIORAL', difficulty: 'MEDIUM', skills: ['Problem Solving'] },
        { question: `Describe your experience with ${skillsArray[0] || 'relevant technologies'}`, category: 'TECHNICAL', difficulty: 'EASY', skills: skillsArray },
        { question: `Tell me about a time you had to learn a new technology quickly`, category: 'BEHAVIORAL', difficulty: 'MEDIUM', skills: ['Adaptability'] },
        { question: `What's your approach to code review and quality assurance?`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: ['Code Quality'] },
      ].slice(0, aiForm.questionCount));
    } finally {
      setAiLoading(false);
    }
  };

  const difficultyColor = {
    EASY: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    MEDIUM: 'bg-white/5 text-zinc-300 border border-white/10',
    HARD: 'bg-white/10 text-white border border-white/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-light text-white tracking-tight">📚 Question Bank</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAIGenerator(true); setShowForm(false); }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              🤖 AI Generate
            </button>
            <button
              onClick={() => { setShowForm(true); setShowAIGenerator(false); }}
              className="btn-primary-saas px-6 py-2 text-black font-semibold"
            >
              ➕ Add Question
            </button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white placeholder-zinc-600"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 border border-zinc-700"
          >
            🔍 Search
          </button>
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {['TECHNICAL', 'BEHAVIORAL', 'CASE_STUDY', 'SITUATIONAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm uppercase tracking-wider ${selectedCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* AI Question Generator */}
      {showAIGenerator && (
        <div className="glass-panel p-6 border-l-4 border-purple-500 mb-6">
          <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-2">
            🤖 AI Question Generator
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={aiForm.jobTitle}
                  onChange={(e) => setAiForm({ ...aiForm, jobTitle: e.target.value })}
                  placeholder="e.g., Senior Java Developer"
                  className="w-full px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Experience Level
                </label>
                <select
                  value={aiForm.experienceLevel}
                  onChange={(e) => setAiForm({ ...aiForm, experienceLevel: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                >
                  <option className="bg-zinc-900" value="JUNIOR">Junior (0-2 years)</option>
                  <option className="bg-zinc-900" value="MID">Mid-Level (2-5 years)</option>
                  <option className="bg-zinc-900" value="SENIOR">Senior (5+ years)</option>
                  <option className="bg-zinc-900" value="LEAD">Lead/Principal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Skills * (comma separated)
              </label>
              <input
                type="text"
                value={aiForm.skills}
                onChange={(e) => setAiForm({ ...aiForm, skills: e.target.value })}
                placeholder="e.g., Java, Spring Boot, Microservices, PostgreSQL"
                className="w-full px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Number of Questions: {aiForm.questionCount}
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={aiForm.questionCount}
                onChange={(e) => setAiForm({ ...aiForm, questionCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>3</span>
                <span>15</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleGenerateQuestions}
                disabled={aiLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>✨ Generate Questions</>
                )}
              </button>
              <button
                onClick={() => { setShowAIGenerator(false); setGeneratedQuestions([]); }}
                className="px-6 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 border border-zinc-700"
              >
                ✕ Cancel
              </button>
            </div>
          </div>

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                ✅ Generated {generatedQuestions.length} Questions
              </h3>
              <div className="space-y-3">
                {generatedQuestions.map((q, index) => (
                  <div key={index} className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{q.question}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                            {q.category}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {q.difficulty}
                          </span>
                          {q.skills?.map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-panel p-6 border-l-4 border-white mb-6">
          <h2 className="text-2xl font-light text-white mb-6">➕ Add New Question</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white"
                >
                  <option className="bg-zinc-900">TECHNICAL</option>
                  <option className="bg-zinc-900">BEHAVIORAL</option>
                  <option className="bg-zinc-900">CASE_STUDY</option>
                  <option className="bg-zinc-900">SITUATIONAL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white"
                >
                  <option className="bg-zinc-900">EASY</option>
                  <option className="bg-zinc-900">MEDIUM</option>
                  <option className="bg-zinc-900">HARD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-24"
                placeholder="Enter question..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleAddQuestion}
                className="px-6 py-2 btn-primary-saas text-black font-semibold rounded-lg"
              >
                ✓ Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 border border-zinc-700"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No questions found. Create one!
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="glass-panel p-6 border border-white/5 hover:border-white/20 transition-all duration-300"
            >
              <h3 className="text-lg font-medium text-white mb-3">
                {question.questionText}
              </h3>

              <div className="flex gap-3 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-white/5 text-zinc-300 border border-white/10 text-xs rounded-full font-medium">
                  {question.subcategory}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${difficultyColor[
                    question.difficulty as keyof typeof difficultyColor
                    ]
                    }`}
                >
                  {question.difficulty}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="text-xs text-zinc-500 uppercase tracking-widest">
                  ⭐ {question.rating ? question.rating.toFixed(1) : '-'}/5 • Used{' '}
                  {question.usageCount}x
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs font-medium hover:bg-zinc-700 border border-zinc-700 transition-colors">
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="px-3 py-1.5 bg-zinc-900 text-zinc-500 rounded text-xs font-medium hover:text-red-400 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
