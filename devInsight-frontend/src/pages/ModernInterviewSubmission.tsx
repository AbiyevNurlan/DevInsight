import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Send,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Timer,
  FileText,
  Target,
  Lightbulb,
  Zap,
  BarChart2,
  Save,
  RefreshCw,
  Play,
  Pause,
  CircleDot,
  Award,
  TrendingUp,
  Brain,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

// Types
interface Question {
  id: number;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  points?: number;
  expectedTimeMinutes?: number;
}

interface Interview {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  duration?: number;
  questions: Question[];
}

// Difficulty Badge
const DifficultyBadge = ({ level }: { level: string }) => {
  const config: Record<string, { color: string; bg: string; border: string }> = {
    EASY: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    HARD: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  };
  const c = config[level] || config.MEDIUM;
  
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${c.bg} ${c.color} ${c.border} border`}>
      {level}
    </span>
  );
};

// Progress Ring
const ProgressRing = ({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Timer Component
const InterviewTimer = ({ startTime, duration }: { startTime: Date; duration?: number }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remaining = duration ? duration * 60 - elapsed : null;
  const isLowTime = remaining !== null && remaining < 300; // Less than 5 min

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isLowTime ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/50 text-slate-300'}`}>
      <Timer className="w-4 h-4" />
      <span className="font-mono text-sm">
        {remaining !== null ? formatTime(Math.max(0, remaining)) : formatTime(elapsed)}
      </span>
      {remaining !== null && (
        <span className="text-xs opacity-70">remaining</span>
      )}
    </div>
  );
};

// Main Component
export default function ModernInterviewSubmission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(new Date());
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Fetch interview data
  useEffect(() => {
    async function fetchInterview() {
      try {
        setLoading(true);
        // Use the same endpoint as the old InterviewSubmissionPage
        const response = await api.get(`/interviews/${id}`);
        
        const data = response.data?.data || response.data;
        
        if (!data) {
          setError('Interview not found');
          return;
        }
        
        // Questions should be included in the interview response
        const questions = data.questions || [];
        
        setInterview({
          id: data.id,
          title: data.title || 'Interview',
          description: data.description || '',
          totalQuestions: questions.length,
          duration: data.durationMinutes || data.duration || 60,
          questions: questions.map((q: any) => ({
            id: q.id,
            questionText: q.title || q.questionText || q.description || 'Question',
            difficulty: q.difficulty || 'MEDIUM',
            category: q.category || q.type,
            points: q.maxPoints || q.points || 10,
            expectedTimeMinutes: q.expectedTimeMinutes
          }))
        });
      } catch (err: any) {
        console.error('Failed to load interview:', err);
        if (err.response?.status === 401) {
          api.clearToken();
          navigate('/login');
          return;
        }
        setError(err.response?.data?.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchInterview();
  }, [id, navigate]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setAutoSaveStatus('saving');
      const timer = setTimeout(() => {
        localStorage.setItem(`interview_${id}_answers`, JSON.stringify(answers));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [answers, id]);

  // Load saved answers
  useEffect(() => {
    const saved = localStorage.getItem(`interview_${id}_answers`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch {}
    }
  }, [id]);

  const currentQuestion = interview?.questions[currentIndex];
  const progress = interview ? ((currentIndex + 1) / interview.totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(k => answers[Number(k)]?.trim()).length;

  const handleAnswerChange = useCallback((value: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion]);

  const goToQuestion = (index: number) => {
    if (interview && index >= 0 && index < interview.totalQuestions) {
      setCurrentIndex(index);
    }
  };

  const handleSubmit = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      
      const payload = {
        interviewId: interview.id,
        answers: interview.questions.map(q => ({
          questionId: q.id,
          answerText: answers[q.id] || ''
        }))
      };
      
      await api.post(`/submissions/interviews/${id}`, payload);
      localStorage.removeItem(`interview_${id}_answers`);
      navigate(`/interviews/${id}/complete`, { state: { success: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400">Loading interview...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Interview Not Available</h2>
          <p className="text-slate-400 mb-6">{error || 'The interview could not be loaded.'}</p>
          <Link to="/interviews" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/interviews" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">{interview.title}</h1>
                <p className="text-xs text-slate-500">{interview.totalQuestions} questions</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              <AnimatePresence>
                {autoSaveStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    {autoSaveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                        <span className="text-slate-400">Saving...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Saved</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <InterviewTimer startTime={startTime} duration={interview.duration} />
              
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all font-medium"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Progress */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="sticky top-28 space-y-6">
              {/* Progress Card */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-slate-400">Progress</h3>
                  <span className="text-xs text-blue-400">{answeredCount}/{interview.totalQuestions} answered</span>
                </div>
                <div className="flex justify-center mb-6">
                  <ProgressRing progress={progress} />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm text-slate-400">Question {currentIndex + 1} of {interview.totalQuestions}</p>
                </div>
              </div>

              {/* Question Navigator */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {interview.questions.map((q, idx) => {
                    const isAnswered = answers[q.id]?.trim();
                    const isCurrent = idx === currentIndex;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(idx)}
                        className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? 'bg-blue-500 text-white ring-2 ring-blue-500/50'
                            : isAnswered
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700/50 hover:text-white border border-white/5'
                        }`}
                      >
                        {idx + 1}
                        {isAnswered && !isCurrent && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Answered</span>
                    </div>
                    <span className="text-white font-medium">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CircleDot className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Remaining</span>
                    </div>
                    <span className="text-white font-medium">{interview.totalQuestions - answeredCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Question Area */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-9"
          >
            {currentQuestion && (
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
                {/* Question Header */}
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                        Question {currentIndex + 1}
                      </span>
                      <DifficultyBadge level={currentQuestion.difficulty} />
                      {currentQuestion.category && (
                        <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                          {currentQuestion.category}
                        </span>
                      )}
                    </div>
                    {currentQuestion.points && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">{currentQuestion.points} pts</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-white leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* Answer Area */}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-slate-400 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Your Answer</span>
                  </div>
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-64 bg-slate-800/30 border border-white/10 rounded-xl p-5 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{(answers[currentQuestion.id] || '').length} characters</span>
                    {currentQuestion.expectedTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expected time: {currentQuestion.expectedTimeMinutes} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-6 border-t border-white/5 bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {currentIndex < interview.totalQuestions - 1 ? (
                        <button
                          onClick={() => goToQuestion(currentIndex + 1)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowConfirmSubmit(true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-colors"
                        >
                          Finish & Submit
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-slate-900/40 border border-white/5 rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Tips for Better Answers</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Be specific and provide examples where possible</li>
                    <li>• Structure your answer clearly with main points</li>
                    <li>• Review your answers before final submission</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Submit Interview?</h3>
                <p className="text-slate-400 mb-6">
                  You have answered {answeredCount} out of {interview.totalQuestions} questions.
                  {answeredCount < interview.totalQuestions && (
                    <span className="block mt-2 text-yellow-400">
                      {interview.totalQuestions - answeredCount} questions are still unanswered.
                    </span>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-5 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
