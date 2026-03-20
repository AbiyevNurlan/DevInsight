import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  AlertTriangle, 
  X, 
  Eye, 
  Shield,
  ChevronRight,
  Camera,
  Copy,
  Monitor,
  Users,
  Zap
} from 'lucide-react'
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
}

const violationIcons: Record<string, React.ReactNode> = {
  TAB_SWITCH: <Monitor className="w-4 h-4" />,
  WINDOW_BLUR: <Eye className="w-4 h-4" />,
  COPY_ATTEMPT: <Copy className="w-4 h-4" />,
  PASTE_ATTEMPT: <Copy className="w-4 h-4" />,
  DEVTOOLS_OPEN: <Monitor className="w-4 h-4" />,
  CAMERA_DENIED: <Camera className="w-4 h-4" />,
  NO_FACE_DETECTED: <Users className="w-4 h-4" />,
  MULTIPLE_FACES: <Users className="w-4 h-4" />,
  AI_CONTENT_DETECTED: <Zap className="w-4 h-4" />,
}

const severityStyles: Record<string, { bg: string; border: string; text: string; pulse: boolean }> = {
  LOW: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', pulse: false },
  MEDIUM: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', pulse: false },
  HIGH: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', pulse: true },
  CRITICAL: { bg: 'bg-red-600/10', border: 'border-red-500/30', text: 'text-red-400', pulse: true },
}

export default function ViolationAlert() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date())

  const fetchViolations = useCallback(async () => {
    try {
      const response = await api.get('/security/violations/recent?hours=1')
      const data = response.data?.data || []
      
      // Check for new violations
      const newViolations = data.filter((v: Violation) => 
        new Date(v.timestamp) > lastCheckTime
      )
      
      if (newViolations.length > 0) {
        setUnreadCount(prev => prev + newViolations.length)
        
        // Play sound for critical violations
        if (newViolations.some((v: Violation) => v.severity === 'CRITICAL' || v.severity === 'HIGH')) {
          playAlertSound()
        }
      }
      
      setViolations(data.slice(0, 10))
      setLastCheckTime(new Date())
    } catch (error) {
      // Silently fail - user might not have permission
    }
  }, [lastCheckTime])

  // Play alert sound
  const playAlertSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVd/tKt8rJBtWm17sKegg4VcVmi9trGnlYVaVm2cqYxpVVxwipR8aGFpfYiBdHBtcXN1cHBwbnBubGpqaGhoaGhqamxscHB0dnh8gIKGio6SlpmfoKSmqKqsrrCys7a3ube3t7a2tra2trW1tba2tra2t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3trWzs7Kyr6yqp6SinpqVkIuFf3l0bmhlX1tXU09LSkhFREJBQD8/Pz8/Pz8/Pz4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pz9AQUJDREVHR0lLTE5QUlRXWVtdYGJkaGtucXR3en2Ag4aJjI6Rk5aYmpydoKGjpKanqKqrrK2ur7CwsbKzs7S0tLW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (e) {}
  }

  useEffect(() => {
    fetchViolations()
    
    // Poll every 10 seconds
    const interval = setInterval(fetchViolations, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const markAsRead = () => {
    setUnreadCount(0)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setShowPanel(!showPanel)
          if (!showPanel) markAsRead()
        }}
        className={`relative p-2.5 rounded-xl transition-all ${
          showPanel 
            ? 'bg-rose-500/20 text-rose-400' 
            : 'hover:bg-white/5 text-slate-400 hover:text-white'
        }`}
      >
        <Shield className="w-5 h-5" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse ring for critical */}
        {violations.some(v => v.severity === 'CRITICAL') && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowPanel(false)} 
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400" />
                  <span className="font-semibold text-white">Security Alerts</span>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Violations List */}
              <div className="max-h-80 overflow-y-auto">
                {violations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No recent violations</p>
                    <p className="text-slate-500 text-xs mt-1">All clear! ✓</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {violations.map((violation, i) => {
                      const style = severityStyles[violation.severity] || severityStyles.LOW
                      const icon = violationIcons[violation.type] || <AlertTriangle className="w-4 h-4" />
                      
                      return (
                        <motion.div
                          key={violation.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                            style.pulse ? 'bg-red-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${style.bg} ${style.text}`}>
                              {icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${style.text}`}>
                                  {violation.type.replace(/_/g, ' ')}
                                </span>
                                <span className={`px-1.5 py-0.5 text-[10px] rounded ${style.bg} ${style.text} border ${style.border}`}>
                                  {violation.severity}
                                </span>
                              </div>
                              
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {violation.userName} • {violation.interviewTitle || `Interview #${violation.interviewId}`}
                              </p>
                              
                              <p className="text-[10px] text-slate-500 mt-1">
                                {formatTime(violation.timestamp)}
                              </p>
                            </div>
                            
                            <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {violations.length > 0 && (
                <div className="p-3 border-t border-white/5 bg-slate-900/50">
                  <a
                    href="/hr"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    View All Security Events
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
