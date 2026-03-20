import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileQuestion, 
  Users, 
  BarChart2, 
  UserCircle, 
  LogOut,
  Hexagon,
  Brain,
  Globe,
  Shield,
  GraduationCap
} from 'lucide-react'
import api from '../services/api'
import SidebarItem from './SidebarItem'

export default function Sidebar() {
  const navigate = useNavigate()
  const role = api.getRole()
  const isAdmin = role === 'ADMIN'
  const isHR = role === 'HR'
  const isCandidate = role === 'CANDIDATE'

  const navigation = [
    { name: 'Dashboard', href: role === 'ADMIN' ? '/admin-dashboard' : role === 'HR' ? '/hr/dashboard' : '/candidate/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Interviews', href: '/interviews', icon: Briefcase, show: true },
    { name: 'Questions', href: isAdmin ? '/admin/questions' : '/hr/questions', icon: FileQuestion, show: isAdmin || isHR },
    { name: 'Candidates', href: isAdmin ? '/admin/candidates' : '/hr/candidates', icon: Users, show: isAdmin || isHR },
    { name: 'Analytics', href: isAdmin ? '/admin/analytics' : '/hr/analytics', icon: BarChart2, show: isAdmin || isHR },
    // AI Features
    { name: 'AI Model Dashboard', href: '/hr/ai-dashboard', icon: Brain, show: isAdmin || isHR },
    { name: 'Talent Matching', href: '/hr/talent-matching', icon: Globe, show: isAdmin || isHR },
    { name: 'HR Decisions', href: '/hr/decisions', icon: Shield, show: isAdmin || isHR },
    { name: 'Upskilling', href: '/hr/upskilling', icon: GraduationCap, show: isAdmin || isHR },
    { name: 'Profile', href: isCandidate ? '/candidate/profile' : '/profile', icon: UserCircle, show: true },
  ]

  const handleLogout = () => {
    api.clearToken()
    navigate('/login')
  }

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-30 bg-background border-r border-border">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3 group">
          <Hexagon className="w-6 h-6 text-primary transition-transform duration-500 group-hover:rotate-180" strokeWidth={2} />
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            DevInsight
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {navigation.filter(item => item.show).map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between group px-2 py-2 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
               <UserCircle className="w-5 h-5 text-text-muted" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">User Account</p>
              <p className="text-xs text-text-muted truncate capitalize">{role?.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-text-muted hover:text-error transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
