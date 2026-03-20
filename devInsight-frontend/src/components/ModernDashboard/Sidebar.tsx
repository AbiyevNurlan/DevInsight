import React from 'react';
import { LayoutDashboard, Users, FileText, BarChart2, FileBarChart, Settings, Hexagon, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { LogOut } from 'lucide-react';

const getMenuItems = (role: string | null) => {
    const isAdmin = role === 'ADMIN';
    const isHR = role === 'HR';
    const isCandidate = role === 'CANDIDATE';

    const items = [
        { icon: LayoutDashboard, label: 'Dashboard', path: role === 'ADMIN' ? '/admin-dashboard' : role === 'HR' ? '/hr/dashboard' : '/candidate/dashboard' },
        { icon: FileText, label: 'Interviews', path: '/interviews' },
    ];

    if (isAdmin || isHR) {
        items.push(
            { icon: Users, label: 'Candidates', path: isAdmin ? '/admin/candidates' : '/hr/candidates' },
            { icon: BarChart2, label: 'Analytics', path: isAdmin ? '/admin/analytics' : '/hr/analytics' },
            { icon: FileBarChart, label: 'Question Bank', path: isAdmin ? '/admin/questions' : '/hr/questions' }
        );
    }

    items.push(
        { icon: UserCircle, label: 'Profile', path: isCandidate ? '/candidate/profile' : '/profile' }
    );

    return items;
};

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = api.getRole();
    const menuItems = getMenuItems(role);

    const handleLogout = () => {
        api.clearToken();
        window.location.href = '/login';
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-screen w-20 flex flex-col items-center py-8 fixed left-0 top-0 z-50 border-r border-futuristic-border bg-futuristic-bg/80 backdrop-blur-xl"
        >
            {/* Logo */}
            <div className="mb-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Hexagon className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" strokeWidth={2.5} />
                </motion.div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-8 w-full">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <div key={index} className="relative group w-full flex justify-center cursor-pointer" onClick={() => navigate(item.path)}>
                            {/* Active Indicator Line */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.8)] rounded-r-full"
                                />
                            )}

                            <div className={`
              p-3 rounded-xl transition-all duration-300
              ${isActive
                                    ? 'text-white bg-white/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}>
                                <item.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
                            </div>

                            {/* Hover Label Tooltip */}
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 border border-white/10 rounded-md text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none glass-panel">
                                {item.label}
                            </div>
                        </div>
                    );
                })}

                {/* Logout Button */}
                <div className="relative group w-full flex justify-center cursor-pointer mt-auto pb-8" onClick={handleLogout}>
                    <div className="p-3 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="w-6 h-6" />
                    </div>
                    <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 border border-white/10 rounded-md text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none glass-panel">
                        Sign Out
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
