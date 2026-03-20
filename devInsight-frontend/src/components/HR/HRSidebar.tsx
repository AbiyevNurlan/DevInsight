import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  Globe,
  MapPin,
  LogOut
} from 'lucide-react';
import api from '../../services/api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/hr/dashboard' },
  { icon: Users, label: 'Candidates', path: '/hr/candidates' },
  { icon: Briefcase, label: 'Vacancies', path: '/hr/vacancies' },
  { icon: BarChart3, label: 'Analytics', path: '/hr/analytics' },
  { icon: FileText, label: 'Reports', path: '/hr/reports' },
  { icon: Settings, label: 'Settings', path: '/hr/settings' },
];

export const HRSidebar: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    api.clearToken();
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/hr/dashboard') {
      return location.pathname === '/hr' || 
             location.pathname === '/hr/dashboard' || 
             location.pathname === '/hr/admin-dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 top-0 h-screen w-20 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 z-50"
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`relative p-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="hr-sidebar-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
              />
            )}
            <item.icon className="w-5 h-5" />
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Global Talent Pool */}
      <Link
        to="/hr/talent-matching"
        className="mt-auto mb-4 w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white group relative"
      >
        <MapPin className="w-5 h-5" />
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Talent Pool
        </div>
      </Link>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400 group relative"
      >
        <LogOut className="w-5 h-5" />
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Sign Out
        </div>
      </button>
    </motion.aside>
  );
};

export default HRSidebar;
