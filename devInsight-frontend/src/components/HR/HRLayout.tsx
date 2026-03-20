import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, ChevronDown } from 'lucide-react';
import HRSidebar from './HRSidebar';

interface HRLayoutProps {
  children: React.ReactNode;
}

export const HRLayout: React.FC<HRLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Sidebar */}
      <HRSidebar />

      {/* Main Content */}
      <main className="pl-24 pr-6 py-6 relative z-10">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2">
              Random Candidate
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="relative p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">3</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">HR</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default HRLayout;
