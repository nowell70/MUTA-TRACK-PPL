import React from 'react';
import { Dna, Activity, User as UserIcon, LogOut, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { User, AnalysisJob } from '../../types';

interface NavbarProps {
  user: User | null;
  runningJob?: AnalysisJob;
  onNavigate: (page: string, jobId?: string) => void;
  onLogout: () => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  runningJob,
  onNavigate,
  onLogout,
  currentPage,
}) => {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Control Center';
      case 'new-analysis':
        return 'New Analysis Preparation (UC-02 / UC-04)';
      case 'monitoring':
        return 'Workflow Execution Monitor (UC-06)';
      case 'results':
        return 'Single Canvas Results (UC-07)';
      case 'history':
        return 'Analysis Repository';
      case 'traceability':
        return 'Workflow & Traceability Matrix';
      default:
        return 'Platform';
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0 shadow-sm">
      {/* Brand & Genomic Identity */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors shadow-inner">
            <Dna className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors">
                MutaTrack
              </span>
              <span className="text-[10px] font-mono uppercase bg-teal-950/80 text-teal-400 border border-teal-800/60 px-1.5 py-0.5 rounded tracking-wider">
                GATK v4.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-normal">
              Integrated Variant Calling Platform
            </p>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <span>Workflow</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-teal-400 font-medium">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right side status & user profile */}
      <div className="flex items-center gap-3">
        {/* Running analysis active ticker */}
        {runningJob && (
          <button
            onClick={() => onNavigate('monitoring', runningJob.id)}
            className="flex items-center gap-2 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer shadow-sm"
            title="Click to view running analysis monitor"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5" />
            <span className="font-medium">{runningJob.id}</span>
            <span className="text-amber-400/80 hidden sm:inline">({runningJob.stages[runningJob.currentStageIndex]?.name || 'Running'})</span>
          </button>
        )}

        {/* Reference Genome Badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 px-2.5 py-1.5 rounded-md text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>GRCh38 / Ensembl v105</span>
        </div>

        {/* User Card & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-2.5 py-1.5 rounded-md transition-colors">
              <div className="w-7 h-7 rounded-full bg-teal-600/30 text-teal-300 border border-teal-500/30 flex items-center justify-center text-xs font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium text-slate-200 leading-tight flex items-center gap-1.5">
                  <span>{user.name}</span>
                </div>
                <div className="text-[10px] text-teal-400/90 font-mono leading-tight">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
