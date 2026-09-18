import React from 'react';
import { Sparkles, Plus, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onAddApplication, title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/80 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/resume-analyzer')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Analyze Resume</span>
        </button>

        {onAddApplication && (
          <button
            onClick={onAddApplication}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
