import React from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import ViolationAlert from './ViolationAlert'

interface HeaderProps {
    onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 h-20 px-6 sm:px-8 flex items-center justify-between transition-all duration-300 border-b border-white/5 bg-background/0 backdrop-blur-xl">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
                <Menu size={24} />
            </button>

            {/* Negative Space Spacer */}
            <div className="flex-1" />

            <div className="flex items-center gap-4">
                {/* Minimalist Search */}
                <div className="hidden md:flex items-center relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 bg-white/5 border border-white/5 rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-600 
                        focus:outline-none focus:bg-white/10 focus:border-white/10 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                    />
                </div>

                {/* Security Violations Alert - Real-time */}
                <ViolationAlert />

                {/* Notifications - Monochrome */}
                <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <Bell size={20} />
                </button>

                {/* Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10" />
            </div>
        </header>
    )
}
