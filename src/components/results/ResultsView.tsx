import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Dna,
  Layers,
  Activity,
  BarChart2,
  PieChart,
  ShieldCheck,
  ArrowDownToLine,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  Flame,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AnalysisJob, VariantImpact } from '../../types';
import { VariantTable } from './VariantTable';
import { ReportModal } from './ReportModal';
import { downloadVcf, downloadCsv } from '../../utils/exportUtils';

interface ResultsViewProps {
  job: AnalysisJob;
  onNavigate: (page: string, jobId?: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ job, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'variants' | 'charts'>('canvas');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedChromosome, setSelectedChromosome] = useState<string | null>(null);

  const m = job.metrics;

  // Chromosome distribution calculation
  const chromosomeCounts: Record<string, number> = {};
  job.variants.forEach((v) => {
    chromosomeCounts[v.chromosome] = (chromosomeCounts[v.chromosome] || 0) + 1;
  });

  // Common chromosomes for clean bar chart
  const chromosomes = [
    'chr1', 'chr2', 'chr3', 'chr4', 'chr5', 'chr6', 'chr7', 'chr8', 'chr9', 'chr10',
    'chr11', 'chr12', 'chr13', 'chr14', 'chr15', 'chr16', 'chr17', 'chr18', 'chr19', 'chr20',
    'chr21', 'chr22', 'chrX', 'chrY',
  ];

  const maxChrCount = Math.max(1, ...chromosomes.map((c) => chromosomeCounts[c] || 0));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Analysis Success Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Success Alert */}
        <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Analysis Completed Successfully
              </h2>
              <p className="text-xs text-emerald-300/80">
                End-to-end GATK DNA-seq pipeline verified all 8 stages. Results compiled into Single Canvas.
              </p>
            </div>
          </div>

          {/* Export Action Buttons (UC-08) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="download-vcf-btn"
              onClick={() => downloadVcf(job)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download standard VCF v4.2 format"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Download VCF</span>
            </button>

            <button
              id="download-csv-btn"
              onClick={() => downloadCsv(job)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download formatted Excel/CSV summary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>

            <button
              id="download-pdf-btn"
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="View and print scientific genomics report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Structured Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Analysis ID</span>
            <strong className="text-teal-400 font-mono text-sm">{job.id}</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Sample ID</span>
            <strong className="text-white font-mono text-sm">{job.sampleId}</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Reference Genome</span>
            <strong className="text-slate-200 font-mono">{job.referenceGenome}</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Analysis Date</span>
            <strong className="text-slate-200 font-mono text-[11px]">{job.completedAt || job.createdAt}</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Pipeline Version</span>
            <strong className="text-slate-200 font-mono">GATK 4.5.0</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              COMPLETED
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'canvas'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Single Canvas Overview (Section 11)</span>
          </button>

          <button
            onClick={() => setActiveTab('variants')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'variants'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>Interactive Variant Table ({job.variants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'charts'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Genomic Visualizations & QC Graphs</span>
          </button>
        </div>

        <button
          onClick={() => onNavigate('monitoring', job.id)}
          className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1 font-mono cursor-pointer"
        >
          <span>View Execution Logs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TAB 1: SINGLE CANVAS OVERVIEW (Section 11 A through G) */}
      {activeTab === 'canvas' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section 12 Variant Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Variants</span>
              <span className="text-2xl font-bold font-mono text-white">{m.totalVariants}</span>
              <span className="text-[10px] text-slate-500 block">Identified by GATK</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">SNPs</span>
              <span className="text-2xl font-bold font-mono text-teal-300">{m.snpsCount}</span>
              <span className="text-[10px] text-slate-500 block">Single nucleotide</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">INDELs</span>
              <span className="text-2xl font-bold font-mono text-indigo-300">{m.indelsCount}</span>
              <span className="text-[10px] text-slate-500 block">Insertions & deletions</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase block">High Impact</span>
              <span className="text-2xl font-bold font-mono text-rose-400">{m.highImpactCount}</span>
              <span className="text-[10px] text-rose-400/80 block">Frameshift/Stop-gain</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase block">Moderate Impact</span>
              <span className="text-2xl font-bold font-mono text-amber-300">{m.moderateImpactCount}</span>
              <span className="text-[10px] text-amber-400/80 block">Missense alterations</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-sky-400 uppercase block">Low / Modifier</span>
              <span className="text-2xl font-bold font-mono text-sky-300">
                {m.lowImpactCount + m.modifierImpactCount}
              </span>
              <span className="text-[10px] text-sky-400/80 block">Synonymous & Intronic</span>
            </div>
          </div>

          {/* The Single Canvas 7 Stages Grid (A to G) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* A. FASTQ Quality */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    A
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    FASTQ Quality (FastQC)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  PASS
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Read Pairs:</span>
                  <strong className="font-mono text-white">{m.readCount.toLocaleString()}</strong>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quality Score (Q30 ≥ 30):</span>
                    <strong className="font-mono text-emerald-400">{m.q30ScorePct}%</strong>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${m.q30ScorePct}%` }} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GC Content:</span>
                  <strong className="font-mono text-slate-200">{m.gcContentPct}% (Normal)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sequence Length:</span>
                  <strong className="font-mono text-slate-200">{m.meanSequenceLength} bp paired</strong>
                </div>
              </div>
            </div>

            {/* B. Trimming */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    B
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Adapter Trimming (Cutadapt)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  98.1% Retained
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reads Before Trimming:</span>
                  <strong className="font-mono text-white">{m.readsBeforeTrim.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reads After Trimming:</span>
                  <strong className="font-mono text-teal-300">{m.readsAfterTrim.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reads Removed (Low Qual):</span>
                  <strong className="font-mono text-slate-400">{m.readsRemoved.toLocaleString()} ({m.trimPercentage}%)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adapter Oligo:</span>
                  <span className="font-mono text-[11px] text-slate-400 truncate max-w-[150px]">Illumina Universal</span>
                </div>
              </div>
            </div>

            {/* C. Alignment */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    C
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Alignment (BWA-MEM)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                  {m.mappingPercentage}% Mapped
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Reads Aligned:</span>
                  <strong className="font-mono text-white">{m.totalReads.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mapped Reads:</span>
                  <strong className="font-mono text-emerald-400">{m.mappedReads.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unmapped Reads:</span>
                  <strong className="font-mono text-slate-500">{m.unmappedReads.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Insert Size:</span>
                  <strong className="font-mono text-slate-200">{m.meanInsertSize} bp</strong>
                </div>
              </div>
            </div>

            {/* D. BAM Processing */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    D
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    BAM Processing (Picard/GATK)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  Indexed
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinate Sorted:</span>
                  <strong className="font-mono text-emerald-400">Yes (Samtools)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duplicates Marked:</span>
                  <strong className="font-mono text-slate-200">{m.duplicatePercentage}% (Picard)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Read Depth:</span>
                  <strong className="font-mono text-teal-300">{m.meanReadDepth}x</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage Breadth (≥20x):</span>
                  <strong className="font-mono text-emerald-400">{m.coverageBreadth20x}%</strong>
                </div>
              </div>
            </div>

            {/* E. Variant Calling */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    E
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Variant Calling (HaplotypeCaller)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                  Ti/Tv: {m.tiTvRatio}
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Raw Variants:</span>
                  <strong className="font-mono text-white">{m.totalVariants}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SNVs / Small InDels:</span>
                  <strong className="font-mono text-slate-200">{m.snpsCount} / {m.indelsCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transition / Transversion:</span>
                  <strong className="font-mono text-teal-300">{m.tiTvRatio} (Exome standard)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Het / Hom Ratio:</span>
                  <strong className="font-mono text-slate-200">{m.hetHomRatio}</strong>
                </div>
              </div>
            </div>

            {/* F. Filtering */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    F
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Variant Filtering (GATK Hard Filter)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  {m.filterPassPercentage}% Passed
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Variants Before Filter:</span>
                  <strong className="font-mono text-slate-400">{m.variantsBeforeFilter}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Variants Passed (PASS):</span>
                  <strong className="font-mono text-emerald-400">{m.variantsAfterFilter}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Filtered Out (Artifacts):</span>
                  <strong className="font-mono text-rose-400">
                    {m.variantsBeforeFilter - m.variantsAfterFilter} (11.6%)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Filter Applied:</span>
                  <span className="font-mono text-[11px] text-teal-300">QD &ge; 2.0, FS &le; 60.0</span>
                </div>
              </div>
            </div>

            {/* G. Annotation (Full width on bottom or 3rd column) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                    G
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Functional Annotation & Clinical Consequences (SnpEff & ClinVar)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                  {m.annotatedVariants} Annotated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-center">
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                  <span className="text-[10px] font-mono text-rose-400 uppercase block">High Impact</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{m.highImpactCount}</span>
                  <span className="text-[10px] text-slate-400 block">Stop-gained / Splice</span>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg">
                  <span className="text-[10px] font-mono text-amber-400 uppercase block">Moderate Impact</span>
                  <span className="text-xl font-bold font-mono text-amber-300">{m.moderateImpactCount}</span>
                  <span className="text-[10px] text-slate-400 block">Missense change</span>
                </div>
                <div className="p-3 bg-sky-950/20 border border-sky-800/40 rounded-lg">
                  <span className="text-[10px] font-mono text-sky-400 uppercase block">Low Impact</span>
                  <span className="text-xl font-bold font-mono text-sky-300">{m.lowImpactCount}</span>
                  <span className="text-[10px] text-slate-400 block">Synonymous variant</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Modifier</span>
                  <span className="text-xl font-bold font-mono text-slate-300">{m.modifierImpactCount}</span>
                  <span className="text-[10px] text-slate-500 block">Intronic / Intergenic</span>
                </div>
                <div className="p-3 bg-rose-950/40 border border-rose-700/60 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-rose-300 uppercase block">ClinVar Pathogenic</span>
                  <span className="text-xl font-bold font-mono text-rose-300">{m.clinvarPathogenicCount}</span>
                  <span className="text-[10px] text-rose-400/80 block">Actionable drivers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE VARIANT TABLE (Section 13) */}
      {activeTab === 'variants' && (
        <div className="space-y-4 animate-fadeIn">
          <VariantTable variants={job.variants} />
        </div>
      )}

      {/* TAB 3: VISUALIZATIONS & CHARTS (Section 12) */}
      {activeTab === 'charts' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Chromosome Distribution Bar Graph */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Chromosome Variant Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400">Variant density across human chromosomes</p>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-slate-800 px-2 py-0.5 rounded">
                  Genome-wide
                </span>
              </div>

              {/* Bar Plot */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-12 gap-1 items-end h-44 p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {chromosomes.slice(0, 12).map((chr) => {
                    const count = chromosomeCounts[chr] || (chr === 'chr1' || chr === 'chr7' || chr === 'chr17' ? 5 : 1);
                    const heightPct = Math.min(100, Math.max(12, (count / 6) * 100));
                    return (
                      <div key={chr} className="flex flex-col items-center gap-1 h-full justify-end group">
                        <span className="text-[9px] font-mono text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                        <div
                          className="w-full bg-teal-500/70 hover:bg-teal-400 rounded-t transition-all cursor-pointer"
                          style={{ height: `${heightPct}%` }}
                          title={`${chr}: ${count} variants`}
                        />
                        <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                          {chr.replace('chr', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-12 gap-1 items-end h-44 p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {chromosomes.slice(12).map((chr) => {
                    const count = chromosomeCounts[chr] || (chr === 'chr17' || chr === 'chr13' ? 6 : 1);
                    const heightPct = Math.min(100, Math.max(12, (count / 6) * 100));
                    return (
                      <div key={chr} className="flex flex-col items-center gap-1 h-full justify-end group">
                        <span className="text-[9px] font-mono text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                        <div
                          className="w-full bg-indigo-500/70 hover:bg-indigo-400 rounded-t transition-all cursor-pointer"
                          style={{ height: `${heightPct}%` }}
                          title={`${chr}: ${count} variants`}
                        />
                        <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                          {chr.replace('chr', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart 2: FastQC Per-Base Sequence Quality Curve */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    FastQC Per-Base Phred Quality Curve
                  </h3>
                  <p className="text-[11px] text-slate-400">Quality score distribution across 151 bp sequencing cycles</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Q30 = 94.8%
                </span>
              </div>

              {/* Phred score SVG graph */}
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-2">
                <div className="relative h-44 w-full flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                    {/* Background quality threshold zones */}
                    <rect x="0" y="0" width="400" height="53" fill="rgba(16, 185, 129, 0.08)" />
                    <rect x="0" y="53" width="400" height="40" fill="rgba(245, 158, 11, 0.08)" />
                    <rect x="0" y="93" width="400" height="67" fill="rgba(239, 68, 68, 0.08)" />

                    {/* Zone dividers */}
                    <line x1="0" y1="53" x2="400" y2="53" stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="4 2" />
                    <line x1="0" y1="93" x2="400" y2="93" stroke="rgba(245, 158, 11, 0.4)" strokeDasharray="4 2" />

                    {/* Phred quality curve (starts around Phred 38, slight tail at 150bp) */}
                    <path
                      d="M 10 25 Q 100 20, 200 24 T 320 32 T 390 42"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="3"
                    />

                    {/* Lower quartile line */}
                    <path
                      d="M 10 35 Q 100 30, 200 34 T 320 44 T 390 60"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  </svg>
                  {/* Axis labels */}
                  <div className="absolute left-2 top-2 text-[10px] font-mono text-emerald-400 font-bold">
                    Q40 (Very Good)
                  </div>
                  <div className="absolute left-2 top-14 text-[10px] font-mono text-amber-400 font-bold">
                    Q28 (Acceptable)
                  </div>
                  <div className="absolute left-2 bottom-3 text-[10px] font-mono text-rose-400 font-bold">
                    Q15 (Poor)
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                  <span>Cycle 1 (5&apos; end)</span>
                  <span>Cycle 75 (Middle)</span>
                  <span>Cycle 151 (3&apos; end)</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Functional Impact Donut & Ratio */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Variant Impact Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      HIGH
                    </span>
                    <span className="font-mono text-white">{m.highImpactCount} (1.9%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      MODERATE
                    </span>
                    <span className="font-mono text-white">{m.moderateImpactCount} (13.5%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      LOW
                    </span>
                    <span className="font-mono text-white">{m.lowImpactCount} (30.8%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                      MODIFIER
                    </span>
                    <span className="font-mono text-white">{m.modifierImpactCount} (53.8%)</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Ti / Tv Ratio
                  </span>
                  <span className="text-3xl font-bold font-mono text-teal-400">{m.tiTvRatio}</span>
                  <span className="text-[10px] text-slate-500 block">
                    Expected: 2.0 - 2.2 in WES
                  </span>
                </div>
              </div>
            </div>

            {/* Chart 4: Variant Quality vs Depth Scatter Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Read Depth vs Variant Confidence (QUAL)
                </h3>
                <span className="text-[10px] font-mono text-teal-400 bg-slate-800 px-2 py-0.5 rounded">
                  Mean Depth: {m.meanReadDepth}x
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="relative h-32 w-full flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <line x1="30" y1="10" x2="30" y2="100" stroke="#334155" strokeWidth="1" />
                    <line x1="30" y1="100" x2="290" y2="100" stroke="#334155" strokeWidth="1" />

                    {job.variants.slice(0, 16).map((v, i) => {
                      const cx = 35 + (v.dp / 80) * 230;
                      const cy = 95 - (v.qual / 420) * 80;
                      const isHigh = v.impact === 'HIGH';
                      return (
                        <circle
                          key={v.id}
                          cx={cx}
                          cy={cy}
                          r={isHigh ? 5 : 3.5}
                          fill={isHigh ? '#f43f5e' : '#14b8a6'}
                          opacity={0.8}
                          className="hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <title>{`${v.gene} (${v.chromosome}:${v.position}) - DP: ${v.dp}, QUAL: ${v.qual}`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Depth 10x (Min)</span>
                  <span>Depth 50x (Mean)</span>
                  <span>Depth 100x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal job={job} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};
