import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Clock,
  FileText,
  Users,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  Briefcase,
  Award,
  Timer,
  Zap,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import api from '../services/api';

interface Interview {
  id: number;
  title: string;
  description: string;
  duration?: number;
  totalQuestions: number;
  difficulty?: string;
  category?: string;
  status?: string;
  createdAt?: string;
}

// Difficulty Badge
const DifficultyBadge = ({ level }: { level?: string }) => {
  const config: Record<string, { color: string; bg: string }> = {
    EASY: { color: 'text-green-400', bg: 'bg-green-500/20' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    HARD: { color: 'text-red-400', bg: 'bg-red-500/20' },
  };
  const c = config[level || 'MEDIUM'] || config.MEDIUM;
  
  return (
    <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${c.bg} ${c.color}`}>
      {level || 'MEDIUM'}
    </span>
  );
};

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
    <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  </div>
);

export default function ModernInterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterview() {
      try {
        setLoading(true);
        const response = await api.get(`/interviews/${id}`);
        const data = response.data?.data || response.data;
        
        if (!data) {
          setError('Interview not found');
          return;
        }

        // Get question count
        let questionCount = data.totalQuestions || data.questionCount || 0;
        if (!questionCount) {
          try {
            const questionsRes = await api.get(`/interviews/${id}/questions`);
            const questions = questionsRes.data?.data || questionsRes.data;
            questionCount = Array.isArray(questions) ? questions.length : 0;
          } catch {}
        }

        setInterview({
          id: data.id,
          title: data.title || 'Interview',
          description: data.description || '',
          duration: data.duration || 60,
          totalQuestions: questionCount,
          difficulty: data.difficulty,
          category: data.category,
          status: data.status,
          createdAt: data.createdAt
        });
      } catch (err: any) {
        console.error('Failed to load interview:', err);
        setError(err.response?.data?.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchInterview();
  }, [id]);

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
          <p className="text-slate-400">Loading interview details...</p>
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
          <h2 className="text-xl font-bold text-white mb-2">Interview Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'This interview does not exist or has been removed.'}</p>
          <Link
            to="/interviews"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link
            to="/interviews"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <DifficultyBadge level={interview.difficulty} />
                  {interview.category && (
                    <span className="px-3 py-1.5 text-xs bg-slate-700/50 text-slate-400 rounded-lg">
                      {interview.category}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">{interview.title}</h1>
                <p className="text-slate-400 leading-relaxed max-w-2xl">
                  {interview.description || 'Complete this interview to showcase your skills and knowledge.'}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <InfoCard icon={FileText} label="Questions" value={interview.totalQuestions} color="#3b82f6" />
              <InfoCard icon={Clock} label="Duration" value={`${interview.duration || 60} min`} color="#8b5cf6" />
              <InfoCard icon={Target} label="Difficulty" value={interview.difficulty || 'Medium'} color="#f97316" />
              <InfoCard icon={Award} label="Points" value={interview.totalQuestions * 10} color="#10b981" />
            </div>
          </div>

          {/* Instructions */}
          <div className="p-8 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Instructions
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-400">1</span>
                </div>
                <span>Read each question carefully before answering</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-400">2</span>
                </div>
                <span>You can navigate between questions freely</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-400">3</span>
                </div>
                <span>Your answers are auto-saved as you type</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-400">4</span>
                </div>
                <span>Submit all answers before the time runs out</span>
              </li>
            </ul>
          </div>

          {/* Action */}
          <div className="p-8 bg-slate-900/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Info className="w-5 h-5" />
                <span className="text-sm">Make sure you have a stable internet connection</span>
              </div>
              <Link
                to={`/interview/${interview.id}/submit`}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <Play className="w-5 h-5" />
                Start Interview
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-slate-900/40 border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Pro Tips</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Take your time to understand each question. Quality answers are more valuable than quick responses. 
                Use specific examples and structure your answers clearly for better evaluation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
