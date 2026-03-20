import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';


interface VacancyChartProps {
    data?: any[];
    title?: string;
}

export const VacancyChart = ({ data, title = "Interview Status" }: VacancyChartProps) => {
    const chartData = data || [
        { name: 'Draft', fill: 0, color: '#94a3b8' },
        { name: 'Published', fill: 0, color: '#10b981' },
        { name: 'Archived', fill: 0, color: '#f97316' },
    ];
    return (
        <motion.div
            className="col-span-12 lg:col-span-6 bg-futuristic-card border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">{title}</h3>
                <div className="flex gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-neon-orange bg-neon-orange/10 px-2 py-1 rounded border border-neon-orange/20">Shortage</span>
                    <span className="text-[10px] uppercase tracking-wider text-neon-blue bg-neon-blue/10 px-2 py-1 rounded border border-neon-blue/20">Surplus</span>
                    <span className="text-[10px] uppercase tracking-wider text-neon-green bg-neon-green/10 px-2 py-1 rounded border border-neon-green/20">Balanced</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="fill" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
