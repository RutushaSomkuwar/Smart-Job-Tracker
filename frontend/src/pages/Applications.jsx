import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  Calendar,
  Building,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';
import ApplicationFormModal from '../components/ApplicationFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const STATUS_TABS = [
  'All',
  'Applied',
  'Screening',
  'Interview',
  'Assessment',
  'Offer',
  'Rejected',
  'Withdrawn',
];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('applied_date');
  const [order, setOrder] = useState('desc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        sort_by: sortBy,
        order: order,
      };
      const data = await applicationService.getApplications(params);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery, sortBy, order]);

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      await applicationService.createApplication(formData);
      setIsCreateModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error('Failed to create application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingApplication) return;
    try {
      setIsSubmitting(true);
      await applicationService.updateApplication(editingApplication.id, formData);
      setEditingApplication(null);
      fetchApplications();
    } catch (err) {
      console.error('Failed to update application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      setDeletingId(id);
      await applicationService.deleteApplication(id);
      setApplications(applications.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete application:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickStatusChange = async (appId, newStatus, e) => {
    e.stopPropagation();
    try {
      await applicationService.updateApplication(appId, { status: newStatus });
      setApplications(
        applications.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Applications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, filter, and track all your job submissions in one place
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, job title, or location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [sb, ord] = e.target.value.split('-');
              setSortBy(sb);
              setOrder(ord);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-slate-700 font-medium"
          >
            <option value="applied_date-desc">Applied Date (Newest first)</option>
            <option value="applied_date-asc">Applied Date (Oldest first)</option>
            <option value="company-asc">Company (A-Z)</option>
            <option value="company-desc">Company (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <LoadingSpinner message="Fetching job applications..." />
      ) : applications.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Company & Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Type & Location</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Company & Role */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                        <span>{app.company}</span>
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-brand-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-slate-600 font-medium mt-0.5">{app.job_title}</div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app.id, e.target.value, e)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:border-slate-300 focus:outline-none cursor-pointer"
                      >
                        {STATUS_TABS.filter((t) => t !== 'All').map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Type & Location */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-700">{app.job_type || 'Full-time'}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{app.location || 'Not specified'}</p>
                    </td>

                    {/* Salary */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {app.salary || '—'}
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {app.applied_date}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Details & Analysis"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingApplication(app)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Application"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(app.id, e)}
                          disabled={deletingId === app.id}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No applications match your filter"
          description="Try adjusting your search keywords or status filter, or create a new application."
          actionText="Add Application"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Modal */}
      <ApplicationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Edit Modal */}
      <ApplicationFormModal
        isOpen={!!editingApplication}
        onClose={() => setEditingApplication(null)}
        onSubmit={handleUpdate}
        initialData={editingApplication}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Applications;
