import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function NavBar(){
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const logged = !!api.getToken()
  const isAdmin = api.isAdmin()
  const role = localStorage.getItem('devinsight_role')
  const isAdminOrHR = role === 'ADMIN' || role === 'HR'

  const handleLogout = () => {
    api.clearToken()
    setMobileMenuOpen(false)
    navigate('/login')
  }

  return (
    <header className="nav-shell">
      <div className="nav-shell-inner">
        <div className="nav-shell-orbit" aria-hidden="true" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16 md:h-18">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-sky-500/40">
              <span className="text-slate-950 font-extrabold text-lg tracking-widest">
                D
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-semibold text-lg sm:text-xl tracking-[0.18em] uppercase text-slate-100/90 group-hover:text-white transition-colors">
              DevInsight
              <span className="ml-1 text-xs text-sky-300/80 align-super">OS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 rounded-full bg-slate-900/70 border border-slate-700/60 px-1 py-1 backdrop-blur-xl shadow-lg shadow-slate-950/70">
            {logged ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin-dashboard" 
                    className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                  >
                    ⌘ Dashboard
                  </Link>
                )}
                <Link 
                  to="/interviews" 
                  className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                >
                  Interviews
                </Link>                {isAdminOrHR && (
                  <Link 
                    to={role === 'ADMIN' ? '/admin/questions' : '/hr/questions'} 
                    className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                  >
                    ❓ Questions
                  </Link>
                )}
                {isAdminOrHR && (
                  <Link 
                    to={role === 'ADMIN' ? '/admin/candidates' : '/hr/candidates'} 
                    className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                  >
                    👥 Candidates
                  </Link>
                )}
                {isAdminOrHR && (
                  <Link 
                    to={role === 'ADMIN' ? '/admin/analytics' : '/hr/analytics'} 
                    className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                  >
                    📊 Analytics
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-rose-300/90 hover:text-rose-200 rounded-full transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-slate-200/90 hover:text-sky-300 rounded-full transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-semibold btn-primary-neo"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-700/70 bg-slate-900/70 text-slate-100 hover:border-sky-500/70 hover:bg-slate-800/80 transition-colors shadow-lg shadow-slate-950/70"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-700/70 mt-2 space-y-2 pt-3">
            {logged ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin-dashboard" 
                    className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⌘ Dashboard
                  </Link>
                )}
                <Link 
                  to="/interviews" 
                  className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Interviews
                </Link>                {isAdminOrHR && (
                  <Link 
                    to={role === 'ADMIN' ? '/admin/questions' : '/hr/questions'} 
                    className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ❓ Questions
                  </Link>
                )}
                {isAdminOrHR && (
                  <Link 
                    to={role === 'ADMIN' ? '/admin/candidates' : '/hr/candidates'} 
                    className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👥 Candidates
                  </Link>
                )}
                {isAdminOrHR && (
                  <Link 
                    to={role === 'ADMIN' ? '/admin/analytics' : '/hr/analytics'} 
                    className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Analytics
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-300 hover:text-rose-200 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-sm font-medium text-slate-100 hover:text-sky-300 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 text-sm font-semibold btn-primary-neo text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
        </div>
      </div>
    </header>
  )
}
