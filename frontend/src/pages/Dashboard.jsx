import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Award,
  XCircle,
  TrendingUp,
  Percent,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { applicationService } from '../services/applicationService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ApplicationFormModal from '../components/ApplicationFormModal';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Screening: '#a855f7',
  Interview: '#6366f1',
  Assessment: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#f43f5e',
  Withdrawn: '#64748b',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateApplication = async (formData) => {
    try {
      setIsSubmitting(true);
      await applicationService.createApplication(formData);
      setIsModalOpen(false);
      await fetchStats();
    } catch (err) {
      console.error('Failed to create application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading dashboard analytics..." />;
  }

  const statusData = stats
    ? Object.entries(stats.status_counts).map(([name, count]) => ({
        name,
        count,
        fill: STATUS_COLORS[name] || '#94a3b8',
      }))
    : [];

  const trendData = stats?.monthly_trends || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Pipeline Analytics
          </span>
          <h2 className="text-2xl font-bold">Job Search Pipeline Dashboard</h2>
          <p className="text-brand-100 text-xs mt-1">
            Real-time tracking of applications, interview stages, and keyword analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Match Resume
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Application
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={stats?.total_applications || 0}
          subtitle="All recorded jobs"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Interviews"
          value={
            (stats?.status_counts?.Interview || 0) +
            (stats?.status_counts?.Assessment || 0) +
            (stats?.status_counts?.Screening || 0)
          }
          subtitle={`${stats?.interview_rate || 0}% conversion rate`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Job Offers"
          value={stats?.status_counts?.Offer || 0}
          subtitle={`${stats?.offer_rate || 0}% offer rate`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Rejections"
          value={stats?.status_counts?.Rejected || 0}
          subtitle="Closed opportunities"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Pipeline Status</h3>
              <p className="text-xs text-slate-500">Distribution across active recruitment stages</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
              Stages
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Over Time Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Activity Trend</h3>
              <p className="text-xs text-slate-500">Applications submitted over the last 6 months</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-brand-50 text-brand-700 rounded-md">
              Monthly
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8ee9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0c8ee9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0c8ee9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
            <p className="text-xs text-slate-500">Latest active submissions in your pipeline</p>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.recent_applications && stats.recent_applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Applied Date</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stats.recent_applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-slate-900">{app.company}</td>
                    <td className="py-3.5 px-6 text-slate-700 font-medium">{app.job_title}</td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">{app.applied_date}</td>
                    <td className="py-3.5 px-6 text-slate-500">{app.location || '—'}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}`);
                        }}
                        className="text-brand-600 hover:text-brand-700 font-semibold text-xs"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No applications tracked yet"
            description="Start adding job opportunities to unlock pipeline charts and insights."
            actionText="Add First Application"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </div>

      {/* Application Creation Modal */}
      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateApplication}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Dashboard;
