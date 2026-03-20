import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Lock,
  BookOpen,
  Clock,
  Layout,
  Zap,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react'

type Interview = { id: number; title: string; description?: string; isPublic?: boolean }

export default function Dashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const isLoggedIn = !!api.getToken()
  const role = api.getRole()

  // Redirect based on role
  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true })
        return
      }
      if (role === 'HR') {
        navigate('/hr/dashboard', { replace: true })
        return
      }
      if (role === 'CANDIDATE') {
        navigate('/candidate/dashboard', { replace: true })
        return
      }
    }
  }, [isLoggedIn, role, navigate])

  useEffect(() => {
    if (!isLoggedIn) {
      setItems([])
      setLoading(false)
      return
    }

    api.get('/interviews')
      .then(res => setItems(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div>
          <h1 className="text-3xl font-semibold text-apple-primary tracking-tight">Overview</h1>
          <p className="text-apple-secondary mt-1 text-sm font-medium">Manage your simulations and track progress.</p>
        </div>
        {isLoggedIn && (
          <Link to="/interviews" className="btn-primary-saas flex items-center gap-2 text-sm">
            <span>New Simulation</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </header>

      {/* Main Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]"
      >

        {/* Metric Cards - Row 1 */}
        {isLoggedIn && (
          <>
            <motion.div variants={itemAnim} className="bento-card p-6 flex flex-col justify-between h-48 md:col-span-1">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/10">
                  <BookOpen size={20} className="text-white" />
                </div>
                <span className="text-xs font-medium text-apple-tertiary uppercase tracking-widest">Total</span>
              </div>
              <div>
                <div className="text-4xl font-light text-apple-primary tracking-tight">{items.length}</div>
                <div className="text-apple-secondary text-sm mt-1 font-light">Active Simulations</div>
              </div>
            </motion.div>

            <motion.div variants={itemAnim} className="bento-card p-6 flex flex-col justify-between h-48 md:col-span-1">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/10">
                  <Zap size={20} className="text-white" />
                </div>
                <span className="text-xs font-medium text-apple-tertiary uppercase tracking-widest">Success</span>
              </div>
              <div>
                <div className="text-4xl font-light text-apple-primary tracking-tight">84%</div>
                <div className="text-apple-secondary text-sm mt-1 font-light">Completion Rate</div>
              </div>
            </motion.div>

            <motion.div variants={itemAnim} className="bento-card p-6 flex flex-col justify-between h-48 md:col-span-2 relative overflow-hidden group">
              {/* Monochrome subtle gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500" />

              <div className="flex justify-between items-start relative z-10">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/10">
                  <Activity size={20} className="text-white" />
                </div>
                <span className="text-xs font-medium text-apple-tertiary uppercase tracking-widest">Velocity</span>
              </div>
              <div className="relative z-10 w-full">
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-light text-apple-primary tracking-tight">12.5h</div>
                  <span className="text-apple-secondary text-sm font-light">+2.4h this week</span>
                </div>
                <div className="text-apple-secondary text-sm mt-1 font-light">Total Focus Time</div>
                {/* Monochrome Chart Visual */}
                <div className="mt-4 flex gap-1 items-end h-8 opacity-30">
                  {[40, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-white rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Welcome Section / Fallback */}
        {!isLoggedIn && (
          <motion.div variants={itemAnim} className="md:col-span-4 bento-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Lock className="w-6 h-6 text-zinc-400" />
            </div>
            <h2 className="text-3xl font-semibold text-apple-primary mb-3 tracking-tight">Restricted Access</h2>
            <p className="text-apple-secondary max-w-md mb-8 font-light leading-relaxed">Authentication required to access the enterprise simulation environment.</p>
            <div className="flex gap-4">
              <Link to="/login" className="btn-primary-saas">Authenticate</Link>
              <Link to="/register" className="btn-secondary-saas">Request Access</Link>
            </div>
          </motion.div>
        )}

        {/* Recent Interviews Grid - Row 2+ */}
        {isLoggedIn && items.length > 0 && (
          <div className="md:col-span-4 mt-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-apple-primary tracking-tight">Recent Simulations</h3>
              <Link to="/interviews" className="text-sm text-apple-secondary hover:text-apple-primary flex items-center gap-1 transition-colors font-medium">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.slice(0, 6).map((interview) => (
                <Link key={interview.id} to={`/interviews/${interview.id}`} className="group">
                  <div className="bento-card p-8 h-full flex flex-col relative group-hover:border-white/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      {/* Monochrome Status Indicator */}
                      <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold border ${interview.isPublic ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800'}`}>
                        {interview.isPublic ? 'Public' : 'Private'}
                      </div>
                      <Layers size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
                    </div>

                    <h4 className="text-xl font-semibold text-apple-primary mb-3 group-hover:text-apple-primary transition-colors tracking-tight">{interview.title}</h4>
                    <p className="text-apple-secondary text-sm line-clamp-2 leading-relaxed mb-8 font-light">{interview.description || 'System simulation module.'}</p>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full bg-black border border-white/10 flex items-center justify-center text-[9px] text-zinc-500">AI</div>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-white flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        OPEN <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}
