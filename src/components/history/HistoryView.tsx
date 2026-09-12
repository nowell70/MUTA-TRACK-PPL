import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  Activity,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  BarChart2,
  FileCode,
  FileSpreadsheet,
  PlusCircle,
  Dna,
} from 'lucide-react';
import { AnalysisJob } from '../../types';
import { downloadVcf, downloadCsv } from '../../utils/exportUtils';

interface HistoryViewProps {
  analyses: AnalysisJob[];
  onNavigate: (page: string, jobId?: string) => void;
  onDeleteAnalysis: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  onNavigate,
  onDeleteAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.sampleId.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.referenceGenome.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [analyses, searchQuery, statusFilter]);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Analysis History Repository
            </h1>
            <span className="text-xs font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
              {analyses.length} Total Runs
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Archive of processed DNA-seq variant calling workflows, input FASTQs, and Single Canvas artifacts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-analysis')}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition-all shadow-md cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Analysis</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by analysis ID, sample, project..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Status:</span>
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 font-mono text-[11px]">
            {['ALL', 'Completed', 'Running', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  statusFilter === status
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3.5 px-4">Analysis ID</th>
                <th className="py-3.5 px-4">Sample ID</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Duration / Walltime</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No historical analysis jobs match your criteria.
                  </td>
                </tr>
              ) : (
                filteredAnalyses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-300">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.sampleId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.projectName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.createdAt}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                        {item.referenceGenome}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.status === 'Completed' ? '16m 35s' : item.status === 'Running' ? 'Active' : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'Completed' ? (
                          <>
                            <button
                              onClick={() => onNavigate('results', item.id)}
                              className="px-3 py-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Inspect Single Canvas"
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              <span>View Results</span>
                            </button>

                            <button
                              onClick={() => downloadVcf(item)}
                              className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Download VCF"
                            >
                              <FileCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadCsv(item)}
                              className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Download CSV"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onNavigate('monitoring', item.id)}
                            className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Monitor</span>
                          </button>
                        )}

                        {/* Delete Action */}
                        <button
                          onClick={() => onDeleteAnalysis(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                          title="Delete record from repository"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
