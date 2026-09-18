import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  ArrowRight,
  RefreshCw,
  Info,
  Trash2,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { analysisService } from '../services/analysisService';
import { applicationService } from '../services/applicationService';
import KeywordBadge from '../components/KeywordBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ResumeAnalyzer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedAppId = searchParams.get('application_id');

  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(preselectedAppId || '');
  const [jobDescription, setJobDescription] = useState('');

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadInitialData = async () => {
    try {
      const [resumesList, appsList] = await Promise.all([
        resumeService.getResumes(),
        applicationService.getApplications(),
      ]);
      setResumes(resumesList);
      setApplications(appsList);

      if (resumesList.length > 0 && !selectedResumeId) {
        setSelectedResumeId(String(resumesList[0].id));
      }
    } catch (err) {
      console.error('Failed to fetch resumes/apps:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMessage('Only PDF files are supported.');
      return;
    }

    setErrorMessage('');
    setUploading(true);
    try {
      const newResume = await resumeService.uploadResume(file);
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResumeId(String(newResume.id));
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Failed to upload and extract text from PDF.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      setErrorMessage('Please select or upload a resume.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setErrorMessage('Please enter a detailed job description (at least 15 characters).');
      return;
    }

    setErrorMessage('');
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analysisService.analyzeResume(
        parseInt(selectedResumeId),
        jobDescription,
        selectedAppId ? parseInt(selectedAppId) : null
      );
      setAnalysisResult(result);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;
    setSaving(true);
    try {
      await analysisService.saveAnalysis({
        resume_id: parseInt(selectedResumeId),
        job_description: jobDescription,
        application_id: selectedAppId ? parseInt(selectedAppId) : null,
        match_percentage: analysisResult.match_percentage,
        matched_keywords: analysisResult.matched_keywords,
        missing_keywords: analysisResult.missing_keywords,
        recommendations: analysisResult.recommendations,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save analysis.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">Smart Resume & Job Analyzer</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Extract PDF resume skills, compare against job description requirements, and identify gaps
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resume Selection & Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>1. Choose or Upload Resume (PDF)</span>
            </h3>

            {/* Existing Resumes Selector */}
            {resumes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Uploaded Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.filename}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Drag and Drop PDF Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload New Resume PDF
              </label>
              <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-brand-50/20 group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-600 mb-2 transition-colors" />
                <span className="text-xs font-semibold text-slate-700">
                  {uploading ? 'Extracting text from PDF...' : 'Click to upload PDF resume'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Maximum file size 10MB</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Optional Application Link */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">2. Link to Application (Optional)</h3>
            <p className="text-xs text-slate-500">
              Attach this analysis to one of your tracked applications to view it on the details page.
            </p>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="">-- No Application Linked --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} - {app.job_title} ({app.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Job Description Textarea (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              3. Paste Job Description Requirements
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Paste the technical job description, responsibilities, and required qualifications.
            </p>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Example: We are looking for a Software Engineer with 3+ years of experience in Python, FastAPI, React, PostgreSQL, Docker, and REST APIs..."
              className="w-full flex-1 p-3.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-y font-mono"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {jobDescription.length} characters entered
              </span>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Keywords...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Resume Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-md space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] uppercase font-bold text-brand-600 tracking-wider">
                Analysis Complete
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">Resume Alignment Score</h3>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved successfully!
                </span>
              )}
              <button
                onClick={handleSaveAnalysis}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Analysis'}</span>
              </button>
            </div>
          </div>

          {/* Match Score Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-5 md:col-span-2">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-lg shrink-0 ${
                  analysisResult.match_percentage >= 75
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
                    : analysisResult.match_percentage >= 50
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-brand-500/20'
                    : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
                }`}
              >
                {analysisResult.match_percentage}%
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {analysisResult.match_percentage >= 75
                    ? 'Strong Alignment with Requirements'
                    : analysisResult.match_percentage >= 50
                    ? 'Moderate Skill Match'
                    : 'Targeted Customization Recommended'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Found {analysisResult.matched_keywords?.length || 0} matching skills and identified{' '}
                  {analysisResult.missing_keywords?.length || 0} gaps from the target job description.
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1 text-slate-600">
              <p>
                <span className="font-bold text-slate-900">
                  {analysisResult.matched_keywords?.length || 0}
                </span>{' '}
                Skills Matched
              </p>
              <p>
                <span className="font-bold text-slate-900">
                  {analysisResult.missing_keywords?.length || 0}
                </span>{' '}
                Missing Skills
              </p>
              <p>
                <span className="font-bold text-slate-900">
                  {(analysisResult.matched_keywords?.length || 0) +
                    (analysisResult.missing_keywords?.length || 0)}
                </span>{' '}
                Total Key Terms Found
              </p>
            </div>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matched Skills ({analysisResult.matched_keywords?.length || 0})</span>
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Present in Resume
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.matched_keywords?.length > 0 ? (
                  analysisResult.matched_keywords.map((kw) => (
                    <KeywordBadge key={kw} keyword={kw} type="matched" size="lg" />
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific keyword matches found.</p>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Missing Skills ({analysisResult.missing_keywords?.length || 0})</span>
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  In Job Description
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.missing_keywords?.length > 0 ? (
                  analysisResult.missing_keywords.map((kw) => (
                    <KeywordBadge key={kw} keyword={kw} type="missing" size="lg" />
                  ))
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold">
                    No missing skills detected!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-600" />
                <span>Actionable Optimization Recommendations</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
