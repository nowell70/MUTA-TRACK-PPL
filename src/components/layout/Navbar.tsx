import React from 'react';
import {
  Dna,
  Activity,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  MailCheck,
  AlertTriangle,
} from 'lucide-react';
import { User, AnalysisJob } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  user: User | null;
  runningJob?: AnalysisJob;
  onNavigate: (page: string, jobId?: string) => void;
  onLogout: () => void;
  currentPage: string;
  onOpenVerifyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  runningJob,
  onNavigate,
  onLogout,
  currentPage,
  onOpenVerifyModal,
}) => {
  const { isDark, toggleTheme } = useTheme();

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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 sticky top-0 shadow-xs transition-colors">
      {/* Brand & Genomic Identity */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 dark:border-teal-500/40 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:border-teal-400 transition-colors shadow-inner">
            <Dna className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                MutaTrack
              </span>
              <span className="text-[10px] font-mono uppercase bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 px-1.5 py-0.5 rounded tracking-wider">
                GATK v4.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-normal hidden sm:block">
              Integrated Variant Calling Platform
            </p>
          </div>
        </button>

        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Workflow</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          <span className="text-teal-600 dark:text-teal-400 font-medium">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right side status, tools, and user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Running analysis active ticker */}
        {runningJob && (
          <button
            onClick={() => onNavigate('monitoring', runningJob.id)}
            className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-xs"
            title="Klik untuk melihat monitor analisis yang sedang berjalan"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5" />
            <span className="font-medium">{runningJob.id}</span>
            <span className="text-amber-600 dark:text-amber-400/80 hidden md:inline">
              ({runningJob.stages[runningJob.currentStageIndex]?.name || 'Running'})
            </span>
          </button>
        )}

        {/* Reference Genome Badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>GRCh38</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Card, Gmail Verification Badge, & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={onOpenVerifyModal}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
              title="Klik untuk membuka detail status verifikasi Gmail"
            >
              <div className="w-7 h-7 rounded-full bg-teal-600/20 text-teal-600 dark:text-teal-300 border border-teal-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[110px]">{user.name}</span>
                  {user.isEmailVerified ? (
                    <span title="Gmail Terverifikasi">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                  ) : (
                    <span title="Gmail Belum Terverifikasi">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono leading-tight flex items-center gap-1">
                  <span>{user.isEmailVerified ? 'Gmail Verified' : 'Belum Verif'}</span>
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Keluar dari sesi akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
