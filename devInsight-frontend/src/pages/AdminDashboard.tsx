import React, { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import adminService, {
  User, Interview, Company, Submission, AuditLog, PageResponse, Participant
} from '../services/adminService'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { Rocket, Calendar, FileText, Clock } from 'lucide-react'

// Tab type
type TabType = 'overview' | 'users' | 'interviews' | 'companies' | 'submissions' | 'participants' | 'audit'

// Type definitions for dashboard data
interface InterviewStatusBreakdown {
  draft: number
  published: number
  archived: number
}

interface SubmissionTypeBreakdown {
  videoSubmissions: number
  codeSubmissions: number
  textSubmissions: number
}

interface RecentInterview {
  id: number
  title: string
  companyId: number | null
  companyName: string | null
  status: string
  createdAt: string
}

interface RecentSubmission {
  id: number
  interviewId: number
  interviewTitle: string | null
  userId: number
  userName: string | null
  type: string
  status: string
  createdAt: string
  overallScore?: number
}

interface DashboardSummary {
  totalUsers: number
  totalInterviews: number
  activeInterviews: number
  totalSubmissions: number
  interviewStatusBreakdown: InterviewStatusBreakdown
  submissionTypeBreakdown: SubmissionTypeBreakdown
  recentActiveInterviews: RecentInterview[]
  recentSubmissions: RecentSubmission[]
}

// Simple bar chart component
function SimpleBarChart({ data, labels, colors }: {
  data: number[],
  labels: string[],
  colors: string[]
}) {
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-4 h-40 px-4">
      {data.map((value, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <span className="text-xs font-bold text-white/70 mb-2">{value}</span>
          <div
            className={`w-full rounded-t-[4px] ${colors[index]} transition-all duration-500 opacity-90 hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
            style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '20px' : '4px' }}
          />
          <span className="text-[10px] uppercase font-bold text-white/50 mt-3 text-center tracking-widest">{labels[index]}</span>
        </div>
      ))}
    </div>
  )
}

// Counter card component
function CounterCard({ title, value, icon, color, onClick }: {
  title: string,
  value: number,
  icon: string,
  color: string,
  onClick?: () => void
}) {
  return (
    <div
      className={`glass-card p-6 ${onClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-neon-cyan uppercase tracking-widest drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight drop-shadow-md">{value.toLocaleString()}</p>
        </div>
        <div className="text-2xl text-white/20 grayscale-0">{icon}</div>
      </div>
    </div>
  )
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'ACTIVE': 'bg-neon-green/10 text-neon-green border border-neon-green/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    'DRAFT': 'bg-white/5 text-white/50 border border-white/10',
    'ARCHIVED': 'bg-white/5 text-white/30 border border-white/5',
    'SUBMITTED': 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    'IN_PROGRESS': 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    'ANALYZED': 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    'VIDEO': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    'CODE': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    'TEXT': 'bg-slate-500/10 text-slate-300 border border-slate-500/30',
    'CANDIDATE': 'bg-white/5 text-white/70 border border-white/10',
    'COMPANY': 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    'ADMIN': 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    'SUSPENDED': 'bg-red-500/10 text-red-500 border border-red-500/30',
    'PENDING': 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
    'CREATE': 'bg-green-500/10 text-green-500 border border-green-500/30',
    'UPDATE': 'bg-blue-500/10 text-blue-500 border border-blue-500/30',
    'DELETE': 'bg-red-500/10 text-red-500 border border-red-500/30',
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm ${colors[status] || 'bg-white/5 text-white/50 border border-white/10'}`}>
      {status}
    </span>
  )
}

// Import new modern components inside the file (or at top, but tool enforces structure)
import { StatCard } from '../components/ModernDashboard/StatCard';
import { VacancyChart } from '../components/ModernDashboard/VacancyChart';
import { SourceDonutChart } from '../components/ModernDashboard/SourceDonutChart';
import { WorldMapWidget } from '../components/ModernDashboard/WorldMapWidget';
import { CandidateTable } from '../components/ModernDashboard/CandidateTable';
import { AIWidget } from '../components/ModernDashboard/AIWidget';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states for management tabs
  const [users, setUsers] = useState<PageResponse<User> | null>(null)
  const [interviews, setInterviews] = useState<PageResponse<Interview> | null>(null)
  const [companies, setCompanies] = useState<PageResponse<Company> | null>(null)
  const [submissions, setSubmissions] = useState<PageResponse<Submission> | null>(null)
  const [participants, setParticipants] = useState<PageResponse<Participant> | null>(null)
  const [auditLogs, setAuditLogs] = useState<PageResponse<AuditLog> | null>(null)

  // Participant filter states
  const [participantStartDate, setParticipantStartDate] = useState('')
  const [participantEndDate, setParticipantEndDate] = useState('')
  const [participantStatus, setParticipantStatus] = useState('')
  const [participantRole, setParticipantRole] = useState('')
  const [participantSortBy, setParticipantSortBy] = useState('examStartTime')
  const [participantSortDir, setParticipantSortDir] = useState<'asc' | 'desc'>('desc')

  // Pagination states
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Toast hook - may fail if ToastProvider not added yet
  let showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void = () => { }
  try {
    const toast = useToast()
    showToast = toast.showToast
  } catch {
    showToast = (msg, type) => {
      if (type === 'error') console.error(msg)
      else console.log(msg)
    }
  }

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!api.isAdmin()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    // Don't fetch if not admin
    if (!api.isAdmin()) return

    let mounted = true

    async function fetchDashboard() {
      try {
        setLoading(true)
        const res = await api.get('/dashboard/summary')
        if (mounted) {
          setSummary(res.data?.data || null)
          setError(null)
        }
      } catch (err: any) {
        console.error('Failed to load dashboard:', err)
        if (mounted) {
          if (err.response?.status === 403) {
            setError('You do not have permission to view the dashboard. Admin or Company role required.')
          } else {
            setError('Failed to load dashboard data. Please try again.')
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDashboard()

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // Fetch data for management tabs
  const fetchTabData = useCallback(async () => {
    if (activeTab === 'overview') return

    setLoading(true)
    try {
      switch (activeTab) {
        case 'users':
          const usersData = await adminService.getUsers(page, pageSize, search || undefined)
          setUsers(usersData)
          break
        case 'interviews':
          const interviewsData = await adminService.getInterviews(page, pageSize, search || undefined)
          setInterviews(interviewsData)
          break
        case 'companies':
          const companiesData = await adminService.getCompanies(page, pageSize, search || undefined)
          setCompanies(companiesData)
          break
        case 'submissions':
          const submissionsData = await adminService.getSubmissions(page, pageSize, search || undefined)
          setSubmissions(submissionsData)
          break
        case 'participants':
          const participantsData = await adminService.getParticipants(
            page,
            pageSize,
            search || undefined,
            participantSortBy,
            participantSortDir,
            participantStartDate || undefined,
            participantEndDate || undefined,
            participantStatus || undefined,
            participantRole || undefined
          )
          setParticipants(participantsData)
          break
        case 'audit':
          const auditData = await adminService.getAuditLogs(page, pageSize)
          setAuditLogs(auditData)
          break
      }
    } catch (err: any) {
      console.error('Failed to fetch tab data:', err)
      showToast(err.response?.data?.message || 'Failed to fetch data', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, pageSize, search, participantSortBy, participantSortDir, participantStartDate, participantEndDate, participantStatus, participantRole])

  useEffect(() => {
    fetchTabData()
  }, [fetchTabData])

  // Reset pagination when changing tabs
  useEffect(() => {
    setPage(0)
    setSearch('')
  }, [activeTab])

  // CRUD handlers
  const handleCreate = () => {
    setModalMode('create')
    setSelectedItem(null)
    setModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setModalMode('edit')
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleDelete = async (type: string, id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      switch (type) {
        case 'user':
          await adminService.deleteUser(id)
          break
        case 'interview':
          await adminService.deleteInterview(id)
          break
        case 'company':
          await adminService.deleteCompany(id)
          break
        case 'submission':
          await adminService.deleteSubmission(id)
          break
      }
      showToast(`${type} deleted successfully`, 'success')
      fetchTabData()
    } catch (err: any) {
      showToast(err.response?.data?.message || `Failed to delete ${type}`, 'error')
    }
  }

  const handleSave = async (data: any) => {
    try {
      switch (activeTab) {
        case 'users':
          if (modalMode === 'create') {
            await adminService.createUser(data)
          } else {
            await adminService.updateUser(selectedItem.id, data)
          }
          break
        case 'interviews':
          if (modalMode === 'create') {
            await adminService.createInterview(data)
          } else {
            await adminService.updateInterview(selectedItem.id, data)
          }
          break
        case 'companies':
          if (modalMode === 'create') {
            await adminService.createCompany(data)
          } else {
            await adminService.updateCompany(selectedItem.id, data)
          }
          break
      }
      showToast(`${activeTab.slice(0, -1)} ${modalMode === 'create' ? 'created' : 'updated'} successfully`, 'success')
      setModalOpen(false)
      fetchTabData()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'interviews', label: '🎯 Interviews' },
    { id: 'participants', label: '🎓 Participants' },
    { id: 'companies', label: '🏢 Companies' },
    { id: 'submissions', label: '📝 Submissions' },
    { id: 'audit', label: '📋 Audit Logs' },
  ]

  if (loading && activeTab === 'overview') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-4">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    )
  }

  const { interviewStatusBreakdown, submissionTypeBreakdown } = summary || { interviewStatusBreakdown: { draft: 0, published: 0, archived: 0 }, submissionTypeBreakdown: { videoSubmissions: 0, codeSubmissions: 0, textSubmissions: 0 } }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-transparent min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-1 font-medium">Manage all data and monitor system activity</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-1 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)] border border-neon-cyan/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={summary.totalUsers.toLocaleString()}
              subtext="Registered users"
              color="#3b82f6"
              data={[{ value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }, { value: 25 }, { value: summary.totalUsers }]}
              delay={0}
            />
            <StatCard
              title="Active Interviews"
              value={summary.activeInterviews.toLocaleString()}
              subtext="Ongoing sessions"
              color="#f97316"
              data={[{ value: 5 }, { value: 8 }, { value: 2 }, { value: 12 }, { value: 8 }, { value: summary.activeInterviews }]}
              delay={0.1}
            />
            <StatCard
              title="Total Submissions"
              value={summary.totalSubmissions.toLocaleString()}
              subtext="All time"
              color="#10b981"
              data={[{ value: 20 }, { value: 15 }, { value: 30 }, { value: 45 }, { value: 40 }, { value: summary.totalSubmissions }]}
              delay={0.2}
            />
          </div>

          {/* Quick Actions Panel - Modernized */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/questions/add')}
                className="group relative overflow-hidden bg-futuristic-card border border-futuristic-border hover:border-neon-cyan/50 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Rocket className="w-8 h-8 text-neon-cyan group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold relative z-10">Start New Interview</span>
              </button>

              <button
                onClick={() => navigate('/interviews')}
                className="group relative overflow-hidden bg-futuristic-card border border-futuristic-border hover:border-neon-purple/50 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Calendar className="w-8 h-8 text-neon-purple group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold relative z-10">Schedule Interview</span>
              </button>

              <button
                onClick={() => navigate('/hr/templates')}
                className="group relative overflow-hidden bg-futuristic-card border border-futuristic-border hover:border-neon-blue/50 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FileText className="w-8 h-8 text-neon-blue group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold relative z-10">Create Template</span>
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <VacancyChart data={[
                { name: 'Draft', fill: interviewStatusBreakdown.draft, color: '#94a3b8' },
                { name: 'Active', fill: interviewStatusBreakdown.published, color: '#10b981' }, // Mapped Published to Active
                { name: 'Archived', fill: interviewStatusBreakdown.archived, color: '#f97316' }
              ]} />
              <div className="bg-futuristic-card border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-white font-semibold mb-4">Submission Types</h3>
                <SimpleBarChart
                  data={[submissionTypeBreakdown.videoSubmissions, submissionTypeBreakdown.codeSubmissions, submissionTypeBreakdown.textSubmissions]}
                  labels={['Video', 'Code', 'Text']}
                  colors={['bg-neon-blue', 'bg-neon-cyan', 'bg-neon-purple']}
                />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <SourceDonutChart />
              <SourceDonutChart />
              <AIWidget
                topCandidate={summary.recentSubmissions.length > 0 ? {
                  name: summary.recentSubmissions.reduce((prev, current) => (current.overallScore || 0) > (prev.overallScore || 0) ? current : prev).userName || 'Unknown',
                  score: summary.recentSubmissions.reduce((prev, current) => (current.overallScore || 0) > (prev.overallScore || 0) ? current : prev).overallScore || 0
                } : undefined}
                onClick={() => navigate('/hr/talent-matching')}
              />
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-8">
              <div className="bg-futuristic-card border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-semibold">Active Interviews</h3>
                  <button onClick={() => setActiveTab('interviews')} className="text-xs text-neon-cyan hover:text-white transition-colors">View All</button>
                </div>
                <table className="w-full text-left">
                  <thead className="text-xs text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="py-3 pl-2">Title</th>
                      <th className="py-3">Company</th>
                      <th className="py-3 pr-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentActiveInterviews.map((interview) => (
                      <tr key={interview.id} className="group hover:bg-white/5 transition-colors text-sm">
                        <td className="py-3 pl-2 font-medium text-white">{interview.title}</td>
                        <td className="py-3 text-slate-400">{interview.companyName || '-'}</td>
                        <td className="py-3 pr-2 text-right"><StatusBadge status={interview.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-span-12 xl:col-span-4">
              <CandidateTable candidates={summary.recentSubmissions.map((s: any) => ({
                id: s.id,
                name: s.userName || 'Unknown',
                role: s.interviewTitle || 'Candidate',
                status: s.status,
                score: s.score || '-' // Assuming score might be there or defaulting
              }))} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <ManagementSection
          title="Users"
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onCreate={handleCreate}
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'email', label: 'Email' },
              { key: 'fullName', label: 'Name' },
              { key: 'role', label: 'Role', render: (u: User) => <StatusBadge status={u.role} /> },
              { key: 'status', label: 'Status', render: (u: User) => <StatusBadge status={u.status} /> },
              {
                key: 'actions', label: 'Actions', render: (u: User) => (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(u)} className="text-neon-cyan hover:text-white transition-colors text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete('user', u.id, u.email)} className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium">Delete</button>
                  </div>
                )
              }
            ]}
            data={users?.content || []}
            loading={loading}
            emptyMessage="No users found"
          />
          {users && users.totalElements > 0 && (
            <Pagination page={page} totalPages={users.totalPages} totalElements={users.totalElements} size={pageSize} onPageChange={setPage} onSizeChange={setPageSize} />
          )}
        </ManagementSection>
      )}

      {/* Interviews Management Tab */}
      {activeTab === 'interviews' && (
        <ManagementSection
          title="Interviews"
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onCreate={handleCreate}
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Title' },
              { key: 'level', label: 'Level' },
              { key: 'type', label: 'Type' },
              { key: 'status', label: 'Status', render: (i: Interview) => <StatusBadge status={i.status} /> },
              { key: 'companyName', label: 'Company' },
              {
                key: 'actions', label: 'Actions', render: (i: Interview) => (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(i)} className="text-neon-cyan hover:text-white transition-colors text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete('interview', i.id, i.title)} className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium">Delete</button>
                  </div>
                )
              }
            ]}
            data={interviews?.content || []}
            loading={loading}
            emptyMessage="No interviews found"
          />
          {interviews && interviews.totalElements > 0 && (
            <Pagination page={page} totalPages={interviews.totalPages} totalElements={interviews.totalElements} size={pageSize} onPageChange={setPage} onSizeChange={setPageSize} />
          )}
        </ManagementSection>
      )}

      {/* Companies Management Tab */}
      {activeTab === 'companies' && (
        <ManagementSection
          title="Companies"
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onCreate={handleCreate}
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Name' },
              { key: 'domain', label: 'Domain' },
              { key: 'industry', label: 'Industry' },
              { key: 'size', label: 'Size' },
              { key: 'employeeCount', label: 'Employees' },
              {
                key: 'actions', label: 'Actions', render: (c: Company) => (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c)} className="text-neon-cyan hover:text-white transition-colors text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete('company', c.id, c.name)} className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium">Delete</button>
                  </div>
                )
              }
            ]}
            data={companies?.content || []}
            loading={loading}
            emptyMessage="No companies found"
          />
          {companies && companies.totalElements > 0 && (
            <Pagination page={page} totalPages={companies.totalPages} totalElements={companies.totalElements} size={pageSize} onPageChange={setPage} onSizeChange={setPageSize} />
          )}
        </ManagementSection>
      )}

      {/* Submissions Management Tab */}
      {activeTab === 'submissions' && (
        <ManagementSection
          title="Submissions"
          loading={loading}
          search={search}
          onSearchChange={setSearch}
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'candidateName', label: 'Candidate' },
              { key: 'interviewTitle', label: 'Interview' },
              { key: 'status', label: 'Status', render: (s: Submission) => <StatusBadge status={s.status} /> },
              { key: 'overallScore', label: 'Score', render: (s: Submission) => s.overallScore ?? '-' },
              {
                key: 'actions', label: 'Actions', render: (s: Submission) => (
                  <button onClick={() => handleDelete('submission', s.id, `#${s.id}`)} className="text-red-500 hover:text-red-400 text-sm transition-colors font-medium">Delete</button>
                )
              }
            ]}
            data={submissions?.content || []}
            loading={loading}
            emptyMessage="No submissions found"
          />
          {submissions && submissions.totalElements > 0 && (
            <Pagination page={page} totalPages={submissions.totalPages} totalElements={submissions.totalElements} size={pageSize} onPageChange={setPage} onSizeChange={setPageSize} />
          )}
        </ManagementSection>
      )}

      {/* Participants Management Tab */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Interview Participants</h2>
          </div>

          {/* Filters */}
          <div className="glass-panel p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={participantStartDate}
                  onChange={(e) => setParticipantStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={participantEndDate}
                  onChange={(e) => setParticipantEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select
                  value={participantStatus}
                  onChange={(e) => setParticipantStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 transition-all appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ANALYZING">Analyzing</option>
                  <option value="ANALYZED">Analyzed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <select
                  value={participantRole}
                  onChange={(e) => setParticipantRole(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 transition-all appearance-none"
                >
                  <option value="">All Roles</option>
                  <option value="CANDIDATE">Candidate</option>
                  <option value="HR">HR</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="INTERVIEWER">Interviewer</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400">Sort by:</span>
              <select
                value={participantSortBy}
                onChange={(e) => setParticipantSortBy(e.target.value)}
                className="px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 appearance-none"
              >
                <option value="examStartTime" className="bg-zinc-900">Exam Start Time</option>
                <option value="examEndTime">Exam End Time</option>
                <option value="score">Score</option>
                <option value="candidateName">Name</option>
              </select>
              <button
                onClick={() => setParticipantSortDir(participantSortDir === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/5 text-white transition"
              >
                {participantSortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
              <button
                onClick={() => {
                  setSearch('')
                  setParticipantStartDate('')
                  setParticipantEndDate('')
                  setParticipantStatus('')
                  setParticipantRole('')
                  setParticipantSortBy('examStartTime')
                  setParticipantSortDir('desc')
                }}
                className="px-3 py-1 text-sm text-slate-400 hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Participants Table */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="glass-panel overflow-hidden">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Interview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exam Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exam End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/10">
                  {participants?.content.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No participants found
                      </td>
                    </tr>
                  )}
                  {participants?.content.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{p.candidateName || 'Unknown'}</span>
                          <span className="text-xs text-slate-500">{p.candidateEmail}</span>
                          {p.role && <span className="text-xs text-neon-blue">{p.role}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-white">{p.interviewTitle || '-'}</span>
                          {p.companyName && <span className="text-xs text-slate-500">{p.companyName}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {p.examStartTime ? new Date(p.examStartTime).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {p.examEndTime ? new Date(p.examEndTime).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {p.durationMinutes ? `${p.durationMinutes} min` : p.timeSpentSeconds ? `${Math.round(p.timeSpentSeconds / 60)} min` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.score !== null && p.score !== undefined ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{p.score}/{p.maxScore || 100}</span>
                            {p.percentage !== null && p.percentage !== undefined && (
                              <span className={`text-xs ${p.percentage >= 70 ? 'text-white' : 'text-zinc-500'}`}>
                                {p.percentage.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={p.status || 'PENDING'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.passed !== null && p.passed !== undefined ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.passed ? 'bg-white/10 text-white border border-white/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                            {p.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {participants && participants.totalElements > 0 && (
            <Pagination
              page={page}
              totalPages={participants.totalPages}
              totalElements={participants.totalElements}
              size={pageSize}
              onPageChange={setPage}
              onSizeChange={setPageSize}
            />
          )}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <ManagementSection title="Audit Logs" loading={loading}>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'entityType', label: 'Entity' },
              { key: 'entityId', label: 'Entity ID' },
              { key: 'action', label: 'Action', render: (a: AuditLog) => <StatusBadge status={a.action} /> },
              { key: 'performedBy', label: 'Performed By' },
              { key: 'performedAt', label: 'Time', render: (a: AuditLog) => new Date(a.performedAt).toLocaleString() },
            ]}
            data={auditLogs?.content || []}
            loading={loading}
            emptyMessage="No audit logs found"
          />
          {auditLogs && auditLogs.totalElements > 0 && (
            <Pagination page={page} totalPages={auditLogs.totalPages} totalElements={auditLogs.totalElements} size={pageSize} onPageChange={setPage} onSizeChange={setPageSize} />
          )}
        </ManagementSection>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`${modalMode === 'create' ? 'Create' : 'Edit'} ${activeTab.slice(0, -1)}`} size="lg">
        {activeTab === 'users' && <UserForm initialData={selectedItem} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
        {activeTab === 'interviews' && <InterviewForm initialData={selectedItem} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
        {activeTab === 'companies' && <CompanyForm initialData={selectedItem} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
      </Modal>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Dashboard auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

// Management Section Wrapper
function ManagementSection({ title, loading, search, onSearchChange, onCreate, children }: {
  title: string
  loading: boolean
  search?: string
  onSearchChange?: (v: string) => void
  onCreate?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">{title} Management</h2>
        <div className="flex gap-4">
          {onSearchChange && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-neon-cyan/50 focus:border-transparent"
            />
          )}
          {onCreate && (
            <button onClick={onCreate} className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-lg transition-all font-bold tracking-wide">
              + Add {title.slice(0, -1)}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// User Form
function UserForm({ initialData, onSave, onCancel }: { initialData?: User, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    password: '',
    fullName: initialData?.fullName || '',
    role: initialData?.role || 'CANDIDATE',
    status: initialData?.status || 'ACTIVE',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Email *</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Password {initialData ? '(leave blank to keep)' : '*'}</label>
          <input type="password" required={!initialData} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Full Name *</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
          <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
          <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50 appearance-none">
            <option value="CANDIDATE" className="bg-zinc-900">Candidate</option>
            <option value="COMPANY" className="bg-zinc-900">Company</option>
            <option value="ADMIN" className="bg-zinc-900">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
          <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50 appearance-none">
            <option value="ACTIVE" className="bg-zinc-900">Active</option>
            <option value="SUSPENDED" className="bg-zinc-900">Suspended</option>
            <option value="PENDING" className="bg-zinc-900">Pending</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
        <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-white">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200">{initialData ? 'Update' : 'Create'}</button>
      </div>
    </form>
  )
}

// Interview Form
function InterviewForm({ initialData, onSave, onCancel }: { initialData?: Interview, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    level: initialData?.level || 'JUNIOR',
    type: initialData?.type || 'CODING',
    status: initialData?.status || 'DRAFT',
    durationMinutes: initialData?.durationMinutes || 60,
    passingScore: initialData?.passingScore || 70,
    isPublic: initialData?.isPublic || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Title *</label>
        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Level</label>
          <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value as any })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50 appearance-none">
            <option value="JUNIOR" className="bg-zinc-900">Junior</option>
            <option value="MID" className="bg-zinc-900">Mid</option>
            <option value="SENIOR" className="bg-zinc-900">Senior</option>
            <option value="LEAD" className="bg-zinc-900">Lead</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50 appearance-none">
            <option value="CODING" className="bg-zinc-900">Coding</option>
            <option value="BEHAVIORAL" className="bg-zinc-900">Behavioral</option>
            <option value="SYSTEM_DESIGN" className="bg-zinc-900">System Design</option>
            <option value="MIXED" className="bg-zinc-900">Mixed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
          <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50 appearance-none">
            <option value="DRAFT" className="bg-zinc-900">Draft</option>
            <option value="ACTIVE" className="bg-zinc-900">Active</option>
            <option value="ARCHIVED" className="bg-zinc-900">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Duration (minutes)</label>
          <input type="number" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Passing Score</label>
          <input type="number" min="0" max="100" value={formData.passingScore} onChange={e => setFormData({ ...formData, passingScore: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({ ...formData, isPublic: e.target.checked })} className="w-4 h-4 text-neon-cyan rounded bg-black/40 border-white/10" />
            <span className="text-sm font-medium text-slate-300">Public Interview</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-white">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200">{initialData ? 'Update' : 'Create'}</button>
      </div>
    </form>
  )
}

// Company Form
function CompanyForm({ initialData, onSave, onCancel }: { initialData?: Company, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    domain: initialData?.domain || '',
    description: initialData?.description || '',
    industry: initialData?.industry || '',
    website: initialData?.website || '',
    size: initialData?.size || 'SMALL',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Company Name *</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Domain</label>
          <input type="text" value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })} placeholder="example.com"
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Industry</label>
          <input type="text" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Website</label>
          <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com"
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Size</label>
          <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value as any })}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50 appearance-none">
            <option value="STARTUP" className="bg-zinc-900">Startup</option>
            <option value="SMALL" className="bg-zinc-900">Small</option>
            <option value="MEDIUM" className="bg-zinc-900">Medium</option>
            <option value="LARGE" className="bg-zinc-900">Large</option>
            <option value="ENTERPRISE" className="bg-zinc-900">Enterprise</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-cyan/50" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-white">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200">{initialData ? 'Update' : 'Create'}</button>
      </div>
    </form>
  )
}
