import api from './api'

// Types
export interface User {
  id: number
  email: string
  fullName: string
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' | 'HR' | 'RECRUITER' | 'INTERVIEWER'
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  bio?: string
  skills?: string[]
  avatarUrl?: string
  companyId?: number
  companyName?: string
  createdAt?: string
  lastLoginAt?: string
}

export interface Interview {
  id: number
  title: string
  description?: string
  level: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD'
  type: 'CODING' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'MIXED'
  durationMinutes?: number
  companyId?: number
  companyName?: string
  createdById?: number
  createdByName?: string
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  isPublic?: boolean
  passingScore?: number
  createdAt?: string
  updatedAt?: string
}

export interface Company {
  id: number
  name: string
  domain?: string
  description?: string
  industry?: string
  website?: string
  logoUrl?: string
  size?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE'
  employeeCount?: number
  interviewCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Submission {
  id: number
  interviewId?: number
  interviewTitle?: string
  candidateId?: number
  candidateName?: string
  candidateEmail?: string
  questionId?: number
  questionTitle?: string
  codeSubmission?: string
  textAnswer?: string
  videoUrl?: string
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ANALYZING' | 'ANALYZED' | 'FAILED'
  startedAt?: string
  submittedAt?: string
  timeSpentSeconds?: number
  createdAt?: string
  overallScore?: number
  feedback?: string
}

export interface Participant {
  id: number
  candidateId?: number
  candidateName?: string
  candidateEmail?: string
  role?: string
  interviewId?: number
  interviewTitle?: string
  examStartTime?: string
  examEndTime?: string
  durationMinutes?: number
  timeSpentSeconds?: number
  status?: 'IN_PROGRESS' | 'SUBMITTED' | 'ANALYZING' | 'ANALYZED' | 'FAILED'
  score?: number
  maxScore?: number
  percentage?: number
  feedback?: string
  passed?: boolean
  createdAt?: string
  companyName?: string
}

export interface AuditLog {
  id: number
  entityType: string
  entityId: number
  action: string
  oldValue?: string
  newValue?: string
  performedBy: string
  ipAddress?: string
  performedAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AdminStats {
  totalUsers: number
  totalInterviews: number
  totalCompanies: number
  totalSubmissions: number
  activeInterviews: number
  draftInterviews: number
}

// Admin API Service
class AdminService {
  // Stats
  async getStats(): Promise<AdminStats> {
    const res = await api.get('/admin/stats')
    return res.data.data
  }

  // Users
  async getUsers(page = 0, size = 10, search?: string): Promise<PageResponse<User>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (search) params.append('search', search)
    const res = await api.get(`/admin/users?${params}`)
    return res.data.data
  }

  async getUser(id: number): Promise<User> {
    const res = await api.get(`/admin/users/${id}`)
    return res.data.data
  }

  async createUser(user: Partial<User> & { password?: string }): Promise<User> {
    const res = await api.post('/admin/users', user)
    return res.data.data
  }

  async updateUser(id: number, user: Partial<User> & { password?: string }): Promise<User> {
    const res = await api.put(`/admin/users/${id}`, user)
    return res.data.data
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  }

  // Interviews
  async getInterviews(page = 0, size = 10, search?: string): Promise<PageResponse<Interview>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (search) params.append('search', search)
    const res = await api.get(`/admin/interviews?${params}`)
    return res.data.data
  }

  async getInterview(id: number): Promise<Interview> {
    const res = await api.get(`/admin/interviews/${id}`)
    return res.data.data
  }

  async createInterview(interview: Partial<Interview>): Promise<Interview> {
    const res = await api.post('/admin/interviews', interview)
    return res.data.data
  }

  async updateInterview(id: number, interview: Partial<Interview>): Promise<Interview> {
    const res = await api.put(`/admin/interviews/${id}`, interview)
    return res.data.data
  }

  async deleteInterview(id: number): Promise<void> {
    await api.delete(`/admin/interviews/${id}`)
  }

  // Companies
  async getCompanies(page = 0, size = 10, search?: string): Promise<PageResponse<Company>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (search) params.append('search', search)
    const res = await api.get(`/admin/companies?${params}`)
    return res.data.data
  }

  async getCompany(id: number): Promise<Company> {
    const res = await api.get(`/admin/companies/${id}`)
    return res.data.data
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const res = await api.post('/admin/companies', company)
    return res.data.data
  }

  async updateCompany(id: number, company: Partial<Company>): Promise<Company> {
    const res = await api.put(`/admin/companies/${id}`, company)
    return res.data.data
  }

  async deleteCompany(id: number): Promise<void> {
    await api.delete(`/admin/companies/${id}`)
  }

  // Submissions
  async getSubmissions(page = 0, size = 10, search?: string): Promise<PageResponse<Submission>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (search) params.append('search', search)
    const res = await api.get(`/admin/submissions?${params}`)
    return res.data.data
  }

  async getSubmission(id: number): Promise<Submission> {
    const res = await api.get(`/admin/submissions/${id}`)
    return res.data.data
  }

  async updateSubmissionStatus(id: number, status: string): Promise<Submission> {
    const res = await api.patch(`/admin/submissions/${id}/status?status=${status}`)
    return res.data.data
  }

  async deleteSubmission(id: number): Promise<void> {
    await api.delete(`/admin/submissions/${id}`)
  }

  // Audit Logs
  async getAuditLogs(page = 0, size = 20, entityType?: string): Promise<PageResponse<AuditLog>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (entityType) params.append('entityType', entityType)
    const res = await api.get(`/admin/audit-logs?${params}`)
    return res.data.data
  }

  async getRecentAuditLogs(hours = 24): Promise<AuditLog[]> {
    const res = await api.get(`/admin/audit-logs/recent?hours=${hours}`)
    return res.data.data
  }

  // Participants
  async getParticipants(
    page = 0, 
    size = 10, 
    search?: string,
    sortBy = 'examStartTime',
    sortDir = 'desc',
    startDate?: string,
    endDate?: string,
    status?: string,
    role?: string
  ): Promise<PageResponse<Participant>> {
    const params = new URLSearchParams({ 
      page: String(page), 
      size: String(size),
      sortBy,
      sortDir
    })
    if (search) params.append('search', search)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (status) params.append('status', status)
    if (role) params.append('role', role)
    const res = await api.get(`/admin/participants?${params}`)
    return res.data.data
  }

  async getParticipant(id: number): Promise<Participant> {
    const res = await api.get(`/admin/participants/${id}`)
    return res.data.data
  }

  async getParticipantsByInterview(interviewId: number): Promise<Participant[]> {
    const res = await api.get(`/admin/participants/interview/${interviewId}`)
    return res.data.data
  }
}

export const adminService = new AdminService()
export default adminService
