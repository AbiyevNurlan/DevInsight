import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useToast } from '../../components/Toast'
import analyticsService, {
  AnalyticsOverview,
  InterviewTrend,
  ScoreDistribution,
  PassFailRatio
} from '../../services/analyticsService'
import { Activity, BarChart2, PieChart as PieIcon, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'

// Chart colors aligned with Obsidian theme
const COLORS = {
  primary: '#FAFAFA',     // White
  secondary: '#52525B',   // Deep Zinc
  tertiary: '#71717A',    // Muted Zinc
  success: '#10B981',     // Muted Emerald
  danger: '#EF4444',      // Muted Red
  warning: '#F59E0B',     // Amber
}

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary]
const BAR_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.secondary, COLORS.primary]

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trends, setTrends] = useState<InterviewTrend[]>([])
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([])
  const [passFailRatio, setPassFailRatio] = useState<PassFailRatio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [overviewData, trendsData, scoreData, passFailData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends(30),
        analyticsService.getScoreDistribution(),
        analyticsService.getPassFailRatio()
      ])
      setOverview(overviewData)
      setTrends(trendsData)
      setScoreDistribution(scoreData)
      setPassFailRatio(passFailData)
    } catch (err: any) {
      console.error('Error loading analytics:', err)
      const errorMsg = err.response?.data?.message || 'Failed to load analytics data'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Format trends data for the chart
  const formattedTrends = trends.map(t => ({
    ...t,
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  // Prepare pie chart data
  const pieData = passFailRatio ? [
    { name: 'Passed', value: passFailRatio.passed },
    { name: 'Failed', value: passFailRatio.failed },
    { name: 'Pending', value: passFailRatio.pending }
  ] : []

  const totalCandidates = passFailRatio
    ? passFailRatio.passed + passFailRatio.failed + passFailRatio.pending
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-card border border-border p-3 rounded-lg shadow-xl">
          <p className="text-text-primary font-medium mb-1 text-xs uppercase tracking-wider">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-text-secondary">{p.name}:</span>
              <span className="font-mono font-bold text-text-primary">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-card rounded-xl border border-border" />)}
        <div className="col-span-1 lg:col-span-2 h-80 bg-background-card rounded-xl border border-border" />
        <div className="col-span-1 lg:col-span-2 h-80 bg-background-card rounded-xl border border-border" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 card-zinc border-error/20">
        <AlertCircle className="w-12 h-12 text-error mb-4 opacity-80" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Data Unavailable</h2>
        <p className="text-text-muted mb-6">{error}</p>
        <button
          onClick={loadAllData}
          className="btn-secondary"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary tracking-tight flex items-center gap-3">
            Analytics
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Performance metrics and pipeline visualization.
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="p-2.5 bg-background-subtle hover:bg-zinc-800 text-text-primary rounded-lg transition-colors border border-border"
          title="Refresh Data"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* TOP SECTION: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<Activity size={20} />}
          title="Total Interviews"
          value={overview?.totalInterviews ?? 0}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Completion Rate"
          value={`${overview?.completionRate?.toFixed(1) ?? 0}%`}
        />
        <StatCard
          icon={<BarChart2 size={20} />}
          title="Avg Score"
          value={`${overview?.averageScore?.toFixed(1) ?? 0}`}
        />
        <StatCard
          icon={<PieIcon size={20} />}
          title="Pass Rate"
          value={`${overview?.passRate?.toFixed(1) ?? 0}%`}
        />
      </div>

      {/* MIDDLE SECTION: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Trends */}
        <div className="glass-panel p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-text-primary">Interview Volume</h2>
            <p className="text-xs text-text-muted uppercase tracking-wider">Last 30 days</p>
          </div>
          <div className="h-72">
            {formattedTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717A"
                    tick={{ fill: '#71717A', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#71717A"
                    tick={{ fill: '#71717A', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525B', strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Interviews"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 0 }}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage message="No trend data" />
            )}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="glass-panel p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-text-primary">Score Distribution</h2>
            <p className="text-xs text-text-muted uppercase tracking-wider">Candidate Performance</p>
          </div>
          <div className="h-72">
            {scoreDistribution.some(s => s.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis
                    dataKey="scoreRange"
                    stroke="#71717A"
                    tick={{ fill: '#71717A', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#71717A"
                    tick={{ fill: '#71717A', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#18181B' }} />
                  <Bar
                    dataKey="count"
                    name="Candidates"
                    radius={[2, 2, 0, 0]}
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage message="No score data" />
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Pie Chart & Summary */}
      <div className="glass-panel p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-text-primary">Outcome Ratio</h2>
          <p className="text-xs text-text-muted uppercase tracking-wider">Pass / Fail / Pending</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Pie Chart */}
          <div className="h-64 w-full lg:w-1/2 relative">
            {totalCandidates > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage message="No data" />
            )}

            {/* Center Label */}
            {totalCandidates > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-semibold text-text-primary">{totalCandidates}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Total</span>
              </div>
            )}
          </div>

          {/* Summary Legend */}
          {passFailRatio && totalCandidates > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              <LegendItem
                label="Passed"
                value={passFailRatio.passed}
                total={totalCandidates}
                color={COLORS.primary}
              />
              <LegendItem
                label="Failed"
                value={passFailRatio.failed}
                total={totalCandidates}
                color={COLORS.secondary}
              />
              <LegendItem
                label="Pending"
                value={passFailRatio.pending}
                total={totalCandidates}
                color={COLORS.tertiary}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Components
const StatCard = ({ icon, title, value }: any) => (
  <div className="glass-panel p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-background-subtle flex items-center justify-center text-text-primary border border-border">
      {icon}
    </div>
    <div>
      <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-semibold text-text-primary mt-0.5">{value}</p>
    </div>
  </div>
)

const LegendItem = ({ label, value, total, color }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-w-[140px]">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs font-bold text-text-secondary uppercase">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-semibold text-text-primary">{value}</span>
      <span className="text-xs text-text-muted">
        ({((value / total) * 100).toFixed(0)}%)
      </span>
    </div>
  </div>
)

const NoDataMessage = ({ message }: { message: string }) => (
  <div className="h-full flex flex-col items-center justify-center text-text-muted/50">
    <div className="text-2xl mb-2 grayscale opacity-30">∅</div>
    <p className="text-xs font-medium uppercase tracking-wider">{message}</p>
  </div>
)

export default AnalyticsPage
