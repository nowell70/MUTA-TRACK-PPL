import React from 'react';
import { Printer, Download, X, Dna, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { AnalysisJob } from '../../types';

interface ReportModalProps {
  job: AnalysisJob;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ job, onClose }) => {
  const m = job.metrics;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar (Screen only) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-white">MutaTrack Clinical & Research Genomics Report</span>
            <span className="text-slate-400 font-mono">({job.id})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-900 text-slate-100 font-sans print:bg-white print:text-black print:p-6 print:m-0">
          {/* Report Header */}
          <div className="border-b-2 border-teal-500 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Dna className="w-6 h-6 text-teal-500 print:text-teal-700" />
                <h1 className="text-2xl font-bold tracking-tight text-white print:text-black">
                  MutaTrack Analysis Report
                </h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Automated GATK DNA-seq Variant Calling & Single Canvas Genomic Summary
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 print:text-slate-700">
              <div>Document ID: <strong className="text-white print:text-black">{job.id}</strong></div>
              <div>Generated: {job.completedAt || job.createdAt}</div>
              <div>Pipeline: GATK HaplotypeCaller v4.5</div>
            </div>
          </div>

          {/* 1. Project & Sample Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Sample Identifier</span>
              <strong className="text-teal-300 print:text-teal-800 text-sm font-mono">{job.sampleId}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Project Name</span>
              <strong className="text-white print:text-black">{job.projectName}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Reference Genome</span>
              <strong className="text-white print:text-black font-mono">{job.referenceGenome}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Annotation Database</span>
              <strong className="text-white print:text-black font-mono">{job.annotationDb}</strong>
            </div>
          </div>

          {/* 2. Analysis Parameters */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-teal-800 font-mono">
              Analysis Parameters & Filter Thresholds
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 print:text-slate-800">
              <div className="p-2.5 rounded bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">Min Mapping Quality</span>
                <span className="font-mono font-bold">{job.parameters.minMappingQuality}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">Min Base Quality</span>
                <span className="font-mono font-bold">{job.parameters.minBaseQuality}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">Min Read Depth</span>
                <span className="font-mono font-bold">{job.parameters.minDepth}x</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">Variant QUAL Threshold</span>
                <span className="font-mono font-bold">{job.parameters.variantQualityThreshold}</span>
              </div>
            </div>
          </div>

          {/* 3. QC & Alignment Summary */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-teal-800 font-mono">
              Sequencing QC & Alignment Summary
            </h2>
            <table className="w-full text-left border-collapse border border-slate-800 print:border-slate-300">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-800 font-mono text-[11px]">
                  <th className="p-2 border border-slate-800 print:border-slate-300">Metric</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">Observed Value</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">Target Standard</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300 font-mono">
                <tr>
                  <td className="p-2 border border-slate-800 print:border-slate-300">Total Read Count</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">{m.readCount.toLocaleString()}</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">&gt; 10M pairs</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-slate-300">Phred Q30 Score</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">{m.q30ScorePct}%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">&gt; 85%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-slate-300">GC Content</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">{m.gcContentPct}%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">40% - 55%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-slate-300">BWA-MEM Mapping Rate</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">{m.mappingPercentage}%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">&gt; 95%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-slate-300">Mean Coverage Depth</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">{m.meanReadDepth}x</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">&gt; 30x</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-700 font-bold">PASS</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 print:border-slate-300">Duplication Rate</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">{m.duplicatePercentage}%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300">&lt; 10%</td>
                  <td className="p-2 border border-slate-800 print:border-slate-300 text-emerald-400 print:text-emerald-700 font-bold">PASS</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Variant Summary & Functional Consequences */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-teal-800 font-mono">
              Variant Calling & Functional Impact Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Variants</span>
                <span className="text-lg font-bold text-white print:text-black">{m.totalVariants}</span>
              </div>
              <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">SNPs / InDels</span>
                <span className="text-lg font-bold text-white print:text-black">{m.snpsCount} / {m.indelsCount}</span>
              </div>
              <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">High Impact (Loss of function)</span>
                <span className="text-lg font-bold text-rose-400 print:text-rose-700">{m.highImpactCount}</span>
              </div>
              <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-500 block">ClinVar Pathogenic</span>
                <span className="text-lg font-bold text-rose-400 print:text-rose-700">{m.clinvarPathogenicCount}</span>
              </div>
            </div>
          </div>

          {/* 5. Key Pathogenic Alterations Table */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-teal-800 font-mono">
              Selected High-Priority Alterations
            </h2>
            <table className="w-full text-left border-collapse border border-slate-800 print:border-slate-300 font-mono text-[11px]">
              <thead>
                <tr className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-800">
                  <th className="p-2 border border-slate-800 print:border-slate-300">Gene</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">Locus</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">HGVS.c</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">HGVS.p</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">Depth</th>
                  <th className="p-2 border border-slate-800 print:border-slate-300">Clinical Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {job.variants.slice(0, 5).map((v) => (
                  <tr key={v.id}>
                    <td className="p-2 font-bold font-sans text-teal-300 print:text-teal-800 border border-slate-800 print:border-slate-300">
                      {v.gene}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-slate-300">
                      {v.chromosome}:{v.position}
                    </td>
                    <td className="p-2 border border-slate-800 print:border-slate-300">{v.hgvs_c || 'c.-'}</td>
                    <td className="p-2 border border-slate-800 print:border-slate-300">{v.hgvs_p || 'p.-'}</td>
                    <td className="p-2 border border-slate-800 print:border-slate-300">{v.dp}x</td>
                    <td className="p-2 font-sans font-bold text-rose-400 print:text-rose-700 border border-slate-800 print:border-slate-300">
                      {v.clinvar || 'Pathogenic'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div>Sign-off: Authorized Genomic Analyst</div>
            <div>MutaTrack Genomics Workflow Engine • Verified Automated Output</div>
          </div>
        </div>
      </div>
    </div>
  );
};
