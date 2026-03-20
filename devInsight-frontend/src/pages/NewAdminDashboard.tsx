import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Briefcase,
  UserCheck,
  Filter,
  Download,
  RefreshCw,
  Globe,
  LogOut,
  ChevronRight,
  MoreVertical,
  Calendar,
  Award,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import adminService, { PageResponse, Interview, User, Submission } from '../services/adminService';

// Types
type TabType = 'overview' | 'users' | 'interviews' | 'submissions' | 'analytics';

interface DashboardStats {
  totalUsers: number;
  totalInterviews: number;
  activeInterviews: number;
  totalSubmissions: number;
  pendingReviews: number;
  hiredCandidates: number;
}

// Sidebar Menu
const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
  { icon: Users, label: 'Users', tab: 'users' },
  { icon: FileText, label: 'Interviews', tab: 'interviews' },
  { icon: Target, label: 'Submissions', tab: 'submissions' },
  { icon: BarChart3, label: 'Analytics', tab: 'analytics' },
];

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'bg-green-500/20 text-green-400 border-green-500/30',
    'PUBLISHED': 'bg-green-500/20 text-green-400 border-green-500/30',
    'DRAFT': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'ARCHIVED': 'bg-slate-600/20 text-slate-500 border-slate-600/30',
    'PENDING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'SUBMITTED': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'ANALYZED': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
    'ADMIN': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'HR': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'CANDIDATE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded border ${colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
      {status}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  delay = 0 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  trend?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay }}
    className="bg-slate-900/60 border border-white/10 rounded-xl p-5 backdrop-blur-xl hover:border-white/20 transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {trend && (
        <span className="text-xs text-green-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-xs text-slate-500 mt-1">{title}</p>
  </motion.div>
);

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInterviews: 0,
    activeInterviews: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
    hiredCandidates: 0
  });

  // Data states
  const [users, setUsers] = useState<PageResponse<User> | null>(null);
  const [interviews, setInterviews] = useState<PageResponse<Interview> | null>(null);
  const [submissions, setSubmissions] = useState<PageResponse<Submission> | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Check admin role
  useEffect(() => {
    if (!api.isAdmin()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Fetch dashboard summary
  useEffect(() => {
    if (!api.isAdmin()) return;

    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/summary');
        const data = res.data?.data;
        if (data) {
          setStats({
            totalUsers: data.totalUsers || 0,
            totalInterviews: data.totalInterviews || 0,
            activeInterviews: data.activeInterviews || 0,
            totalSubmissions: data.totalSubmissions || 0,
            pendingReviews: data.pendingReviews || 0,
            hiredCandidates: data.hiredCandidates || 0
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tab data
  const fetchTabData = useCallback(async () => {
    if (activeTab === 'overview' || activeTab === 'analytics') return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const usersData = await adminService.getUsers(page, pageSize, search || undefined);
          setUsers(usersData);
          break;
        case 'interviews':
          const interviewsData = await adminService.getInterviews(page, pageSize, search || undefined);
          setInterviews(interviewsData);
          break;
        case 'submissions':
          const submissionsData = await adminService.getSubmissions(page, pageSize, search || undefined);
          setSubmissions(submissionsData);
          break;
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize, search]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  useEffect(() => {
    setPage(0);
    setSearch('');
  }, [activeTab]);

  const handleLogout = () => {
    api.clearToken();
    window.location.href = '/login';
  };

  // Chart data
  const activityData = [
    { name: 'Mon', interviews: 12, submissions: 24 },
    { name: 'Tue', interviews: 19, submissions: 32 },
    { name: 'Wed', interviews: 15, submissions: 28 },
    { name: 'Thu', interviews: 22, submissions: 45 },
    { name: 'Fri', interviews: 18, submissions: 38 },
    { name: 'Sat', interviews: 8, submissions: 15 },
    { name: 'Sun', interviews: 5, submissions: 10 },
  ];

  const roleDistribution = [
    { name: 'Candidates', value: 65, color: '#06b6d4' },
    { name: 'HR', value: 20, color: '#8b5cf6' },
    { name: 'Admin', value: 15, color: '#f97316' },
  ];

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-screen w-20 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 z-50"
      >
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(item.tab as TabType)}
              className={`relative p-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.tab
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === item.tab && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                />
              )}
              <item.icon className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigate('/admin/settings')}
          className="mt-auto mb-4 p-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group relative"
        >
          <Settings className="w-5 h-5" />
          <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Settings
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="p-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all group relative"
        >
          <LogOut className="w-5 h-5" />
          <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Sign Out
          </div>
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="pl-24 pr-6 py-6 relative z-10">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchTabData()}
              className="p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="relative p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">5</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">System overview and management</p>
              </div>
              <Link
                to="/admin/questions/add"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#3b82f6" trend="+12%" delay={0.1} />
              <StatCard title="Active Interviews" value={stats.activeInterviews} icon={FileText} color="#10b981" trend="+5%" delay={0.2} />
              <StatCard title="Total Submissions" value={stats.totalSubmissions} icon={Target} color="#f97316" trend="+18%" delay={0.3} />
              <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={Clock} color="#8b5cf6" delay={0.35} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-12 gap-6">
              {/* Activity Chart */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="col-span-12 lg:col-span-8 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-white font-semibold mb-6">Weekly Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="interviewGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="submissions" stroke="#10b981" strokeWidth={2} fill="url(#submissionGradient)" />
                      <Area type="monotone" dataKey="interviews" stroke="#3b82f6" strokeWidth={2} fill="url(#interviewGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Role Distribution */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="col-span-12 lg:col-span-4 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-white font-semibold mb-6">User Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={roleDistribution} innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {roleDistribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/admin/questions/add" className="flex flex-col items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-300">Add Question</span>
                </Link>
                <Link to="/admin/questions" className="flex flex-col items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/50 transition-all">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-slate-300">Question Bank</span>
                </Link>
                <button onClick={() => setActiveTab('users')} className="flex flex-col items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-sm text-slate-300">Manage Users</span>
                </button>
                <button onClick={() => setActiveTab('interviews')} className="flex flex-col items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-green-500/30 hover:bg-slate-800/50 transition-all">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-sm text-slate-300">View Interviews</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Users Management</h1>
                <p className="text-slate-400 text-sm mt-1">Manage all system users</p>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">User</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Email</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Role</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Status</th>
                      <th className="text-right py-4 px-6 text-xs text-slate-500 font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading...</td></tr>
                    ) : users?.content?.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500">No users found</td></tr>
                    ) : (
                      users?.content?.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                                {user.fullName?.charAt(0) || user.email?.charAt(0) || '?'}
                              </div>
                              <span className="text-white font-medium">{user.fullName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400">{user.email}</td>
                          <td className="py-4 px-6"><StatusBadge status={user.role || 'CANDIDATE'} /></td>
                          <td className="py-4 px-6"><StatusBadge status={user.status || 'ACTIVE'} /></td>
                          <td className="py-4 px-6 text-right">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><Eye className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {users && users.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <span className="text-sm text-slate-500">Page {page + 1} of {users.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 bg-slate-800 rounded text-sm disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= users.totalPages - 1} className="px-3 py-1 bg-slate-800 rounded text-sm disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Interview Management</h1>
                <p className="text-slate-400 text-sm mt-1">Create and manage interview templates</p>
              </div>
              <Link to="/interviews" className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
                Create Interview
              </Link>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Interview</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Questions</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Status</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Created</th>
                      <th className="text-right py-4 px-6 text-xs text-slate-500 font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading...</td></tr>
                    ) : interviews?.content?.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500">No interviews found</td></tr>
                    ) : (
                      interviews?.content?.map((interview) => (
                        <tr key={interview.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-white font-medium">{interview.title}</p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{interview.description || 'No description'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400">{(interview as any).questionCount || 0} questions</td>
                          <td className="py-4 px-6"><StatusBadge status={interview.status || 'DRAFT'} /></td>
                          <td className="py-4 px-6 text-slate-400 text-sm">{interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : '-'}</td>
                          <td className="py-4 px-6 text-right">
                            <Link to={`/interviews/${interview.id}`} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white inline-block"><Eye className="w-4 h-4" /></Link>
                            <Link to={`/interviews/${interview.id}/manage`} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white inline-block"><Edit className="w-4 h-4" /></Link>
                            <Link to={`/interview/${interview.id}/submit`} className="p-2 hover:bg-green-500/10 rounded-lg text-slate-400 hover:text-green-400 inline-block"><Play className="w-4 h-4" /></Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {interviews && interviews.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <span className="text-sm text-slate-500">Page {page + 1} of {interviews.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 bg-slate-800 rounded text-sm disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= interviews.totalPages - 1} className="px-3 py-1 bg-slate-800 rounded text-sm disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Submissions</h1>
                <p className="text-slate-400 text-sm mt-1">Review candidate submissions</p>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Candidate</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Interview</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Status</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Score</th>
                      <th className="text-left py-4 px-6 text-xs text-slate-500 font-medium uppercase">Submitted</th>
                      <th className="text-right py-4 px-6 text-xs text-slate-500 font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading...</td></tr>
                    ) : submissions?.content?.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-slate-500">No submissions found</td></tr>
                    ) : (
                      submissions?.content?.map((submission) => (
                        <tr key={submission.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-medium text-white">
                                {submission.candidateName?.charAt(0) || '?'}
                              </div>
                              <span className="text-white font-medium">{submission.candidateName || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400">{submission.interviewTitle || 'N/A'}</td>
                          <td className="py-4 px-6"><StatusBadge status={submission.status || 'PENDING'} /></td>
                          <td className="py-4 px-6">
                            {submission.overallScore !== undefined ? (
                              <span className={`font-mono ${submission.overallScore >= 70 ? 'text-green-400' : submission.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {submission.overallScore}%
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-sm">{submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : '-'}</td>
                          <td className="py-4 px-6 text-right">
                            <Link to={`/submissions/${submission.id}`} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white inline-block"><Eye className="w-4 h-4" /></Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {submissions && submissions.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <span className="text-sm text-slate-500">Page {page + 1} of {submissions.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 bg-slate-800 rounded text-sm disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= submissions.totalPages - 1} className="px-3 py-1 bg-slate-800 rounded text-sm disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-slate-400 text-sm mt-1">System performance and insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Conversion Rate" value="68%" icon={TrendingUp} color="#10b981" trend="+5%" />
              <StatCard title="Avg. Score" value="72%" icon={Award} color="#f97316" />
              <StatCard title="Completion Rate" value="84%" icon={CheckCircle} color="#3b82f6" trend="+3%" />
              <StatCard title="Active Sessions" value={42} icon={Activity} color="#8b5cf6" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-white font-semibold mb-6">Performance Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="interviews" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="submissions" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
