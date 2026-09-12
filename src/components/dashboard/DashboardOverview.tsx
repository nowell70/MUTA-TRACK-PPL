import React from 'react';
import {
  PlusCircle,
  Activity,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  Clock,
  Dna,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart2,
} from 'lucide-react';
import { AnalysisJob, User } from '../../types';

interface DashboardOverviewProps {
  analyses: AnalysisJob[];
  user: User | null;
  onNavigate: (page: string, jobId?: string) => void;
  onDeleteAnalysis?: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analyses,
  user,
  onNavigate,
  onDeleteAnalysis,
}) => {
  const total = analyses.length;
  const running = analyses.filter((a) => a.status === 'Running').length;
  const completed = analyses.filter((a) => a.status === 'Completed').length;
  const failed = analyses.filter((a) => a.status === 'Failed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Running
          </span>
        );
      case 'Validating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            <Clock className="w-3 h-3" />
            Validating
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/80 text-rose-300 border border-rose-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome & Primary Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome to MutaTrack
            </h1>
            <span className="text-xs font-mono bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded">
              Bioinformatics Hub
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Integrated GATK DNA-seq Variant Calling & Single Canvas Analysis Environment • Operator:{' '}
            <span className="text-teal-300 font-medium">{user?.name || 'Pengguna Analisis'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-new-analysis-btn"
            onClick={() => onNavigate('new-analysis')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition-all shadow-md cursor-pointer hover:shadow-teal-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Analyses</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">{total}</span>
            <span className="text-[11px] text-slate-500 font-mono">Managed Jobs</span>
          </div>
        </div>

        {/* Running */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300/90">Running</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-amber-300">{running}</span>
            <span className="text-[11px] text-amber-400/70 font-mono">In Progress</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300/90">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-emerald-300">{completed}</span>
            <span className="text-[11px] text-emerald-400/70 font-mono">Ready for Canvas</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300/90">Failed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-rose-300">{failed}</span>
            <span className="text-[11px] text-rose-400/70 font-mono">Error Logged</span>
          </div>
        </div>
      </div>

      {/* Genomic Pipeline Banner (Snakemake reference integration) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
            <Dna className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Standardized GATK DNA-seq Automated Workflow
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                End-to-End
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Consolidates multi-step command-line variant calling: <em>FastQC → Cutadapt → BWA-MEM → Picard MarkDuplicates → GATK BQSR → GATK HaplotypeCaller → VariantFiltration → SnpEff / ClinVar</em> into a unified web interface with single-canvas results.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('traceability')}
          className="self-start lg:self-center flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 border border-teal-800/80 bg-teal-950/50 hover:bg-teal-900/50 px-3 py-1.5 rounded-lg transition-all font-mono shrink-0 cursor-pointer"
        >
          <span>View Pipeline Traceability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Section: Recent Analyses */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Analyses</h2>
            <p className="text-xs text-slate-400">
              Active and completed bioinformatics pipeline executions
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View All History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
                <th className="py-3 px-4">Analysis ID</th>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Reference Genome</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {analyses.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-teal-300">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">
                    {item.sampleId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {item.projectName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700/60">
                      {item.referenceGenome}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {item.createdAt}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === 'Completed' ? (
                        <button
                          onClick={() => onNavigate('results', item.id)}
                          className="px-3 py-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>View Results</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('monitoring', item.id)}
                          className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Monitor</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
