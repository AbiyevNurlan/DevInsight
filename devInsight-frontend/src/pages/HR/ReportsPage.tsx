import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const defaultHiringTrendData = [
  { month: 'Jan', hired: 0, applications: 0 },
  { month: 'Feb', hired: 0, applications: 0 },
  { month: 'Mar', hired: 0, applications: 0 },
  { month: 'Apr', hired: 0, applications: 0 },
  { month: 'May', hired: 0, applications: 0 },
  { month: 'Jun', hired: 0, applications: 0 },
];

const departmentColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#06b6d4'];

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [hiringTrendData, setHiringTrendData] = useState(defaultHiringTrendData);
  const [scoreDistribution, setScoreDistribution] = useState<{name: string; value: number; color: string}[]>([]);
  const [timeToHireData, setTimeToHireData] = useState<{stage: string; days: number}[]>([]);
  const [stats, setStats] = useState({
    totalHires: 0,
    avgCompletionDays: 0,
    openPositions: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overview, distribution, passFailData, hiringStats] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getScoreDistribution(),
        analyticsService.getPassFailRatio(),
        analyticsService.getHiringStats(),
      ]);

      // Stats
      setStats({
        totalHires: hiringStats.totalHires || 0,
        avgCompletionDays: hiringStats.avgCompletionDays || 0,
        openPositions: hiringStats.openPositions || 0,
        passRate: overview.passRate || 0,
      });

      // Hiring trends from monthly data
      if (hiringStats.monthlyTrends) {
        const trendEntries = Object.entries(hiringStats.monthlyTrends).map(([month, data]: [string, any]) => ({
          month,
          hired: data.hired || 0,
          applications: data.applications || 0,
        }));
        if (trendEntries.length > 0) setHiringTrendData(trendEntries);
      }

      // Score distribution as pie chart
      if (distribution && distribution.length > 0) {
        setScoreDistribution(distribution.map((d, i) => ({
          name: d.scoreRange,
          value: d.count,
          color: departmentColors[i % departmentColors.length],
        })));
      }

      // Time stages from overview
      setTimeToHireData([
        { stage: 'Screening', days: Math.round((hiringStats.avgCompletionDays || 21) * 0.14) },
        { stage: 'Interview', days: Math.round((hiringStats.avgCompletionDays || 21) * 0.33) },
        { stage: 'Assessment', days: Math.round((hiringStats.avgCompletionDays || 21) * 0.24) },
        { stage: 'Offer', days: Math.round((hiringStats.avgCompletionDays || 21) * 0.19) },
        { stage: 'Onboard', days: Math.round((hiringStats.avgCompletionDays || 21) * 0.10) },
      ]);

    } catch (error) {
      console.log('Analytics API not available, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 1, name: 'Hiring Summary Q1 2024', type: 'PDF', size: '2.4 MB', date: '2024-01-15' },
    { id: 2, name: 'Candidate Source Analysis', type: 'XLSX', size: '1.8 MB', date: '2024-01-12' },
    { id: 3, name: 'Department Breakdown', type: 'PDF', size: '3.1 MB', date: '2024-01-10' },
    { id: 4, name: 'Time-to-Hire Report', type: 'PDF', size: '1.2 MB', date: '2024-01-08' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track hiring metrics and generate reports</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="thisyear">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Hires', value: String(stats.totalHires), change: `${stats.passRate.toFixed(0)}% pass`, positive: true, icon: Users },
          { label: 'Avg. Time to Hire', value: `${stats.avgCompletionDays} days`, change: '', positive: true, icon: Clock },
          { label: 'Open Positions', value: String(stats.openPositions), change: '', positive: false, icon: Briefcase },
          { label: 'Pass Rate', value: `${stats.passRate.toFixed(1)}%`, change: '', positive: true, icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              <span className={`text-xs flex items-center gap-1 ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Hiring Trend */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-8 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-white font-semibold mb-6">Hiring Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hiringTrendData}>
                <defs>
                  <linearGradient id="hiredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={2} fill="url(#applicationsGradient)" />
                <Area type="monotone" dataKey="hired" stroke="#3b82f6" strokeWidth={2} fill="url(#hiredGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 lg:col-span-4 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-white font-semibold mb-6">Score Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={scoreDistribution}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {scoreDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Time to Hire Breakdown */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-white font-semibold mb-6">Time to Hire Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeToHireData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="days" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-12 lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-white font-semibold mb-6">Recent Reports</h3>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{report.name}</p>
                    <p className="text-xs text-slate-500">{report.type} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{report.date}</span>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
