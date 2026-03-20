import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  Globe,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  Award
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
import api from '../../services/api';

// Types
interface DashboardStats {
  totalApplicants: number;
  newApplications: number;
  hiredRate: number;
  activeVacancies: number;
}

interface Candidate {
  id: number;
  name: string;
  position: string;
  status: 'Review' | 'Interview' | 'Hired' | 'Rejected' | 'Pending';
  score: number;
  appliedDate: string;
}

interface ActivityItem {
  id: number;
  type: 'interview' | 'hired' | 'application' | 'review';
  message: string;
  candidate: string;
  position: string;
  time: string;
}

// Menu items for sidebar
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/hr/admin-dashboard', active: true },
  { icon: Users, label: 'Candidates', path: '/hr/candidates' },
  { icon: Briefcase, label: 'Vacancies', path: '/hr/vacancies' },
  { icon: BarChart3, label: 'Analytics', path: '/hr/analytics' },
  { icon: FileText, label: 'Reports', path: '/hr/reports' },
  { icon: Settings, label: 'Settings', path: '/hr/settings' },
];

// StatCard Component
const StatCard = ({
  title,
  value,
  subtext,
  color,
  chartData,
  delay,
  icon: Icon
}: {
  title: string;
  value: string;
  subtext: string;
  color: string;
  chartData: { value: number }[];
  delay: number;
  icon: any;
}) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay }}
    className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 hover:border-white/20 transition-all duration-300"
  >
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
    <div
      className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />

    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className="text-3xl font-bold text-white mt-1" style={{ textShadow: `0 0 30px ${color}30` }}>
          {value}
        </div>
      </div>
      <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>

    <div className="h-12 w-full opacity-70">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.6} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${title.replace(/\s/g, '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <p className="text-xs text-slate-500 mt-2">{subtext}</p>
  </motion.div>
);

// VacancyFillChart Component
const VacancyFillChart = ({ data }: { data: any[] }) => {
  const colors = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#06b6d4', '#ec4899'];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold">Vacancy Filime</h3>
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Shortage</span>
          <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Surplus</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="shortage" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
            <Bar dataKey="surplus" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Source of Candidates Donut
const SourceDonutChart = ({ data }: { data: any[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const mainSource = data[0];
  const mainPercentage = Math.round((mainSource.value / total) * 100);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-12 md:col-span-6 lg:col-span-3 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-white font-semibold mb-4">Source of Candidates</h3>

      <div className="h-40 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={45}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{mainPercentage}%</span>
          <span className="text-xs text-slate-400">{mainSource.name}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-slate-400">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// AI Recommended Widget
const AIRecommendedWidget = ({ topCandidate, onClick }: { topCandidate?: any; onClick?: () => void }) => {
  const score = topCandidate?.score || 92;
  const name = topCandidate?.name || 'Sarah Johnson';
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 opacity-50">
        <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </motion.div>
      </div>

      <h3 className="text-white font-semibold mb-1">AI Recommended</h3>
      <p className="text-xs text-slate-400 mb-4">Top candidate matches</p>

      <div className="flex items-center justify-center relative">
        <svg className="w-28 h-28 -rotate-90">
          <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="56" cy="56" r="50"
            stroke="#8b5cf6"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400/50 mb-1">
            <img src={`https://ui-avatars.com/api/?name=${name}&background=8b5cf6&color=fff`} alt={name} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-white">{score}%</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Experience</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Skills Match</span>
          <span className="text-green-400">Excellent</span>
        </div>
      </div>

      <button
        onClick={onClick}
        className="mt-4 w-full text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 rounded-lg transition-colors border border-purple-500/20"
      >
        View Analysis
      </button>
    </motion.div>
  );
};

// Global Talent Pool Map Widget
const GlobalTalentPool = () => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.7 }}
    className="col-span-12 md:col-span-4 lg:col-span-3 row-span-2 bg-gradient-to-b from-slate-900/60 to-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
  >
    <h3 className="text-white font-semibold mb-1">Global Talent Pool</h3>
    <p className="text-xs text-slate-500 mb-4">Top Regions</p>

    <div className="relative h-32 opacity-40">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <path d="M20,50 Q40,30 60,50 T100,40 T140,50 T180,45" stroke="rgba(99,102,241,0.4)" fill="none" strokeWidth="1" />
        <ellipse cx="50" cy="45" rx="25" ry="15" fill="rgba(99,102,241,0.2)" />
        <ellipse cx="100" cy="35" rx="20" ry="12" fill="rgba(59,130,246,0.2)" />
        <ellipse cx="145" cy="45" rx="30" ry="18" fill="rgba(139,92,246,0.2)" />
        <circle cx="50" cy="42" r="3" fill="#06b6d4" className="animate-pulse" />
        <circle cx="100" cy="33" r="3" fill="#3b82f6" className="animate-pulse" />
        <circle cx="148" cy="42" r="3" fill="#8b5cf6" className="animate-pulse" />
      </svg>
    </div>

    <div className="absolute bottom-6 left-6 right-6">
      <div className="flex justify-between">
        <div className="text-center">
          <div className="text-lg font-bold text-white">543</div>
          <div className="text-[10px] text-slate-500 uppercase">Europe</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">421</div>
          <div className="text-[10px] text-slate-500 uppercase">Americas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">286</div>
          <div className="text-[10px] text-slate-500 uppercase">Asia</div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Candidates Table
const CandidatesTable = ({ candidates }: { candidates: Candidate[] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hired': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Interview': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Review': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="col-span-12 md:col-span-8 lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white font-semibold">Cameel Candidates</h3>
        <div className="flex gap-2">
          <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800/50 border border-white/5">C#</span>
          <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800/50 border border-white/5">Brainstorming</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              <th className="text-left py-3 font-medium">Name</th>
              <th className="text-left py-3 font-medium">Position</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-right py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr key={candidate.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-white text-sm font-medium">{candidate.name}</span>
                  </div>
                </td>
                <td className="py-3 text-slate-400 text-sm">{candidate.position}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white text-sm font-mono">{candidate.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Activity Feed
const ActivityFeed = ({ activities }: { activities: ActivityItem[] }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'hired': return <Award className="w-4 h-4 text-green-400" />;
      case 'interview': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'application': return <FileText className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="col-span-12 lg:col-span-3 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-white font-semibold mb-4">Actum</h3>

      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 items-start p-3 rounded-lg bg-slate-800/30 border border-white/5 hover:border-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-slate-800/50">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{activity.candidate}</p>
              <p className="text-xs text-slate-400 truncate">{activity.message}</p>
              <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const HRAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplicants: 1250,
    newApplications: 39,
    hiredRate: 92,
    activeVacancies: 24
  });

  // Mock data
  const vacancyData = [
    { name: 'Tech', shortage: 45, surplus: 30 },
    { name: 'Design', shortage: 25, surplus: 55 },
    { name: 'Sales', shortage: 60, surplus: 20 },
    { name: 'Marketing', shortage: 35, surplus: 45 },
    { name: 'Finance', shortage: 15, surplus: 65 },
    { name: 'HR', shortage: 40, surplus: 35 },
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 35, color: '#3b82f6' },
    { name: 'Referral', value: 25, color: '#06b6d4' },
    { name: 'Direct', value: 20, color: '#10b981' },
    { name: 'Agency', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 8, color: '#64748b' },
  ];

  const candidates: Candidate[] = [
    { id: 1, name: 'Homel Clay', position: 'Senior Dev', status: 'Interview', score: 85, appliedDate: '2024-01-10' },
    { id: 2, name: 'Festival Day', position: 'UI Designer', status: 'Review', score: 58, appliedDate: '2024-01-09' },
    { id: 3, name: 'Analytical Dev', position: 'Data Analyst', status: 'Hired', score: 91, appliedDate: '2024-01-08' },
    { id: 4, name: 'Brojaland One T', position: 'DevOps Eng', status: 'Interview', score: 73, appliedDate: '2024-01-07' },
    { id: 5, name: 'Besthend Vedacq', position: 'PM', status: 'Pending', score: 67, appliedDate: '2024-01-06' },
  ];

  const activities: ActivityItem[] = [
    { id: 1, type: 'hired', message: 'Was hired for Frontend Dev', candidate: 'Sarah Johnson', position: 'Frontend', time: '2 hours ago' },
    { id: 2, type: 'interview', message: 'Interview scheduled', candidate: 'Mike Roberts', position: 'Backend', time: '4 hours ago' },
    { id: 3, type: 'application', message: 'New application received', candidate: 'Emily Chen', position: 'Designer', time: '6 hours ago' },
    { id: 4, type: 'review', message: 'Under technical review', candidate: 'James Wilson', position: 'DevOps', time: '8 hours ago' },
    { id: 5, type: 'hired', message: 'Successfully onboarded', candidate: 'Lisa Brown', position: 'PM', time: '1 day ago' },
  ];

  useEffect(() => {
    // Check role
    const role = api.getRole();
    if (role !== 'ADMIN' && role !== 'HR') {
      navigate('/forbidden');
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed left-0 top-0 h-screen w-20 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 z-50"
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`relative p-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                />
              )}
              <item.icon className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Global Talent Pool Mini */}
        <div className="mt-auto mb-4 w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors">
          <MapPin className="w-5 h-5 text-slate-400" />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="pl-24 pr-6 py-6 relative z-10">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2">
              Random Candidate
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="relative p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">3</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">HR</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Applicants"
            value={stats.totalApplicants.toLocaleString()}
            subtext="Updated today"
            color="#3b82f6"
            chartData={[{ value: 30 }, { value: 45 }, { value: 35 }, { value: 50 }, { value: 42 }, { value: 65 }, { value: 55 }]}
            delay={0.1}
            icon={Users}
          />
          <StatCard
            title="New Applications"
            value={stats.newApplications.toString()}
            subtext="Interview stage"
            color="#f97316"
            chartData={[{ value: 15 }, { value: 22 }, { value: 18 }, { value: 28 }, { value: 32 }, { value: 39 }, { value: 35 }]}
            delay={0.2}
            icon={FileText}
          />
          <StatCard
            title="Hired Candidates"
            value={`${stats.hiredRate}%`}
            subtext="Success rate"
            color="#10b981"
            chartData={[{ value: 75 }, { value: 80 }, { value: 78 }, { value: 85 }, { value: 88 }, { value: 92 }, { value: 90 }]}
            delay={0.3}
            icon={TrendingUp}
          />
          <StatCard
            title="Active Vacancies"
            value={stats.activeVacancies.toString()}
            subtext="Currently hiring"
            color="#8b5cf6"
            chartData={[{ value: 18 }, { value: 20 }, { value: 22 }, { value: 19 }, { value: 24 }, { value: 21 }, { value: 24 }]}
            delay={0.35}
            icon={Briefcase}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-5 mb-8">
          <VacancyFillChart data={vacancyData} />
          <SourceDonutChart data={sourceData} />
          <AIRecommendedWidget />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-12 gap-5">
          <GlobalTalentPool />
          <CandidatesTable candidates={candidates} />
          <ActivityFeed activities={activities} />
        </div>
      </main>
    </div>
  );
};

export default HRAdminDashboard;
