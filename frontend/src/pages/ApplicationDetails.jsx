import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { analysisService } from '../services/analysisService';
import StatusBadge from '../components/StatusBadge';
import KeywordBadge from '../components/KeywordBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ApplicationFormModal from '../components/ApplicationFormModal';

const STAGES = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer'];

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const appData = await applicationService.getApplication(id);
      setApplication(appData);
      setNotes(appData.notes || '');

      // Check for attached analysis
      try {
        const analysisData = await analysisService.getAnalysisByApplication(id);
        setAnalysis(analysisData);
      } catch (e) {
        console.log('No analysis found for this application');
      }
    } catch (err) {
      console.error('Failed to load application details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      const updated = await applicationService.updateApplication(id, formData);
      setApplication(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update application:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await applicationService.deleteApplication(id);
      navigate('/applications');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await applicationService.updateApplication(id, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading application details..." />;
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Application not found.</p>
        <button
          onClick={() => navigate('/applications')}
          className="mt-4 text-xs font-bold text-brand-600 hover:underline"
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(application.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/applications')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{application.company}</h1>
              <StatusBadge status={application.status} size="lg" />
            </div>
            <p className="text-base font-semibold text-slate-600 mt-1">{application.job_title}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Applied Date</p>
              <p className="text-xs font-bold text-slate-800">{application.applied_date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Location</p>
              <p className="text-xs font-bold text-slate-800">{application.location || 'Remote / Unspecified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Job Type</p>
              <p className="text-xs font-bold text-slate-800">{application.job_type || 'Full-time'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Compensation</p>
              <p className="text-xs font-bold text-slate-800">{application.salary || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {application.job_url && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Job Posting Link:</span>
            <a
              href={application.job_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Visit external posting</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Stage Progression Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Recruitment Pipeline Progress</h3>
        <div className="relative flex items-center justify-between">
          {/* Progress bar line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0" />
          
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex !== -1 && idx <= currentStageIndex;
            const isCurrent = stage === application.status;

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 ${
                    isCurrent ? 'text-brand-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume Keyword Match Analysis Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Linked Resume & Keyword Analysis</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated skills comparison between candidate resume and this role
            </p>
          </div>
          <button
            onClick={() => navigate(`/resume-analyzer?application_id=${application.id}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>{analysis ? 'Re-Analyze Match' : 'Analyze Resume Against Job'}</span>
          </button>
        </div>

        {analysis ? (
          <div className="mt-5 space-y-5">
            {/* Score Banner */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-xl text-white shadow-md ${
                    analysis.match_percentage >= 75
                      ? 'bg-emerald-500'
                      : analysis.match_percentage >= 50
                      ? 'bg-brand-500'
                      : 'bg-amber-500'
                  }`}
                >
                  {analysis.match_percentage}%
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Resume–Job Description Match Score</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from extracted technical skills and role requirements.
                </p>
              </div>
            </div>

            {/* Matched & Missing Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                <p className="text-xs font-bold text-emerald-800 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matched Keywords ({analysis.matched_keywords?.length || 0})</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched_keywords?.map((kw) => (
                    <KeywordBadge key={kw} keyword={kw} type="matched" />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                <p className="text-xs font-bold text-amber-800 mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Missing Keywords ({analysis.missing_keywords?.length || 0})</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing_keywords?.map((kw) => (
                    <KeywordBadge key={kw} keyword={kw} type="missing" />
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-800">Targeted Resume Suggestions</p>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-4">
            <p className="text-xs font-medium text-slate-500 mb-3">
              No resume analysis linked to this application yet.
            </p>
            <button
              onClick={() => navigate(`/resume-analyzer?application_id=${application.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Resume Against Job</span>
            </button>
          </div>
        )}
      </div>

      {/* Notes & Interview Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Application Notes & Interview Log</h3>
          {notesSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record recruiter notes, interview feedback, questions asked, follow-up dates..."
          className="w-full p-3.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <ApplicationFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={application}
      />
    </div>
  );
};

export default ApplicationDetails;
