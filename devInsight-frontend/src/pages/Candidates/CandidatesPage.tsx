import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Mail, Phone, ExternalLink, Calendar, CheckCircle, XCircle, Clock, Award } from 'lucide-react'
import api from '../../services/api'
import DataTable from '../../components/DataTable'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import { useToast } from '../../components/Toast'

// Type definitions
interface CandidateProfile {
  id: number
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  bio: string | null
  skills: string[]
  linkedinUrl: string | null
  githubUrl: string | null
  status: string
  createdAt: string
  lastLoginAt: string | null
  totalInterviews: number
  completedInterviews: number
  pendingInterviews: number
  averageScore: number
  lastInterviewDate: string | null
  candidateStatus: string
  companyId: number | null
  companyName: string | null
}

interface InterviewHistory {
  interviewId: number
  interviewTitle: string
  interviewType: string | null
  companyName: string | null
  submissionId: number
  submissionStatus: string
  score: number | null
  feedback: string | null
  startedAt: string
  completedAt: string | null
  durationMinutes: number | null
  totalQuestions: number
  answeredQuestions: number
  completionRate: number
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'PASSED': 'bg-white text-zinc-950 border-white',
    'FAILED': 'bg-zinc-900 text-zinc-500 border-zinc-800',
    'SCHEDULED': 'bg-zinc-800 text-zinc-300 border-zinc-700',
    'INTERVIEWED': 'bg-white/10 text-white border-white/20',
    'NEW': 'bg-white/5 text-text-secondary border-white/10',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || 'bg-white/10 text-text-secondary border-white/10'}`}>
      {status}
    </span>
  )
}

// Score badge component
function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-text-muted text-sm">N/A</span>
  }

  let colorClass = 'text-text-secondary'
  if (score >= 80) colorClass = 'text-white font-light'
  else if (score >= 60) colorClass = 'text-zinc-300 font-light'
  else if (score >= 40) colorClass = 'text-zinc-400 font-light'
  else colorClass = 'text-zinc-500 font-light'

  return <span className={`${colorClass} text-sm`}>{score.toFixed(1)}%</span>
}

export default function CandidatesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [candidates, setCandidates] = useState<PageResponse<CandidateProfile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [skillsFilter, setSkillsFilter] = useState<string>('')

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null)
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    const role = api.getRole()
    if (role !== 'ADMIN' && role !== 'HR') {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc'
      }

      if (searchQuery) params.search = searchQuery
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter
      if (skillsFilter) params.skills = skillsFilter

      const res = await api.get('/candidates', { params })
      setCandidates(res.data?.data || null)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load candidates:', err)
      setError('Failed to load candidates. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, statusFilter, skillsFilter])

  useEffect(() => {
    loadCandidates()
  }, [loadCandidates])

  const handleRowClick = async (candidate: CandidateProfile) => {
    setSelectedCandidate(candidate)
    setModalOpen(true)
    setHistoryLoading(true)

    try {
      const res = await api.get(`/candidates/${candidate.id}/history`)
      setInterviewHistory(res.data?.data || [])
    } catch (err) {
      console.error('Failed to load interview history:', err)
      setInterviewHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      render: (candidate: CandidateProfile) => (
        <div className="flex items-center gap-3">
          {candidate.avatarUrl ? (
            <img
              src={candidate.avatarUrl}
              alt={candidate.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold ring-2 ring-white/10">
              {candidate.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-white">{candidate.fullName}</div>
            <div className="text-xs text-text-muted">{candidate.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (candidate: CandidateProfile) => (
        <div className="flex flex-wrap gap-1">
          {candidate.skills && candidate.skills.length > 0 ? (
            candidate.skills.slice(0, 2).map((skill, idx) => (
              <span key={idx} className="px-1.5 py-0.5 bg-white/5 text-zinc-300 text-xs rounded border border-white/10">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-text-muted text-xs">-</span>
          )}
          {candidate.skills && candidate.skills.length > 2 && (
            <span className="text-xs text-text-muted">+{candidate.skills.length - 2}</span>
          )}
        </div>
      )
    },
    {
      key: 'candidateStatus',
      label: 'Status',
      render: (candidate: CandidateProfile) => (
        <StatusBadge status={candidate.candidateStatus} />
      )
    },
    {
      key: 'averageScore',
      label: 'Avg Score',
      render: (candidate: CandidateProfile) => (
        <ScoreBadge score={candidate.averageScore} />
      )
    },
    {
      key: 'totalInterviews',
      label: 'Interviews',
      render: (candidate: CandidateProfile) => (
        <div className="text-sm">
          <span className="text-white font-medium">{candidate.totalInterviews}</span>
          <span className="text-text-muted mx-1">/</span>
          <span className="text-text-secondary text-xs">{candidate.completedInterviews} completed</span>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight">Candidates</h1>
        <p className="text-text-secondary mt-1 text-sm tracking-normal">Manage and track candidate profiles and performance.</p>
      </div>

      {/* Filters */}
      {/* Filters */}
      <div className="glass-panel p-5 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Search</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-56">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Status</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-neon-cyan/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-zinc-900">All Statuses</option>
              <option value="NEW" className="bg-zinc-900">New</option>
              <option value="SCHEDULED" className="bg-zinc-900">Scheduled</option>
              <option value="INTERVIEWED" className="bg-zinc-900">Interviewed</option>
              <option value="PASSED" className="bg-zinc-900">Passed</option>
              <option value="FAILED" className="bg-zinc-900">Failed</option>
            </select>
          </div>
        </div>

        {/* Skills Filter */}
        <div className="w-full md:w-72">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Skills</label>
          <input
            type="text"
            placeholder="e.g. React, Python..."
            value={skillsFilter}
            onChange={(e) => { setSkillsFilter(e.target.value); setPage(0) }}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        {error ? (
          <div className="p-12 text-center glass-panel border-error/20">
            <XCircle className="w-12 h-12 text-error mx-auto mb-4 opacity-80" />
            <p className="text-text-primary mb-4 font-medium">{error}</p>
            <button onClick={loadCandidates} className="text-text-muted hover:text-text-primary transition-colors underline decoration-border hover:decoration-text-primary">Retry Connection</button>
          </div>
        ) : (
          <>
            {candidates && candidates.content.length > 0 ? (
              <div className="space-y-4">
                <DataTable
                  data={candidates.content}
                  columns={columns}
                  onRowClick={handleRowClick}
                  loading={loading}
                />
                <Pagination
                  page={page}
                  totalPages={candidates.totalPages}
                  totalElements={candidates.totalElements}
                  size={pageSize}
                  onPageChange={setPage}
                  onSizeChange={(s) => { setPageSize(s); setPage(0) }}
                />
              </div>
            ) : (
              !loading && (
                <div className="p-20 text-center glass-panel border-dashed border-2 border-white/10">
                  <div className="w-16 h-16 bg-background-subtle rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                    <Search className="w-8 h-8 text-text-muted opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">No candidates found</h3>
                  <p className="text-text-secondary text-sm">We couldn't find any candidates matching your criteria.</p>
                  <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setSkillsFilter('') }} className="mt-6 text-text-primary bg-background-subtle px-4 py-2 rounded-lg border border-border hover:bg-zinc-800 transition-colors">Clear All Filters</button>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Candidate Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCandidate(null); setInterviewHistory([]) }}
        title="Candidate Profile"
        size="lg"
      >
        {selectedCandidate && (
          <div className="space-y-8">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {selectedCandidate.avatarUrl ? (
                <img src={selectedCandidate.avatarUrl} alt="" className="w-24 h-24 rounded-full ring-4 ring-white/10 object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold ring-4 ring-white/10">
                  {selectedCandidate.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCandidate.fullName}</h2>
                    <div className="flex items-center gap-4 text-text-secondary text-sm mt-1">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} /> {selectedCandidate.email}
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} /> {selectedCandidate.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={selectedCandidate.candidateStatus} />
                </div>

                {selectedCandidate.bio && <p className="text-text-secondary text-sm leading-relaxed">{selectedCandidate.bio}</p>}

                <div className="flex gap-3 pt-2">
                  {selectedCandidate.linkedinUrl && (
                    <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                      LinkedIn <ExternalLink size={12} />
                    </a>
                  )}
                  {selectedCandidate.githubUrl && (
                    <a href={selectedCandidate.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-text-primary hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                      GitHub <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Interviews', value: selectedCandidate.totalInterviews, color: 'text-white', bg: 'bg-white/5' },
                { label: 'Completed', value: selectedCandidate.completedInterviews, color: 'text-zinc-300', bg: 'bg-white/5' },
                { label: 'Avg Score', value: `${selectedCandidate.averageScore.toFixed(1)}%`, color: 'text-white', bg: 'bg-white/5' },
                { label: 'Pending', value: selectedCandidate.pendingInterviews, color: 'text-zinc-500', bg: 'bg-white/5' },
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-xl border border-white/5 ${stat.bg}`}>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-text-secondary mt-1 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            {selectedCandidate.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 text-text-primary text-sm rounded-lg border border-white/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Interview History</h3>
              {historyLoading ? (
                <div className="py-8 text-center text-text-secondary">Loading history...</div>
              ) : interviewHistory.length > 0 ? (
                <div className="space-y-3">
                  {interviewHistory.map(h => (
                    <div key={h.submissionId} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-white">{h.interviewTitle}</div>
                          {h.companyName && <div className="text-xs text-text-muted">{h.companyName}</div>}
                        </div>
                        <div className="text-right">
                          <StatusBadge status={h.submissionStatus} />
                          {h.score !== null && <div className="mt-1"><ScoreBadge score={h.score} /></div>}
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(h.startedAt).toLocaleDateString()}</span>
                        {h.durationMinutes && <span className="flex items-center gap-1"><Clock size={12} /> {h.durationMinutes}m</span>}
                        <span className="flex items-center gap-1"><Award size={12} /> {h.answeredQuestions}/{h.totalQuestions} answered</span>
                      </div>
                      {h.feedback && (
                        <div className="mt-3 text-sm text-text-secondary bg-black/20 p-3 rounded-lg border border-white/5 italic">
                          "{h.feedback}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-text-muted bg-white/5 rounded-xl border border-white/5 border-dashed">
                  No interview history available.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
