import api from './api'

// Types
export interface AnalyticsOverview {
  totalInterviews: number
  completionRate: number
  averageScore: number
  passRate: number
}

export interface InterviewTrend {
  date: string
  count: number
}

export interface ScoreDistribution {
  scoreRange: string
  count: number
}

export interface PassFailRatio {
  passed: number
  failed: number
  pending: number
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Analytics Service
export const analyticsService = {
  /**
   * Get analytics overview with key metrics
   */
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await api.get('/analytics/overview')
    return (response.data as ApiResponse<AnalyticsOverview>).data
  },

  /**
   * Get interview trends for the last N days
   */
  async getTrends(days: number = 30): Promise<InterviewTrend[]> {
    const response = await api.get(`/analytics/trends?days=${days}`)
    return (response.data as ApiResponse<InterviewTrend[]>).data
  },

  /**
   * Get score distribution across ranges
   */
  async getScoreDistribution(): Promise<ScoreDistribution[]> {
    const response = await api.get('/analytics/score-distribution')
    return (response.data as ApiResponse<ScoreDistribution[]>).data
  },

  /**
   * Get pass/fail/pending ratio
   */
  async getPassFailRatio(): Promise<PassFailRatio> {
    const response = await api.get('/analytics/pass-fail-ratio')
    return (response.data as ApiResponse<PassFailRatio>).data
  },

  /**
   * Get hiring statistics for reports page
   */
  async getHiringStats(): Promise<any> {
    const response = await api.get('/analytics/hiring-stats')
    return (response.data as ApiResponse<any>).data
  }
}

export default analyticsService
