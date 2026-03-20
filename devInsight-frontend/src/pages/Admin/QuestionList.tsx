import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Code2,
  ListChecks,
  MessageSquare,
  Layout,
  Clock,
  Target,
  User,
  Sparkles,
  X
} from 'lucide-react';
import questionService, { QuestionResponse } from '../../services/questionService';
import { generateQuestions } from '../../services/aiRecruitmentService';

interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  skills: string[];
  expectedAnswer?: string;
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Generator states
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [aiForm, setAiForm] = useState({
    jobTitle: '',
    skills: '',
    experienceLevel: 'SENIOR',
    questionCount: 5
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionService.getAllQuestions();
      setQuestions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await questionService.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete question');
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
      } else {
        // Demo questions
        setGeneratedQuestions(createDemoQuestions(skillsArray));
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      const skillsArray = aiForm.skills.split(',').map(s => s.trim()).filter(s => s);
      setGeneratedQuestions(createDemoQuestions(skillsArray));
    } finally {
      setAiLoading(false);
    }
  };

  const createDemoQuestions = (skillsArray: string[]): GeneratedQuestion[] => {
    return [
      { question: `Explain the core principles of ${aiForm.jobTitle} and how they apply to enterprise applications.`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: skillsArray },
      { question: `Describe a challenging ${skillsArray[0] || 'technical'} problem you solved and your approach.`, category: 'BEHAVIORAL', difficulty: 'MEDIUM', skills: ['Problem Solving'] },
      { question: `How would you design a scalable system using ${skillsArray.slice(0, 2).join(' and ')}?`, category: 'SYSTEM_DESIGN', difficulty: 'HARD', skills: skillsArray },
      { question: `What are the best practices for testing in ${skillsArray[0] || 'your technology stack'}?`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: skillsArray },
      { question: `Tell me about a time you had to learn a new technology quickly for a project.`, category: 'BEHAVIORAL', difficulty: 'EASY', skills: ['Adaptability'] },
      { question: `How do you ensure code quality and maintainability in your projects?`, category: 'TECHNICAL', difficulty: 'MEDIUM', skills: ['Code Quality'] },
      { question: `Describe your experience with ${skillsArray[1] || 'relevant frameworks'}.`, category: 'TECHNICAL', difficulty: 'EASY', skills: skillsArray },
    ].slice(0, aiForm.questionCount);
  };

  // Add generated question to question bank
  const handleAddGeneratedQuestion = async (q: GeneratedQuestion, index: number) => {
    try {
      const typeMap: { [key: string]: 'CODING' | 'BEHAVIORAL' | 'MULTIPLE_CHOICE' | 'SYSTEM_DESIGN' } = {
        'TECHNICAL': 'CODING',
        'BEHAVIORAL': 'BEHAVIORAL',
        'SYSTEM_DESIGN': 'SYSTEM_DESIGN',
        'CODING': 'CODING',
        'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE'
      };

      const questionData = {
        title: q.question.substring(0, 100),
        description: q.question,
        type: typeMap[q.category] || 'BEHAVIORAL',
        difficulty: q.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        tags: q.skills || [],
        maxPoints: 10,
        timeLimit: 5
      };

      await questionService.createQuestion(questionData);
      
      // Remove from generated list
      setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
      
      // Refresh questions list
      fetchQuestions();
      
      alert('✅ Question added to Question Bank!');
    } catch (err: any) {
      console.error('Error adding question:', err);
      alert('❌ Failed to add question: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesType = filterType === 'ALL' || q.type === filterType;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'EASY': return 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
      case 'MEDIUM': return 'text-neon-purple bg-neon-purple/10 border-neon-purple/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'HARD': return 'text-neon-blue bg-neon-blue/10 border-neon-blue/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      default: return 'text-white/50 bg-white/5 border-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CODING': return <Code2 size={16} />;
      case 'MULTIPLE_CHOICE': return <ListChecks size={16} />;
      case 'BEHAVIORAL': return <MessageSquare size={16} />;
      case 'SYSTEM_DESIGN': return <Layout size={16} />;
      default: return <Target size={16} />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'CODING': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MULTIPLE_CHOICE': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'BEHAVIORAL': return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'SYSTEM_DESIGN': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      default: return 'text-white/50 bg-white/5 border-white/10';
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Question Bank</h1>
          <p className="text-white/70 mt-1 font-medium">Manage and organize your interview questions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAIGenerator(true)}
            className="px-5 py-2.5 text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Sparkles size={18} />
            AI Generate
          </button>
          <Link
            to="/hr/questions/add"
            className="btn-primary-neo px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Add Question
          </Link>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-xl border-l-4 border-purple-500"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={24} />
              AI Question Generator
            </h2>
            <button
              onClick={() => { setShowAIGenerator(false); setGeneratedQuestions([]); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-white/50" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={aiForm.jobTitle}
                  onChange={(e) => setAiForm({ ...aiForm, jobTitle: e.target.value })}
                  placeholder="e.g., Senior Java Developer"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Experience Level
                </label>
                <select
                  value={aiForm.experienceLevel}
                  onChange={(e) => setAiForm({ ...aiForm, experienceLevel: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="JUNIOR" className="bg-gray-900">Junior (0-2 years)</option>
                  <option value="MID" className="bg-gray-900">Mid-Level (2-5 years)</option>
                  <option value="SENIOR" className="bg-gray-900">Senior (5+ years)</option>
                  <option value="LEAD" className="bg-gray-900">Lead/Principal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Skills * (comma separated)
              </label>
              <input
                type="text"
                value={aiForm.skills}
                onChange={(e) => setAiForm({ ...aiForm, skills: e.target.value })}
                placeholder="e.g., Java, Spring Boot, Microservices, PostgreSQL"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Number of Questions: <span className="text-purple-400 font-bold">{aiForm.questionCount}</span>
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={aiForm.questionCount}
                onChange={(e) => setAiForm({ ...aiForm, questionCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>3</span>
                <span>10</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleGenerateQuestions}
                disabled={aiLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
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
                  <>
                    <Sparkles size={18} />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                ✅ Generated {generatedQuestions.length} Questions
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {generatedQuestions.map((q, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{q.question}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded font-medium">
                            {q.category}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                            q.difficulty === 'EASY' ? 'bg-green-500/20 text-green-300' :
                            q.difficulty === 'HARD' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {q.difficulty}
                          </span>
                          {q.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddGeneratedQuestion(q, index)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        + Add
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'CODING', 'MULTIPLE_CHOICE', 'BEHAVIORAL', 'SYSTEM_DESIGN'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${filterType === type
                ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 glass-panel animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-2 border-white/10">
          <p className="text-white/50 text-lg">No questions found matching your criteria.</p>
          <button
            onClick={() => { setFilterType('ALL'); setSearchQuery('') }}
            className="mt-4 text-primary hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredQuestions.map((question) => (
              <motion.div
                key={question.id}
                variants={itemAnim}
                layoutId={`question-${question.id}`}
                className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeStyle(question.type)}`}>
                        {getTypeIcon(question.type)}
                        {question.type.replace('_', ' ')}
                      </span>
                      {question.difficulty && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      )}
                      {question.maxPoints && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/10">
                          {question.maxPoints} pts
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                      {question.title}
                    </h3>

                    <p className="text-white/60 text-sm line-clamp-2 max-w-4xl">
                      {question.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-white/40 pt-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User size={12} />
                        <span>{question.createdByName || 'Unknown'}</span>
                      </div>
                      {question.timeLimit && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>{Math.floor(question.timeLimit / 60)} min</span>
                        </div>
                      )}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-2">
                          {question.tags.map(t => <span key={t}>#{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                    <Link
                      to={`/admin/questions/${question.id}`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                    >
                      <Eye size={16} />
                      <span className="md:hidden">View</span>
                    </Link>
                    <Link
                      to={`/admin/questions/${question.id}/edit`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                    >
                      <Edit size={16} />
                      <span className="md:hidden">Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="md:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div >
      )}
    </div >
  );
};

export default QuestionList;
