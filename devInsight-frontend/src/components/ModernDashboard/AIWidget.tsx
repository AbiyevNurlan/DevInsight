import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIWidgetProps {
    topCandidate?: {
        name: string;
        score: number;
        role?: string;
    };
    onClick?: () => void;
}

export const AIWidget = ({ topCandidate, onClick }: AIWidgetProps) => {
    // If no candidate, show placeholder or generic message
    const score = topCandidate?.score || 0;
    const name = topCandidate?.name || 'No Data';

    // Calculate stroke offset
    const circumference = 2 * Math.PI * 56; // radius 56
    const offset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            className="col-span-12 md:col-span-4 lg:col-span-3 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl relative group overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <Sparkles className="w-6 h-6 text-neon-purple" />
                </motion.div>
            </div>

            <h3 className="text-white font-semibold mb-1">AI Recommended</h3>
            <p className="text-xs text-slate-400 mb-6">Top matches based on skills</p>

            <div className="flex items-center justify-center relative">
                <svg className="w-32 h-32 -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                    <motion.circle
                        cx="64" cy="64" r="56"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white mb-1">
                        <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt="Candidate" />
                    </div>
                    <span className="text-xl font-bold text-white">{score}%</span>
                </div>
            </div>

            <div className="text-center mt-4">
                <button
                    onClick={onClick}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors border border-white/5 backdrop-blur-md"
                >
                    {topCandidate ? 'View Analysis' : 'Run Analysis'}
                </button>
            </div>
        </motion.div>
    );
};
