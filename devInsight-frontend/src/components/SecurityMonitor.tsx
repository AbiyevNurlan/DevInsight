import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Camera, 
  Copy, 
  Monitor,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  Filter,
  ChevronDown,
  User,
  Zap
} from 'lucide-react'
import { Client } from '@stomp/stompjs'
import api from '../services/api'

interface Violation {
  id: number
  type: string
  details: string
  severity: string
  timestamp: string
  userName: string
  userEmail: string
  interviewTitle: string
  interviewId: number
  ipAddress: string
  resolved: boolean
  hrNotified: boolean
}

interface SecurityMonitorProps {
  interviewId?: number
  showAll?: boolean
}

// Violation type icons and colors
const violationConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  TAB_SWITCH: { icon: <Monitor className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  WINDOW_BLUR: { icon: <Eye className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  COPY_ATTEMPT: { icon: <Copy className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  PASTE_ATTEMPT: { icon: <Copy className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  DEVTOOLS_ATTEMPT: { icon: <Monitor className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  DEVTOOLS_OPEN: { icon: <Monitor className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  FULLSCREEN_EXIT: { icon: <Monitor className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  CAMERA_DENIED: { icon: <Camera className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500/10' },
  NO_FACE_DETECTED: { icon: <Users className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500/10' },
  MULTIPLE_FACES: { icon: <Users className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500/10' },
  AI_CONTENT_DETECTED: { icon: <Zap className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  SUSPICIOUS_TYPING: { icon: <Zap className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

const severityColors: Record<string, string> = {
  LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  CRITICAL: 'bg-red-600/20 text-red-400 border-red-500/30 animate-pulse'
}

export default function SecurityMonitor({ interviewId, showAll = true }: SecurityMonitorProps) {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'unresolved'>('all')
  const [newViolations, setNewViolations] = useState<number[]>([])
  const [wsConnected, setWsConnected] = useState(false)

  // Fetch violations
  const fetchViolations = useCallback(async () => {
    try {
      let endpoint = '/security/violations/recent?hours=24'
      if (interviewId) {
        endpoint = `/security/violations/interview/${interviewId}`
      }
      
      const response = await api.get(endpoint)
      const data = response.data?.data || response.data || []
      setViolations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch violations:', error)
    } finally {
      setLoading(false)
    }
  }, [interviewId])

  useEffect(() => {
    fetchViolations()
    
    // Poll for new violations every 10 seconds
    const interval = setInterval(fetchViolations, 10000)
    
    return () => clearInterval(interval)
  }, [fetchViolations])

  // WebSocket connection for real-time updates
  useEffect(() => {
    const wsBase = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:8080'
    const client = new Client({
      brokerURL: wsBase.replace('http', 'ws') + '/api/ws-interview-native',
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true)

        // Subscribe to all HR violations
        client.subscribe('/topic/hr/violations', (message) => {
          try {
            const violation: Violation = JSON.parse(message.body)
            setViolations(prev => [violation, ...prev])
            setNewViolations(prev => [...prev, violation.id])
            setTimeout(() => {
              setNewViolations(prev => prev.filter(id => id !== violation.id))
            }, 5000)
          } catch (e) {
            console.error('Failed to parse violation:', e)
          }
        })

        // If monitoring a specific interview, subscribe to that channel too
        if (interviewId) {
          client.subscribe(`/topic/hr/interviews/${interviewId}/violations`, (message) => {
            try {
              const violation: Violation = JSON.parse(message.body)
              setViolations(prev => {
                if (prev.some(v => v.id === violation.id)) return prev
                return [violation, ...prev]
              })
            } catch (e) {
              console.error('Failed to parse interview violation:', e)
            }
          })
        }
      },
      onDisconnect: () => setWsConnected(false),
      onStompError: () => setWsConnected(false),
    })

    client.activate()
    return () => { client.deactivate() }
  }, [interviewId])

  // Resolve violation
  const handleResolve = async (violationId: number) => {
    try {
      await api.put(`/security/violations/${violationId}/resolve`)
      setViolations(prev => 
        prev.map(v => v.id === violationId ? { ...v, resolved: true } : v)
      )
    } catch (error) {
      console.error('Failed to resolve violation:', error)
    }
  }

  // Filter violations
  const filteredViolations = violations.filter(v => {
    if (filter === 'critical') return v.severity === 'HIGH' || v.severity === 'CRITICAL'
    if (filter === 'unresolved') return !v.resolved
    return true
  })

  // Stats
  const stats = {
    total: violations.length,
    critical: violations.filter(v => v.severity === 'HIGH' || v.severity === 'CRITICAL').length,
    unresolved: violations.filter(v => !v.resolved).length,
    today: violations.filter(v => {
      const today = new Date().toDateString()
      return new Date(v.timestamp).toDateString() === today
    }).length
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('az-AZ', { day: '2-digit', month: 'short' })
  }

  if (loading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security Monitor</h2>
              <p className="text-sm text-slate-400">Real-time violation tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              wsConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {wsConnected ? 'LIVE' : 'Offline'}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchViolations}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-1">Total Violations</div>
          </div>
          <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
            <div className="text-2xl font-bold text-rose-400">{stats.critical}</div>
            <div className="text-xs text-rose-300 mt-1">Critical</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-400">{stats.unresolved}</div>
            <div className="text-xs text-amber-300 mt-1">Unresolved</div>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{stats.today}</div>
            <div className="text-xs text-blue-300 mt-1">Today</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-4">
          {(['all', 'critical', 'unresolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'critical' ? 'Critical Only' : 'Unresolved'}
            </button>
          ))}
        </div>
      </div>

      {/* Violations List */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredViolations.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-400">No violations found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredViolations.map((violation, index) => {
                const config = violationConfig[violation.type] || { 
                  icon: <AlertTriangle className="w-4 h-4" />, 
                  color: 'text-slate-400',
                  bg: 'bg-slate-500/10'
                }
                const isNew = newViolations.includes(violation.id)

                return (
                  <motion.div
                    key={violation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-white/5 transition-colors ${isNew ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <span className={config.color}>{config.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{violation.type.replace(/_/g, ' ')}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${severityColors[violation.severity]}`}>
                            {violation.severity}
                          </span>
                          {violation.resolved && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Resolved
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-2">{violation.details}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{violation.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            <span>{violation.interviewTitle || `Interview #${violation.interviewId}`}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(violation.timestamp)} - {formatDate(violation.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {!violation.resolved && (
                        <button
                          onClick={() => handleResolve(violation.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>{filteredViolations.length} violations shown</span>
        </div>
      </div>
    </motion.div>
  )
}
