import React from 'react';
import { Sidebar } from '../components/ModernDashboard/Sidebar';
import { TopBar } from '../components/ModernDashboard/TopBar';
import { StatCard } from '../components/ModernDashboard/StatCard';
import { VacancyChart } from '../components/ModernDashboard/VacancyChart';
import { SourceDonutChart } from '../components/ModernDashboard/SourceDonutChart';
import { WorldMapWidget } from '../components/ModernDashboard/WorldMapWidget';
import { CandidateTable } from '../components/ModernDashboard/CandidateTable';
import { AIWidget } from '../components/ModernDashboard/AIWidget';
import { motion } from 'framer-motion';

const ModernDashboard = () => {
    return (
        <div className="min-h-screen bg-futuristic-bg text-white font-sans overflow-x-hidden selection:bg-neon-cyan selection:text-black">
            {/* Background Animated Gradient Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-neon-blue/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[100px]"
                />
            </div>

            <Sidebar />

            <main className="pl-24 pr-8 py-6 relative z-10 max-w-[1600px] mx-auto">
                <TopBar />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Applicants"
                        value="1,250"
                        subtext="+15% vs last month"
                        color="#3b82f6"
                        data={[{ value: 30 }, { value: 40 }, { value: 35 }, { value: 50 }, { value: 45 }, { value: 70 }, { value: 60 }]}
                        delay={0.3}
                    />
                    <StatCard
                        title="Active Applications"
                        value="39"
                        subtext="Currently vetting"
                        color="#f97316"
                        data={[{ value: 20 }, { value: 25 }, { value: 20 }, { value: 35 }, { value: 30 }, { value: 45 }, { value: 40 }]}
                        delay={0.4}
                    />
                    <StatCard
                        title="Hired Candidates"
                        value="92%"
                        subtext="Success rate"
                        color="#10b981"
                        data={[{ value: 60 }, { value: 65 }, { value: 75 }, { value: 70 }, { value: 80 }, { value: 85 }, { value: 90 }]}
                        delay={0.5}
                    />
                </div>

                {/* Middle Visualization Section */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                    <VacancyChart />
                    <SourceDonutChart />
                    <AIWidget />
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-12 gap-6 pb-8">
                    <WorldMapWidget />
                    <CandidateTable />

                    {/* Short Recent Activity or another widget often fills the gap, using a placeholder for now to match layout balance */}
                    <motion.div
                        className="col-span-12 md:col-span-2 bg-futuristic-card border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <h3 className="text-white font-semibold mb-4">Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
                                    <div>
                                        <div className="h-2 w-20 bg-slate-700 rounded mb-2" />
                                        <div className="h-2 w-12 bg-slate-800 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ModernDashboard;
