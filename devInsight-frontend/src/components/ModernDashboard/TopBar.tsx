import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Assuming an endpoint exists or we use local storage role as fallback
                const role = api.getRole();
                const token = api.getToken();
                if (token) {
                    // In a real app we'd fetch profile. For now, mock or minimal info.
                    setUser({ name: 'User', role: role || 'Guest' });
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        api.clearToken();
        window.location.href = '/login';
    };

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex justify-between items-center mb-8 px-2"
        >
            {/* Brand / Breadcrumb */}
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    DevInsight
                </h1>
            </div>

            {/* Center Search */}
            <div className="flex-1 max-w-xl mx-8 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-futuristic-glass border border-futuristic-border rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300 backdrop-blur-md"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 relative">
                <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-2 w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
                </button>

                <div
                    className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role || 'Guest'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[1px]">
                        <div className="w-full h-full rounded-full bg-slate-900 border-2 border-transparent overflow-hidden flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* User Dropdown */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full right-0 mt-2 w-48 glass-panel border border-white/10 rounded-xl overflow-hidden z-50"
                        >
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <User size={16} /> Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
