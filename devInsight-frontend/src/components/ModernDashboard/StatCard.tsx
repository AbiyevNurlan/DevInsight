import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface StatCardProps {
    title: string;
    value: string;
    subtext: string;
    color: string; // Hex color code
    data: { value: number }[];
    delay: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, color, data, delay }) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl bg-futuristic-card border border-futuristic-border backdrop-blur-xl p-6 group hover:border-white/20 transition-all duration-300"
        >
            {/* Glow Effects */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
            <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                style={{
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    boxShadow: `0 0 10px ${color}`
                }}
            />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
                    <div className="text-4xl font-bold text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}40` }}>{value}</div>
                </div>
            </div>

            <div className="h-16 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#gradient-${title})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-500 font-mono mt-2">{subtext}</p>
        </motion.div>
    );
};
