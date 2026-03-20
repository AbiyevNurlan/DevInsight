import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ArrowRight,
  Home,
  FileText,
  BarChart2,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  Star,
  ChevronRight
} from 'lucide-react';

// Simple confetti replacement using motion divs
const ConfettiPiece = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    initial={{ y: -20, x, opacity: 1, rotate: 0 }}
    animate={{ y: window.innerHeight + 100, opacity: 0, rotate: 720 }}
    transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeIn' }}
    className="fixed top-0 w-3 h-3 rounded-sm"
    style={{
      background: ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4'][Math.floor(Math.random() * 5)],
      left: x
    }}
  />
);

export default function InterviewComplete() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const success = location.state?.success;

  useEffect(() => {
    if (!success) {
      navigate('/interviews');
    }

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece key={i} delay={i * 0.05} x={Math.random() * window.innerWidth} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-10 backdrop-blur-xl text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="relative mx-auto mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 border-2 border-dashed border-green-500/30 rounded-full"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
            >
              <Star className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-white mb-3">
              Interview Submitted!
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Your responses have been recorded successfully
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time Taken</span>
              </div>
              <p className="text-xl font-bold text-white">--:--</p>
            </div>
            <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Status</span>
              </div>
              <p className="text-xl font-bold text-green-400">Submitted</p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/30 border border-white/5 rounded-xl p-5 mb-8 text-left"
          >
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              What's Next?
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-400">1</span>
                </div>
                <span>Your answers will be analyzed using AI</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400">2</span>
                </div>
                <span>HR team will review your submission</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-green-400">3</span>
                </div>
                <span>You'll be notified about the results</span>
              </li>
            </ul>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-3"
          >
            <Link
              to="/interviews"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
            >
              View All Interviews
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-4 -left-4 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"
        >
          <Star className="w-4 h-4 text-green-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -bottom-4 -right-4 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center"
        >
          <Award className="w-5 h-5 text-blue-400" />
        </motion.div>
      </motion.div>
    </div>
  );
}
