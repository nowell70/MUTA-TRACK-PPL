import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  FileCheck2,
  History,
  GitFork,
  HelpCircle,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnalysisJob } from '../../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, jobId?: string) => void;
  analyses: AnalysisJob[];
  runningJob?: AnalysisJob;
  activeResultJob?: AnalysisJob;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  analyses,
  runningJob,
  activeResultJob,
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
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      uc: 'UC-02 / UC-04',
    },
    {
      id: 'monitoring',
      label: 'Running Analysis',
      icon: Activity,
      badge: runningCount > 0 ? `${runningCount} active` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      uc: 'UC-06',
    },
    {
      id: 'results',
      label: 'Results & Canvas',
      icon: FileCheck2,
      badge: completedCount > 0 ? `${completedCount}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      uc: 'UC-07 / UC-08',
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: History,
      badge: analyses.length.toString(),
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      uc: 'Repository',
    },
    {
      id: 'traceability',
      label: 'GATK Reference & UC',
      icon: GitFork,
      badge: 'Snakemake',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      uc: 'Traceability',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-200 border border-teal-500/40 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
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
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
            <span className="flex items-center gap-1 text-teal-400 font-semibold">
              <Cpu className="w-3 h-3" /> GATK 4 Workflow
            </span>
            <span className="text-slate-500">8 Stages</span>
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-1 bg-slate-900/80 p-2 rounded border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span>FASTQ paired</span>
              <span className="text-slate-500">↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>QC + Cutadapt</span>
              <span className="text-slate-500">↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>BWA-MEM + BAM</span>
              <span className="text-slate-500">↓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>HaplotypeCaller</span>
              <span className="text-slate-500">↓</span>
            </div>
            <div className="flex items-center justify-between text-teal-300 font-medium">
              <span>VCF + Annotations</span>
              <span className="text-teal-400">✓</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Standardized pipeline referencing Snakemake DNA-seq best practices.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
            <Layers className="w-3 h-3 text-slate-500" /> Reference Pipeline
          </span>
          <a
            href="https://github.com/snakemake-workflows/dna-seq-gatk-variant-calling"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-teal-400 hover:text-teal-300 underline font-mono"
            title="Open Snakemake GATK GitHub reference"
          >
            GitHub <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          System: Online • Local Sandbox Mode
        </div>
      </div>
    </aside>
  );
};
