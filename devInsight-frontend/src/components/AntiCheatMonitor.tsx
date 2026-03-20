import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Monitor, AlertTriangle, Eye, ShieldAlert } from 'lucide-react'
import securityService from '../services/securityService'
import FaceDetection from './FaceDetection'

interface AntiCheatProps {
  interviewId: number
  onViolation: (type: string, details: string) => void
  enableCamera?: boolean
  enableScreenShare?: boolean
  enableTabSwitch?: boolean
  enableCopyPaste?: boolean
  enableFullscreen?: boolean
  enableFaceDetection?: boolean
}

interface Violation {
  id: string
  type: string
  message: string
  timestamp: Date
}

export default function AntiCheatMonitor({
  interviewId,
  onViolation,
  enableCamera = true,
  enableScreenShare = false,
  enableTabSwitch = true,
  enableCopyPaste = true,
  enableFullscreen = true,
  enableFaceDetection = true
}: AntiCheatProps) {
  const [violations, setViolations] = useState<Violation[]>([])
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)

  // Log violation and send to backend
  const logViolation = useCallback(async (type: string, message: string) => {
    const violation: Violation = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    setViolations(prev => [...prev, violation])
    onViolation(type, message)
    console.warn(`⚠️ ANTI-CHEAT: ${type} - ${message}`)

    // Send to backend
    try {
      const screenshot = await securityService.captureScreenshot()
      await securityService.reportViolation({
        interviewId,
        type,
        details: message,
        screenshotData: screenshot || undefined,
        videoTimestamp: Date.now(),
        browserInfo: securityService.getBrowserInfo()
      })
      console.log('✅ Violation reported to backend')
    } catch (error) {
      console.error('Failed to report violation to backend:', error)
    }
  }, [interviewId, onViolation])

  // 1. TAB SWITCH DETECTION
  useEffect(() => {
    if (!enableTabSwitch) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1)
        logViolation('TAB_SWITCH', `User switched tab/window (Count: ${tabSwitchCount + 1})`)
      }
    }

    const handleBlur = () => {
      logViolation('WINDOW_BLUR', 'User lost focus from interview window')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [enableTabSwitch, logViolation, tabSwitchCount])

  // 2. COPY-PASTE BLOCKER
  useEffect(() => {
    if (!enableCopyPaste) return

    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      logViolation('COPY_ATTEMPT', 'User tried to copy content')
    }

    const blockPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      logViolation('PASTE_ATTEMPT', 'User tried to paste content')
    }

    const blockCut = (e: ClipboardEvent) => {
      e.preventDefault()
      logViolation('CUT_ATTEMPT', 'User tried to cut content')
    }

    document.addEventListener('copy', blockCopy)
    document.addEventListener('paste', blockPaste)
    document.addEventListener('cut', blockCut)

    return () => {
      document.removeEventListener('copy', blockCopy)
      document.removeEventListener('paste', blockPaste)
      document.removeEventListener('cut', blockCut)
    }
  }, [enableCopyPaste, logViolation])

  // 3. RIGHT-CLICK BLOCKER
  useEffect(() => {
    const blockRightClick = (e: MouseEvent) => {
      e.preventDefault()
      logViolation('RIGHT_CLICK', 'User tried to open context menu')
    }

    document.addEventListener('contextmenu', blockRightClick)
    return () => document.removeEventListener('contextmenu', blockRightClick)
  }, [logViolation])

  // 4. KEYBOARD SHORTCUTS BLOCKER
  useEffect(() => {
    const blockShortcuts = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 's'].includes(e.key.toLowerCase())) {
        if (['c', 'v', 'x'].includes(e.key.toLowerCase())) {
          e.preventDefault()
          logViolation('KEYBOARD_SHORTCUT', `User tried ${e.key.toUpperCase()} shortcut`)
        }
      }

      // Block F12, Ctrl+Shift+I (DevTools)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        logViolation('DEVTOOLS_ATTEMPT', 'User tried to open DevTools')
      }

      // Block Ctrl+Shift+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        logViolation('INSPECT_ATTEMPT', 'User tried to inspect element')
      }
    }

    document.addEventListener('keydown', blockShortcuts)
    return () => document.removeEventListener('keydown', blockShortcuts)
  }, [logViolation])

  // 5. FULLSCREEN ENFORCEMENT
  useEffect(() => {
    if (!enableFullscreen) return

    const requestFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (err) {
        logViolation('FULLSCREEN_DENIED', 'User denied fullscreen mode')
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        logViolation('FULLSCREEN_EXIT', 'User exited fullscreen mode')
        // Try to re-enter fullscreen
        setTimeout(requestFullscreen, 500)
      } else {
        setIsFullscreen(true)
      }
    }

    requestFullscreen()
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  }, [enableFullscreen, logViolation])

  // 6. CAMERA MONITORING
  useEffect(() => {
    if (!enableCamera) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          }, 
          audio: false 
        })
        setCameraStream(stream)
        console.log('✅ Camera monitoring started')
      } catch (err) {
        logViolation('CAMERA_DENIED', 'User denied camera access')
        console.error('Camera access denied:', err)
      }
    }

    startCamera()

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [enableCamera, logViolation])

  // 7. SCREEN SHARE MONITORING (optional)
  useEffect(() => {
    if (!enableScreenShare) return

    const startScreenShare = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { 
            displaySurface: 'monitor'
          } 
        })
        setScreenStream(stream)
        console.log('✅ Screen monitoring started')

        // Detect if user stops sharing
        stream.getVideoTracks()[0].onended = () => {
          logViolation('SCREEN_SHARE_STOPPED', 'User stopped screen sharing')
        }
      } catch (err) {
        logViolation('SCREEN_SHARE_DENIED', 'User denied screen sharing')
        console.error('Screen share denied:', err)
      }
    }

    startScreenShare()

    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [enableScreenShare, logViolation])

  // 8. DEVTOOLS DETECTION
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        logViolation('DEVTOOLS_OPEN', 'DevTools might be open')
      }
    }

    const interval = setInterval(detectDevTools, 1000)
    return () => clearInterval(interval)
  }, [logViolation])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Face Detection */}
      {enableFaceDetection && (
        <FaceDetection
          videoStream={cameraStream}
          onViolation={logViolation}
          enabled={enableFaceDetection}
        />
      )}

      {/* Camera Preview */}
      {enableCamera && cameraStream && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <video
            autoPlay
            muted
            playsInline
            ref={video => {
              if (video && cameraStream) {
                video.srcObject = cameraStream
              }
            }}
            className="w-40 h-30 rounded-lg border-2 border-blue-500/30 bg-slate-900 object-cover"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">REC</span>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-slate-900/80 rounded-full">
            <Camera className="w-3 h-3 text-white" />
            <span className="text-xs text-white">Monitoring</span>
          </div>
        </motion.div>
      )}

      {/* Screen Share Indicator */}
      {enableScreenShare && screenStream && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Screen Recording</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Fullscreen Warning */}
      {enableFullscreen && !isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400 font-medium">Exit Fullscreen Detected</span>
          </div>
        </motion.div>
      )}

      {/* Tab Switch Counter */}
      {tabSwitchCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">
              Tab Switches: {tabSwitchCount}
            </span>
          </div>
        </motion.div>
      )}

      {/* Recent Violations */}
      <AnimatePresence>
        {violations.slice(-3).map(violation => (
          <motion.div
            key={violation.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg backdrop-blur-sm max-w-xs"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-rose-400 font-medium">{violation.type}</p>
                <p className="text-xs text-slate-400 mt-0.5">{violation.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Export violation logger for use in parent component
export const createViolationLogger = () => {
  const violations: Array<{ type: string; details: string; timestamp: Date }> = []

  return {
    log: (type: string, details: string) => {
      violations.push({ type, details, timestamp: new Date() })
    },
    getViolations: () => violations,
    clear: () => violations.splice(0, violations.length)
  }
}
