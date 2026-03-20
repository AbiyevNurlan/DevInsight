import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import SecurityMonitor from '../../components/SecurityMonitor'

interface DashboardStats {
  totalQuestions: number
  totalTemplates: number
  totalInterviews: number
  pendingReviews: number
  recentInterviews: Interview[]
}

interface Interview {
  id: number
  title: string
  candidateName: string
  status: string
  createdAt: string
}

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Load stats from various endpoints
      const [questionsRes, templatesRes] = await Promise.all([
        api.get('/hr/questions').catch(() => ({ data: [] })),
        api.get('/hr/templates').catch(() => ({ data: [] }))
      ])
      
      setStats({
        totalQuestions: questionsRes.data.length || 0,
        totalTemplates: templatesRes.data.length || 0,
        totalInterviews: 0,
        pendingReviews: 0,
        recentInterviews: []
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold text-slate-50">HR Command</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">
          Orchestrate question banks, templates, and upcoming interviews in one live view.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 tracking-[0.18em] uppercase">Question Bank</p>
              <p className="text-2xl md:text-3xl font-semibold text-sky-300 metric-value">
                {stats?.totalQuestions || 0}
              </p>
            </div>
            <div className="p-3 bg-sky-500/15 border border-sky-400/60 rounded-lg">
              <svg className="w-6 h-6 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link to="/hr/questions" className="text-sm text-sky-300 hover:text-sky-200 mt-4 block">
            Manage Questions →
          </Link>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 tracking-[0.18em] uppercase">Templates</p>
              <p className="text-2xl md:text-3xl font-semibold text-emerald-300 metric-value">
                {stats?.totalTemplates || 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/15 border border-emerald-400/60 rounded-lg">
              <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link to="/hr/templates" className="text-sm text-emerald-300 hover:text-emerald-200 mt-4 block">
            Manage Templates →
          </Link>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 tracking-[0.18em] uppercase">Total Interviews</p>
              <p className="text-2xl md:text-3xl font-semibold text-indigo-300 metric-value">
                {stats?.totalInterviews || 0}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/15 border border-indigo-400/60 rounded-lg">
              <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <Link to="/interviews" className="text-sm text-sky-300 hover:text-sky-200 mt-4 block">
            View Interviews →
          </Link>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 tracking-[0.18em] uppercase">Pending Reviews</p>
              <p className="text-2xl md:text-3xl font-semibold text-amber-300 metric-value">
                {stats?.pendingReviews || 0}
              </p>
            </div>
            <div className="p-3 bg-amber-500/15 border border-amber-400/60 rounded-lg">
              <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <Link to="/hr/reviews" className="text-sm text-amber-300 hover:text-amber-200 mt-4 block">
            Review Submissions →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-50 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/hr/questions"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-sky-400/70 hover:bg-slate-900/80 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-slate-100">Add Question</span>
          </Link>
          <Link
            to="/hr/templates"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-emerald-400/70 hover:bg-slate-900/80 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <span className="font-medium text-slate-100">Create Template</span>
          </Link>
          <Link
            to="/interviews"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-sky-400/70 hover:bg-slate-900/80 transition-colors"
          >
            <span className="text-2xl">🎯</span>
            <span className="font-medium text-slate-100">Start Interview</span>
          </Link>
          <Link
            to="/hr/candidates"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-fuchsia-400/70 hover:bg-slate-900/80 transition-colors"
          >
            <span className="text-2xl">👥</span>
            <span className="font-medium text-slate-100">View Candidates</span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-lg border border-emerald-400/40">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <span className="text-emerald-300">✓</span>
              </div>
              <div>
                <p className="font-medium text-slate-100">Interview Completed</p>
                <p className="text-sm text-slate-400">John Doe - Senior Developer</p>
              </div>
              <span className="ml-auto text-sm text-slate-500">2h ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-lg border border-sky-400/40">
              <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center">
                <span className="text-sky-300">📝</span>
              </div>
              <div>
                <p className="font-medium text-slate-100">Template Created</p>
                <p className="text-sm text-slate-400">Backend Developer Interview</p>
              </div>
              <span className="ml-auto text-sm text-slate-500">5h ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-lg border border-fuchsia-400/40">
              <div className="w-10 h-10 rounded-full bg-fuchsia-500/15 flex items-center justify-center">
                <span className="text-fuchsia-300">➕</span>
              </div>
              <div>
                <p className="font-medium text-slate-100">Question Added</p>
                <p className="text-sm text-slate-400">System Design - Scalability</p>
              </div>
              <span className="ml-auto text-sm text-slate-500">1d ago</span>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-4">Upcoming Interviews</h2>
          <div className="space-y-4">
            <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-100">Jane Smith</span>
                <span className="px-2 py-1 bg-amber-500/15 text-amber-200 text-xs rounded-full border border-amber-400/60">Scheduled</span>
              </div>
              <p className="text-sm text-slate-400">Frontend Developer Position</p>
              <p className="text-sm text-slate-500 mt-2">Tomorrow, 10:00 AM</p>
            </div>
            <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-100">Mike Johnson</span>
                <span className="px-2 py-1 bg-amber-500/15 text-amber-200 text-xs rounded-full border border-amber-400/60">Scheduled</span>
              </div>
              <p className="text-sm text-slate-400">Full Stack Developer Position</p>
              <p className="text-sm text-slate-500 mt-2">Dec 21, 2:00 PM</p>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-sky-300 hover:text-sky-200 text-sm font-medium">
            View All Interviews →
          </button>
        </div>
      </div>

      {/* Security Monitor - Real-time Violation Tracking */}
      <div className="mt-8">
        <SecurityMonitor showAll={true} />
      </div>
    </div>
  )
}

export default HRDashboard
