import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, FileText, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resumeService } from '../services/resumeService';
import { applicationService } from '../services/applicationService';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [totalApps, setTotalApps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingResumeId, setDeletingResumeId] = useState(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [resumesList, appsList] = await Promise.all([
        resumeService.getResumes(),
        applicationService.getApplications(),
      ]);
      setResumes(resumesList);
      setTotalApps(appsList.length);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      setDeletingResumeId(resumeId);
      await resumeService.deleteResume(resumeId);
      setResumes(resumes.filter((r) => r.id !== resumeId));
    } catch (err) {
      console.error('Failed to delete resume:', err);
    } finally {
      setDeletingResumeId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading account details..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile & Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account credentials and uploaded resume library
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-brand-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Authenticated via JWT
            </span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Tracked Applications</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalApps}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Uploaded Resumes</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{resumes.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Account Member Since</p>
            <p className="text-xs font-bold text-slate-900 mt-2">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Resumes Library */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Uploaded Resume Library</h3>
            <p className="text-xs text-slate-500">Extracted resume documents stored in database</p>
          </div>
        </div>

        {resumes.length > 0 ? (
          <div className="space-y-2.5">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{resume.filename}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {resume.character_count?.toLocaleString()} characters extracted • Uploaded{' '}
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteResume(resume.id)}
                  disabled={deletingResumeId === resume.id}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No resumes uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
