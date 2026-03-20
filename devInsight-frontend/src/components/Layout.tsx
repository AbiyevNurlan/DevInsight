import React, { useState } from 'react'
import AppleDock from './AppleDock'
import Header from './Header'
import { ModernLayout } from './ModernDashboard/ModernLayout'
import HRLayout from './HR/HRLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hexagon } from 'lucide-react'
import api from '../services/api'
import { useLocation } from 'react-router-dom'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    // Public routes - no layout
    if (['/login', '/register', '/forbidden'].includes(location.pathname)) {
        return <>{children}</>
    }

    // Full screen routes - Interview submission and results (no sidebar, no header)
    if (location.pathname.startsWith('/interview/') || 
        location.pathname.startsWith('/submissions/')) {
        return <>{children}</>
    }

    // HRAdminDashboard has its own layout - render without wrapper
    if (location.pathname === '/hr' || 
        location.pathname === '/hr/dashboard' || 
        location.pathname === '/hr/admin-dashboard') {
        return <>{children}</>
    }

    // HR Routes use HRLayout with special sidebar
    if (location.pathname.startsWith('/hr/')) {
        return <HRLayout>{children}</HRLayout>;
    }

    // Modern Layout for all authenticated routes
    const isModernRoute =
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/interviews') ||
        location.pathname.startsWith('/candidates') ||
        location.pathname.startsWith('/candidate') ||
        location.pathname.startsWith('/analytics') ||
        location.pathname === '/modern-dashboard' ||
        location.pathname === '/profile' ||
        location.pathname === '/dashboard';

    if (isModernRoute) {
        return <ModernLayout>{children}</ModernLayout>;
    }

    return (
        <div className="min-h-screen bg-transparent selection:bg-white/20 selection:text-white">
            {/* Desktop Dock */}
            <div className="hidden md:block">
                <AppleDock />
            </div>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-system-gray6 border-r border-white/10 z-50 md:hidden backdrop-blur-xl"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <Hexagon className="w-6 h-6 text-white" />
                                    <span className="font-bold text-xl text-white tracking-tight">DevInsight</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-4">
                                <SidebarContentMobile />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            {/* Added left padding to accommodate the floating dock on desktop */}
            <div className="md:pl-32 flex flex-col min-h-screen transition-all duration-300">
                <Header onMenuClick={() => setMobileMenuOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

function SidebarContentMobile() {
    const role = api.getRole()
    const isAdmin = role === 'ADMIN'
    const isHR = role === 'HR'

    const navigation = [
        { name: 'Dashboard', href: role === 'ADMIN' ? '/admin-dashboard' : role === 'HR' ? '/hr/dashboard' : '/candidate/dashboard', show: true },
        { name: 'Interviews', href: '/interviews', show: true },
        { name: 'Questions', href: isAdmin ? '/admin/questions' : '/hr/questions', show: isAdmin || isHR },
        { name: 'Candidates', href: isAdmin ? '/admin/candidates' : '/hr/candidates', show: isAdmin || isHR },
        { name: 'Analytics', href: isAdmin ? '/admin/analytics' : '/hr/analytics', show: isAdmin || isHR },
        { name: 'Profile', href: '/profile', show: true },
    ]

    return (
        <nav className="space-y-2">
            {navigation.filter(item => item.show).map((item) => (
                <a
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-4 rounded-xl text-lg font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-98"
                >
                    {item.name}
                </a>
            ))}
            <div className="h-px bg-white/10 my-4" />
            <button
                onClick={() => {
                    api.clearToken()
                    window.location.href = '/login'
                }}
                className="block w-full text-left px-4 py-4 rounded-xl text-lg font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
                Sign Out
            </button>
        </nav>
    )
}
