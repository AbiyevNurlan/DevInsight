import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';

interface ModernLayoutProps {
    children: React.ReactNode;
}

export const ModernLayout = ({ children }: ModernLayoutProps) => {
    return (
        <div className="min-h-screen bg-futuristic-bg text-white font-sans overflow-x-hidden selection:bg-neon-cyan selection:text-black">
            {/* Background Animated Gradient Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
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

            <div className="pl-24 pr-8 py-6 relative z-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
                <TopBar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};
