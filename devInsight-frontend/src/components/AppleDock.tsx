import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    FileQuestion,
    Users,
    BarChart2,
    UserCircle,
    LogOut,
    Hexagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function AppleDock() {
    const location = useLocation();
    const navigate = useNavigate();
    const role = api.getRole();
    const isAdmin = role === 'ADMIN';
    const isHR = role === 'HR';
    const isCandidate = role === 'CANDIDATE';

    const navigation = [
        { name: 'Dashboard', href: role === 'ADMIN' ? '/admin-dashboard' : role === 'HR' ? '/hr/dashboard' : '/candidate/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Interviews', href: '/interviews', icon: Briefcase, show: true },
        { name: 'Questions', href: isAdmin ? '/admin/questions' : '/hr/questions', icon: FileQuestion, show: isAdmin || isHR },
        { name: 'Candidates', href: isAdmin ? '/admin/candidates' : '/hr/candidates', icon: Users, show: isAdmin || isHR },
        { name: 'Analytics', href: isAdmin ? '/admin/analytics' : '/hr/analytics', icon: BarChart2, show: isAdmin || isHR },
        { name: 'Profile', href: isCandidate ? '/candidate/profile' : '/profile', icon: UserCircle, show: true },
    ];

    const handleLogout = () => {
        api.clearToken();
        navigate('/login');
    };

    return (
        <>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6"
            >
                {/* Floating Dock Container */}
                <div className="glass-panel rounded-[2rem] p-3 flex flex-col gap-4 items-center shadow-2xl shadow-black/50">

                    {/* Logo area */}
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                        <Hexagon className="w-5 h-5 text-white" />
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-3">
                        {navigation.filter(item => item.show).map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <div key={item.name} className="relative group flex items-center justify-center">
                                    {/* Tooltip */}
                                    <div className="absolute left-14 px-3 py-1 bg-gray-900 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">
                                        {item.name}
                                    </div>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/10 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}

                                    <motion.button
                                        onClick={() => navigate(item.href)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`relative p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        <Icon size={24} strokeWidth={1.5} className="opacity-70 group-hover:opacity-100 transition-opacity" />

                                        {/* Active glow dot */}
                                        {isActive && (
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r-lg shadow-[0_0_10px_rgba(255,255,255,1)]" />
                                        )}
                                    </motion.button>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="w-8 h-[1px] bg-white/10 my-1" />

                    {/* User / Logout */}
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.1, color: '#FF453A' }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 text-zinc-500 rounded-xl hover:bg-white/5 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </motion.button>

                </div>
            </motion.div>
        </>
    );
}
