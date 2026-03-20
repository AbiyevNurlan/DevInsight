import React from 'react';
import { motion } from 'framer-motion';

interface Candidate {
    id: number | string;
    name: string;
    role: string;
    status: string;
    score?: number | string;
}

interface CandidateTableProps {
    candidates?: Candidate[];
}

export const CandidateTable = ({ candidates = [] }: CandidateTableProps) => {
    return (
        <motion.div
            className="col-span-12 lg:col-span-6 bg-futuristic-card border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">Recent Submissions</h3>
                {/* <button className="text-xs text-neon-cyan hover:text-white transition-colors">View All</button> */}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-white/5">
                            <th className="py-3 pl-2">Name</th>
                            <th className="py-3">Role</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 pr-2 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-slate-500 text-sm">No recent submissions found</td>
                            </tr>
                        ) : (
                            candidates.map((candidate, index) => {
                                // Determine color based on status or score
                                let color = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                                const s = candidate.status.toUpperCase();
                                if (s === 'HIRED' || s === 'Pass' || (typeof candidate.score === 'number' && candidate.score > 80)) color = 'bg-neon-green/10 text-neon-green border-neon-green/20';
                                else if (s === 'REJECTED' || s === 'FAIL') color = 'bg-red-500/10 text-red-500 border-red-500/20';
                                else if (s === 'INTERVIEW' || s === 'PENDING') color = 'bg-neon-orange/10 text-neon-orange border-neon-orange/20';

                                return (
                                    <tr key={candidate.id || index} className="group hover:bg-white/5 transition-colors text-sm">
                                        <td className="py-3 pl-2">
                                            <span className="font-medium text-white">{candidate.name || 'Unknown'}</span>
                                        </td>
                                        <td className="py-3 text-slate-400">{candidate.role || '-'}</td>
                                        <td className="py-3">
                                            <span className={`text-xs px-2 py-1 rounded border ${color}`}>
                                                {candidate.status}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-2 text-right font-mono text-white">{candidate.score ?? '-'}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
