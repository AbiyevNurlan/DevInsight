import api from './api'

export interface ViolationReport {
  interviewId: number
  type: string
  details: string
  severity?: string
  screenshotData?: string
  videoTimestamp?: number
  browserInfo?: string
}

export interface Violation {
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

class SecurityService {
  /**
   * Report a security violation to backend
   */
  async reportViolation(violation: ViolationReport): Promise<Violation> {
    try {
      const response = await api.post('/security/violations/report', violation)
      return response.data?.data || response.data
    } catch (error) {
      console.error('Failed to report violation:', error)
      throw error
    }
  }

  /**
   * Get violations for an interview (HR only)
   */
  async getInterviewViolations(interviewId: number): Promise<Violation[]> {
    try {
      const response = await api.get(`/security/violations/interview/${interviewId}`)
      return response.data?.data || response.data
    } catch (error) {
      console.error('Failed to fetch interview violations:', error)
      return []
    }
  }

  /**
   * Get user violations for specific interview (HR only)
   */
  async getUserInterviewViolations(userId: number, interviewId: number): Promise<Violation[]> {
    try {
      const response = await api.get(`/security/violations/user/${userId}/interview/${interviewId}`)
      return response.data?.data || response.data
    } catch (error) {
      console.error('Failed to fetch user violations:', error)
      return []
    }
  }

  /**
   * Get recent violations (HR only)
   */
  async getRecentViolations(hours: number = 24): Promise<Violation[]> {
    try {
      const response = await api.get(`/security/violations/recent?hours=${hours}`)
      return response.data?.data || response.data
    } catch (error) {
      console.error('Failed to fetch recent violations:', error)
      return []
    }
  }

  /**
   * Get critical violations (HR only)
   */
  async getCriticalViolations(): Promise<Violation[]> {
    try {
      const response = await api.get('/security/violations/critical')
      return response.data?.data || response.data
    } catch (error) {
      console.error('Failed to fetch critical violations:', error)
      return []
    }
  }

  /**
   * Resolve a violation (HR only)
   */
  async resolveViolation(violationId: number): Promise<void> {
    try {
      await api.put(`/security/violations/${violationId}/resolve`)
    } catch (error) {
      console.error('Failed to resolve violation:', error)
      throw error
    }
  }

  /**
   * Capture screenshot as base64
   */
  async captureScreenshot(): Promise<string | null> {
    try {
      const canvas = document.createElement('canvas')
      const video = document.querySelector('video')
      
      if (!video) return null

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(video, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.5)
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      return null
    }
  }

  /**
   * Get browser info
   */
  getBrowserInfo(): string {
    return JSON.stringify({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }
}

export default new SecurityService()
