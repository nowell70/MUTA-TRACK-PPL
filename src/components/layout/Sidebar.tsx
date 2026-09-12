import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  FileCheck2,
  History,
  GitFork,
  ExternalLink,
  Cpu,
  Layers,
  Globe,
} from 'lucide-react';
import { AnalysisJob } from '../../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, jobId?: string) => void;
  analyses: AnalysisJob[];
  runningJob?: AnalysisJob;
  activeResultJob?: AnalysisJob;
  onOpenDeployModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  analyses,
  runningJob,
  activeResultJob,
  onOpenDeployModal,
}) => {
  const completedCount = analyses.filter((a) => a.status === 'Completed').length;
  const runningCount = analyses.filter((a) => a.status === 'Running').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      uc: 'Control',
    },
    {
      id: 'new-analysis',
      label: 'New Analysis',
      icon: PlusCircle,
      badge: '+ New',
      badgeColor: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/40',
      uc: 'UC-02 / UC-04',
    },
    {
      id: 'monitoring',
      label: 'Running Analysis',
      icon: Activity,
      badge: runningCount > 0 ? `${runningCount} active` : null,
      badgeColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
      uc: 'UC-06',
    },
    {
      id: 'results',
      label: 'Results & Canvas',
      icon: FileCheck2,
      badge: completedCount > 0 ? `${completedCount}` : null,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
      uc: 'UC-07 / UC-08',
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: History,
      badge: analyses.length.toString(),
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      uc: 'Repository',
    },
    {
      id: 'traceability',
      label: 'GATK Reference & UC',
      icon: GitFork,
      badge: 'Snakemake',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40',
      uc: 'Traceability',
    },
  ];

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 select-none transition-colors">
      <div className="p-4 space-y-6">
        {/* Navigation Sections */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Bioinformatics Workflow
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'monitoring' && runningJob) {
                      onNavigate('monitoring', runningJob.id);
                    } else if (item.id === 'results' && activeResultJob) {
                      onNavigate('results', activeResultJob.id);
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-600/20 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-500/40 font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workflow Diagram Snapshot */}
        <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
              <Cpu className="w-3 h-3" /> GATK 4 Workflow
            </span>
            <span>8 Stages</span>
          </div>
          <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <span>FASTQ paired</span>
              <span className="text-slate-400">↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>QC + Cutadapt</span>
              <span className="text-slate-400">↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>BWA-MEM + BAM</span>
              <span className="text-slate-400">↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>HaplotypeCaller</span>
              <span className="text-slate-400">↓</span>
            </div>
            <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 font-medium">
              <span>VCF + Annotations</span>
              <span className="text-teal-600 dark:text-teal-400">✓</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Standardized pipeline referencing Snakemake DNA-seq best practices.
          </p>
        </div>
      </div>

      {/* Footer Info & GitHub Deploy Modal button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-2.5">
        {onOpenDeployModal && (
          <button
            onClick={onOpenDeployModal}
            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Tampilkan di GitHub (Link)</span>
          </button>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Layers className="w-3 h-3 text-slate-400" /> Reference
          </span>
          <a
            href="https://github.com/snakemake-workflows/dna-seq-gatk-variant-calling"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline font-mono"
            title="Buka repository referensi Snakemake GATK"
          >
            GitHub <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
          System: Online • Local Sandbox Mode
        </div>
      </div>
    </aside>
  );
};
