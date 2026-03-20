import React, { useEffect, useRef, useState, useCallback } from 'react'
import { AlertTriangle, Users, Eye } from 'lucide-react'

interface FaceDetectionProps {
  videoStream: MediaStream | null
  onViolation: (type: string, details: string) => void
  enabled?: boolean
}

/**
 * FREE Face Detection using Browser APIs
 * No external libraries needed!
 */
export default function FaceDetection({ videoStream, onViolation, enabled = true }: FaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceCount, setFaceCount] = useState(0)
  const [lastDetection, setLastDetection] = useState<Date | null>(null)
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval>>()

  // Simple face detection using pixel analysis
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !videoStream) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx || video.readyState !== 4) return

    try {
      // Draw video frame to canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Simple face detection algorithm
      // Count skin-tone colored regions (very basic)
      let skinPixels = 0
      let totalPixels = data.length / 4

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Detect skin tone (simplified)
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15) {
          skinPixels++
        }
      }

      const skinPercentage = (skinPixels / totalPixels) * 100

      // Estimate face count based on skin coverage
      let estimatedFaces = 0
      if (skinPercentage > 5 && skinPercentage < 15) {
        estimatedFaces = 1 // One face
      } else if (skinPercentage >= 15 && skinPercentage < 30) {
        estimatedFaces = 2 // Multiple faces
      } else if (skinPercentage >= 30) {
        estimatedFaces = 3 // Too many faces
      } else if (skinPercentage < 2) {
        estimatedFaces = 0 // No face
      }

      setFaceCount(estimatedFaces)
      setLastDetection(new Date())

      // Check for violations
      const now = Date.now()
      const timeSinceLastCheck = lastDetection ? now - lastDetection.getTime() : 10000

      if (timeSinceLastCheck > 3000) { // Check every 3 seconds
        if (estimatedFaces === 0) {
          onViolation('NO_FACE_DETECTED', 'No face detected in camera view')
        } else if (estimatedFaces > 1) {
          onViolation('MULTIPLE_FACES', `${estimatedFaces} faces detected - only 1 allowed`)
        }
      }

    } catch (error) {
      console.error('Face detection error:', error)
    }
  }, [videoStream, onViolation, lastDetection])

  useEffect(() => {
    if (!enabled || !videoStream) return

    // Set video source
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream
    }

    // Start detection loop
    detectionIntervalRef.current = setInterval(detectFaces, 2000) // Check every 2 seconds

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [enabled, videoStream, detectFaces])

  if (!enabled) return null

  return (
    <div className="hidden">
      {/* Hidden video for processing */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden"
      />
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Debug info (optional) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-slate-900/90 border border-white/10 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 text-white">
            <Eye className="w-4 h-4" />
            <span>Faces: {faceCount}</span>
          </div>
          {faceCount > 1 && (
            <div className="flex items-center gap-2 text-rose-400 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Multiple faces!</span>
            </div>
          )}
          {faceCount === 0 && lastDetection && (
            <div className="flex items-center gap-2 text-amber-400 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>No face detected</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * AI Content Detection using Typing Pattern Analysis
 * FREE - No external APIs needed
 */
export const useAIDetection = (onViolation: (type: string, details: string) => void) => {
  const [keystrokes, setKeystrokes] = useState<number[]>([])
  const [backspaceCount, setBackspaceCount] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const lastKeystrokeTime = useRef<number>(0)

  const analyzeTyping = useCallback((text: string, isBackspace: boolean = false) => {
    const now = Date.now()
    const timeSinceLastKey = now - lastKeystrokeTime.current

    if (timeSinceLastKey > 0 && timeSinceLastKey < 5000) {
      setKeystrokes(prev => [...prev, timeSinceLastKey])
    }

    lastKeystrokeTime.current = now

    if (isBackspace) {
      setBackspaceCount(prev => prev + 1)
    }

    setTotalChars(text.length)

    // Analyze patterns every 100 characters
    if (totalChars > 0 && totalChars % 100 === 0) {
      checkForAI()
    }
  }, [totalChars])

  const checkForAI = useCallback(() => {
    if (keystrokes.length < 20) return

    // Calculate average typing speed
    const avgSpeed = keystrokes.reduce((a, b) => a + b, 0) / keystrokes.length
    const wpm = Math.floor(60000 / (avgSpeed * 5)) // Words per minute

    // Detect AI patterns
    const suspiciousPatterns = []

    // 1. Too fast typing (>200 WPM sustained)
    if (wpm > 200) {
      suspiciousPatterns.push('Typing speed too fast')
    }

    // 2. Too consistent timing (AI tends to paste blocks)
    const variance = calculateVariance(keystrokes)
    if (variance < 50 && keystrokes.length > 50) {
      suspiciousPatterns.push('Typing pattern too consistent')
    }

    // 3. Too few backspaces (humans make mistakes)
    const backspaceRatio = backspaceCount / totalChars
    if (totalChars > 100 && backspaceRatio < 0.02) {
      suspiciousPatterns.push('Suspiciously few corrections')
    }

    // 4. Large chunks pasted at once (burst detection)
    const bursts = keystrokes.filter(time => time < 10).length
    const burstRatio = bursts / keystrokes.length
    if (burstRatio > 0.3 && keystrokes.length > 30) {
      suspiciousPatterns.push('Possible paste/copy behavior detected')
    }

    if (suspiciousPatterns.length >= 2) {
      onViolation(
        'AI_CONTENT_DETECTED',
        `AI-generated content suspected: ${suspiciousPatterns.join(', ')}. WPM: ${wpm}, Backspaces: ${backspaceCount}/${totalChars}`
      )
    }
  }, [keystrokes, backspaceCount, totalChars, onViolation])

  const calculateVariance = (arr: number[]): number => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2))
    return squareDiffs.reduce((a, b) => a + b, 0) / arr.length
  }

  const reset = () => {
    setKeystrokes([])
    setBackspaceCount(0)
    setTotalChars(0)
    lastKeystrokeTime.current = 0
  }

  return { analyzeTyping, reset }
}
