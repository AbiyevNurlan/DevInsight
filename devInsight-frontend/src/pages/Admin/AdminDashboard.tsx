import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Calendar, FileText, Clock, Shield } from 'lucide-react';
import api from '../../services/api';
import SecurityMonitor from '../../components/SecurityMonitor';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface CandidateProfile {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  averageScore: number;
  lastInterviewDate: string | null;
  candidateStatus: string;
}

interface UpcomingInterview {
  id: number;
  title: string;
  candidateName?: string;
  scheduledAt?: string;
  type: string;
  status: string;
}

interface SystemStats {
  totalCompanies: number;
  totalUsers: number;
  totalInterviews: number;
  totalQuestions: number;
  avgInterviewScore: number;
}

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  timestamp: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<CandidateProfile[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, companiesRes, logsRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/companies'),
        api.get('/admin/audit-logs?limit=10'),
      ]);

      setStats(statsRes.data);
      setCompanies(companiesRes.data);
      setAuditLogs(logsRes.data);

      // Load recent candidates
      loadRecentCandidates();

      // Load upcoming interviews
      loadUpcomingInterviews();
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentCandidates = async () => {
    try {
      const res = await api.get('/candidates?page=0&size=10');
      const candidates = res.data?.data?.content || [];
      setRecentCandidates(candidates);
    } catch (error) {
      console.error('Error loading recent candidates', error);
      setRecentCandidates([]);
    }
  };

  const loadUpcomingInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      const allInterviews = res.data?.data || res.data || [];
      // Filter for scheduled/active interviews and take first 5
      const upcoming = allInterviews
        .filter((i: UpcomingInterview) => i.status === 'ACTIVE' || i.status === 'DRAFT')
        .slice(0, 5);
      setUpcomingInterviews(upcoming);
    } catch (error) {
      console.error('Error loading upcoming interviews', error);
      setUpcomingInterviews([]);
    }
  };

  const handleAddCompany = async () => {
    try {
      await api.post('/admin/companies', newCompany);
      setNewCompany({ name: '', email: '', phone: '' });
      await loadData();
    } catch (error) {
      console.error('Error creating company', error);
    }
  };

  const handleDeactivateCompany = async (id: number) => {
    if (window.confirm('Deactivate this company?')) {
      try {
        await api.put(`/admin/companies/${id}/status`, {
          status: 'INACTIVE',
        });
        await loadData();
      } catch (error) {
        console.error('Error updating company', error);
      }
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 tracking-tight flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            Control Center
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">
            High-level telemetry for companies, usage and audit events.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-semibold btn-soft"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs md:text-sm font-medium border-b transition-colors tracking-[0.18em] uppercase ${activeTab === 'overview'
            ? 'border-white text-white'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 text-xs md:text-sm font-medium border-b transition-colors tracking-[0.18em] uppercase ${activeTab === 'companies'
            ? 'border-white text-white'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          🏢 Companies
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs md:text-sm font-medium border-b transition-colors tracking-[0.18em] uppercase ${activeTab === 'audit'
            ? 'border-white text-white'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          📋 Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs md:text-sm font-medium border-b transition-colors tracking-[0.18em] uppercase ${activeTab === 'security'
            ? 'border-white text-white'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
        >
          🛡️ Security
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats ? (
              <>
                <div className="glass-panel p-5 border border-white/5">
                  <div className="text-xs text-zinc-400 font-medium mb-1 tracking-[0.18em] uppercase">
                    Total Companies
                  </div>
                  <div className="text-2xl md:text-3xl font-light text-white metric-value">
                    {stats.totalCompanies}
                  </div>
                </div>

                <div className="glass-panel p-5 border border-white/5">
                  <div className="text-xs text-zinc-400 font-medium mb-1 tracking-[0.18em] uppercase">
                    Total Users
                  </div>
                  <div className="text-2xl md:text-3xl font-light text-white metric-value">
                    {stats.totalUsers}
                  </div>
                </div>

                <div className="glass-panel p-5 border border-white/5">
                  <div className="text-xs text-zinc-400 font-medium mb-1 tracking-[0.18em] uppercase">
                    Total Interviews
                  </div>
                  <div className="text-2xl md:text-3xl font-light text-white metric-value">
                    {stats.totalInterviews}
                  </div>
                </div>

                <div className="glass-panel p-5 border border-white/5">
                  <div className="text-xs text-zinc-400 font-medium mb-1 tracking-[0.18em] uppercase">
                    Total Questions
                  </div>
                  <div className="text-2xl md:text-3xl font-light text-white metric-value">
                    {stats.totalQuestions}
                  </div>
                </div>

                <div className="glass-panel p-5 border border-white/5">
                  <div className="text-xs text-zinc-400 font-medium mb-1 tracking-[0.18em] uppercase">
                    Avg Interview Score
                  </div>
                  <div className="text-2xl md:text-3xl font-light text-white metric-value">
                    {stats.avgInterviewScore?.toFixed(1) || '-'}%
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-5 text-center py-8">
                <span className="text-slate-400 text-sm">
                  {loading ? 'Loading...' : 'No data available'}
                </span>
              </div>
            )}
          </div>

          {/* NEW SECTION 1: QUICK ACTIONS PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {/* Button 1: Start New Interview */}
            <button
              onClick={() => navigate('/admin/questions/add')}
              className="glass-panel p-6 h-24 flex items-center gap-4 hover:scale-[1.02] hover:bg-white/5 transition-all duration-300 group border border-white/5"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-medium text-white">Start New Interview</div>
                <div className="text-xs text-zinc-500">Create and launch interview</div>
              </div>
            </button>

            {/* Button 2: Schedule Interview */}
            <button
              onClick={() => navigate('/interviews')}
              className="glass-panel p-6 h-24 flex items-center gap-4 hover:scale-[1.02] hover:bg-white/5 transition-all duration-300 group border border-white/5"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-medium text-white">Schedule Interview</div>
                <div className="text-xs text-zinc-500">Plan upcoming sessions</div>
              </div>
            </button>

            {/* Button 3: Create Template */}
            <button
              onClick={() => navigate('/hr/templates')}
              className="glass-panel p-6 h-24 flex items-center gap-4 hover:scale-[1.02] hover:bg-white/5 transition-all duration-300 group border border-white/5"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-medium text-white">Create Template</div>
                <div className="text-xs text-zinc-500">Build interview template</div>
              </div>
            </button>
          </div>

          {/* NEW SECTION 2: RECENT CANDIDATES */}
          <div className="glass-panel overflow-hidden mt-8">
            <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                👥 Recent Candidates
              </h2>
              <button
                onClick={() => navigate('/admin/candidates')}
                className="text-sm text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                View All →
              </button>
            </div>

            {recentCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-800/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                        Last Interview
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {recentCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {candidate.avatarUrl ? (
                              <img
                                src={candidate.avatarUrl}
                                alt={candidate.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {candidate.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-100">{candidate.fullName}</div>
                              <div className="text-sm text-slate-400">{candidate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.candidateStatus === 'PASSED'
                            ? 'bg-white text-black border border-white'
                            : candidate.candidateStatus === 'FAILED'
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              : candidate.candidateStatus === 'SCHEDULED'
                                ? 'bg-zinc-100 text-zinc-900 border border-zinc-300'
                                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            }`}>
                            {candidate.candidateStatus || 'NEW'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {candidate.averageScore !== null && candidate.averageScore !== undefined ? (
                            <span className={`font-semibold ${candidate.averageScore >= 80
                              ? 'text-green-400'
                              : candidate.averageScore >= 60
                                ? 'text-blue-400'
                                : candidate.averageScore >= 40
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}>
                              {candidate.averageScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-500 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">
                          {candidate.lastInterviewDate
                            ? new Date(candidate.lastInterviewDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                            : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-400">
                <div className="text-4xl mb-2">👥</div>
                <p>No recent candidates found</p>
              </div>
            )}
          </div>

          {/* NEW SECTION 3: UPCOMING INTERVIEWS WIDGET */}
          <div className="glass-panel p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                Upcoming Interviews
              </h2>
            </div>

            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800/80 hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-100 truncate">{interview.title}</div>
                      <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                        <span>{interview.type || 'Interview'}</span>
                        {interview.candidateName && (
                          <>
                            <span>•</span>
                            <span>{interview.candidateName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-slate-300">
                        {interview.scheduledAt
                          ? new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                          : 'Not scheduled'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {interview.scheduledAt
                          ? new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">📅</div>
                <p>No upcoming interviews scheduled</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Add Company Form */}
          <div className="glass-panel p-6 border-l-4 border-sky-500/80">
            <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
              ➕ Add New Company
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Company Name"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, name: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCompany.email}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, email: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newCompany.phone}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, phone: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <button
              onClick={handleAddCompany}
              className="btn-primary-saas px-6 py-2 text-sm font-semibold text-black"
            >
              ✓ Add Company
            </button>
          </div>

          {/* Companies List */}
          <div className="glass-panel overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-900/80">
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{company.email}</td>
                    <td className="px-6 py-4 text-slate-300">{company.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${company.status === 'ACTIVE'
                            ? 'bg-white text-black border border-white'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeactivateCompany(company.id)}
                        className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      }

      {/* Audit Logs Tab */}
      {
        activeTab === 'audit' && (
          <div className="glass-panel overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/80">
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 text-zinc-300 border border-white/10 text-xs rounded">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Security Tab - Real-time Violation Monitoring */}
      {activeTab === 'security' && (
        <SecurityMonitor showAll={true} />
      )}
    </div >
  );
};
