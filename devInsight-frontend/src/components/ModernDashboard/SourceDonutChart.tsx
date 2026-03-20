import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { name: 'LinkedIn', value: 28, color: '#3b82f6' },
    { name: 'Referral', value: 20, color: '#06b6d4' },
    { name: 'Direct', value: 17, color: '#14b8a6' },
    { name: 'Agency', value: 35, color: '#0f172a' }, // Darker segment for "empty" feel if needed, or actual data
];

export const SourceDonutChart = () => {
    return (
        <motion.div
            className="col-span-12 md:col-span-4 lg:col-span-3 bg-futuristic-card border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <h3 className="w-full text-left text-white font-semibold mb-4 absolute top-6 left-6">Source of Candidates</h3>

            <div className="h-48 w-48 relative mt-8">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">28%</span>
                    <span className="text-xs text-slate-400">LinkedIn</span>
                </div>
            </div>

            <div className="flex justify-between w-full mt-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan" />
                    <span className="text-xs text-slate-400">20% Referral</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="text-xs text-slate-400">6% Other</span>
                </div>
            </div>
        </motion.div>
    );
};
