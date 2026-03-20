import api from './api'

export interface Answer {
  questionId: number
  answer: string
}

export interface SubmissionRequest {
  answers: Answer[]
}

export interface QuestionAnswer {
  answerId: number
  questionId: number
  questionTitle: string
  userAnswer: string
  similarityScore: number
  pointsEarned: number
  maxPoints: number
  feedback: string
  status: 'CORRECT' | 'PARTIAL' | 'INCORRECT'
}

export interface SubmissionResult {
  submissionId: number
  interviewId: number
  interviewTitle: string
  totalScore: number
  totalQuestions: number
  answeredQuestions: number
  percentageScore: number
  status: string
  submittedAt: string
  results: QuestionAnswer[]
}

export interface SubmissionStatistics {
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
}

/**
 * Submit interview answers and get grading results
 */
export async function submitInterview(
  interviewId: number,
  answers: Answer[]
): Promise<SubmissionResult> {
  try {
    const response = await api.post(`/submissions/interviews/${interviewId}`, {
      answers
    })
    
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('[submissionService] Submit interview error:', error)
    throw error
  }
}

/**
 * Get submission results by ID
 */
export async function getSubmissionResults(
  submissionId: number
): Promise<SubmissionResult> {
  try {
    const response = await api.get(`/submissions/${submissionId}`)
    
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('[submissionService] Get submission results error:', error)
    throw error
  }
}

/**
 * Get current user's submissions for an interview
 */
export async function getUserSubmissions(
  interviewId: number
): Promise<SubmissionResult[]> {
  try {
    const response = await api.get(`/submissions/interviews/${interviewId}/my-submissions`)
    
    return response.data?.data || response.data || []
  } catch (error: any) {
    console.error('[submissionService] Get user submissions error:', error)
    throw error
  }
}

/**
 * Get all submissions for an interview (admin/HR only)
 */
export async function getInterviewSubmissions(
  interviewId: number
): Promise<SubmissionResult[]> {
  try {
    const response = await api.get(`/submissions/interviews/${interviewId}`)
    
    return response.data?.data || response.data || []
  } catch (error: any) {
    console.error('[submissionService] Get interview submissions error:', error)
    throw error
  }
}

/**
 * Get submission statistics for an interview (admin/HR only)
 */
export async function getSubmissionStatistics(
  interviewId: number
): Promise<SubmissionStatistics> {
  try {
    const response = await api.get(`/submissions/interviews/${interviewId}/statistics`)
    
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('[submissionService] Get statistics error:', error)
    throw error
  }
}
