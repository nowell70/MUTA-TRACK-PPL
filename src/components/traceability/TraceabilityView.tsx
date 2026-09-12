import React from 'react';
import {
  GitFork,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Terminal,
  Layers,
  Dna,
  ArrowRight,
  Database,
  Cpu,
  BookOpen,
} from 'lucide-react';

export const TraceabilityView: React.FC = () => {
  const useCaseMatrix = [
    {
      id: 'UC-01',
      title: 'User Authentication & Session Access',
      actor: 'Pengguna Analisis (Bioinformatician)',
      module: 'Login / Session Controller',
      status: 'Implemented',
      details: 'Secure session initialization, user badge, bioinformatician analyst persona, and logout.',
    },
    {
      id: 'UC-02',
      title: 'Input File Submission (FASTQ R1 & R2)',
      actor: 'Pengguna Analisis',
      module: 'New Analysis / Drag & Drop Uploader',
      status: 'Implemented',
      details: 'Accepts .fastq, .fq, .fastq.gz paired-end files with sample ID auto-detection and file size verification.',
    },
    {
      id: 'UC-03',
      title: 'Input Validation Matrix',
      actor: 'System / Pre-flight Inspector',
      module: 'Validation Matrix Checklist',
      status: 'Implemented',
      details: 'Checks FASTQ headers (@), base composition (ATCGN), Phred+33 score distribution, file pair symmetry, and reference genome index existence.',
    },
    {
      id: 'UC-04',
      title: 'Parameter Configuration',
      actor: 'Pengguna Analisis',
      module: 'GATK Parameter Sliders & Toggles',
      status: 'Implemented',
      details: 'Min mapping quality (MQ ≥ 30), base quality (BQ ≥ 20), min read depth (DP ≥ 10x), QUAL threshold, annotation db selection (SnpEff/Ensembl/ClinVar).',
    },
    {
      id: 'UC-05',
      title: 'Analysis Execution Engine',
      actor: 'Pengguna Analisis / Execution Daemon',
      module: 'Analysis Trigger & Initializer',
      status: 'Implemented',
      details: 'Dispatches job MUT-YYYY-XXX, creates isolated analysis workspace, generates initial CLI commands for Snakemake.',
    },
    {
      id: 'UC-06',
      title: 'Process Monitoring & Stage Progression',
      actor: 'System / Real-time Terminal',
      module: 'Monitoring View & Process Log',
      status: 'Implemented',
      details: '8 vertical automated stages with active state, progress bars, interactive pause/resume, speed adjustment (1x/3x/Fast-forward), and streaming RFC-5424 log terminal.',
    },
    {
      id: 'UC-07',
      title: 'Results Exploration (Single Canvas)',
      actor: 'Pengguna Analisis',
      module: 'Single Canvas Dashboard & Variant Table',
      status: 'Implemented',
      details: 'Integrated single canvas spanning FASTQ QC, Trimming, Alignment, BAM processing, Variant calling, Filtering, and Annotation + Searchable & filterable variant table with ClinVar insights.',
    },
    {
      id: 'UC-08',
      title: 'Data Export & Clinical Report',
      actor: 'Pengguna Analisis',
      module: 'VCF / CSV / PDF Generators',
      status: 'Implemented',
      details: 'RFC-compliant standard VCF v4.2 download, formatted multi-column Excel CSV, and comprehensive printable clinical genomics summary report.',
    },
  ];

  const snakemakeRules = [
    {
      rule: 'rule fastqc',
      tool: 'FastQC v0.12.1',
      stage: '1. Quality Control',
      input: 'reads/{sample}.1.fastq.gz, reads/{sample}.2.fastq.gz',
      output: 'qc/fastqc/{sample}_1_fastqc.zip',
    },
    {
      rule: 'rule cutadapt',
      tool: 'Cutadapt v4.4',
      stage: '2. Trimming',
      input: 'reads/{sample}.{pair}.fastq.gz',
      output: 'trimmed/{sample}.1.fastq.gz, trimmed/{sample}.2.fastq.gz',
    },
    {
      rule: 'rule bwa_mem',
      tool: 'BWA-MEM v0.7.17',
      stage: '3. Alignment',
      input: 'trimmed/{sample}.1.fastq.gz, reference.fasta',
      output: 'mapped/{sample}.bam',
    },
    {
      rule: 'rule picard_markduplicates',
      tool: 'Picard Tools v3.1.1',
      stage: '4. BAM Processing',
      input: 'mapped/{sample}.sorted.bam',
      output: 'dedup/{sample}.dedup.bam, metrics/{sample}.metrics.txt',
    },
    {
      rule: 'rule gatk_haplotypecaller',
      tool: 'GATK4 HaplotypeCaller',
      stage: '5. Variant Calling',
      input: 'dedup/{sample}.dedup.bam, reference.fasta',
      output: 'called/{sample}.raw.vcf.gz',
    },
    {
      rule: 'rule gatk_variantfiltration',
      tool: 'GATK4 VariantFiltration',
      stage: '6. Filtering',
      input: 'called/{sample}.raw.vcf.gz',
      output: 'filtered/{sample}.filtered.vcf.gz',
    },
    {
      rule: 'rule snpeff_annotate',
      tool: 'SnpEff & ClinVar',
      stage: '7. Annotation',
      input: 'filtered/{sample}.filtered.vcf.gz',
      output: 'annotated/{sample}.annotated.vcf.gz',
    },
    {
      rule: 'rule mutatrack_report',
      tool: 'MutaTrack Engine',
      stage: '8. Report Generation',
      input: 'annotated/{sample}.annotated.vcf.gz, metrics/*',
      output: 'report/single_canvas_{sample}.json',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Workflow & Requirement Traceability Matrix
            </h1>
            <span className="text-xs font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
              UC-01 — UC-08
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Mapping functional user requirements and Snakemake GATK workflow rules into the MutaTrack user experience.
          </p>
        </div>

        <a
          href="https://github.com/snakemake-workflows/dna-seq-gatk-variant-calling"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 font-mono text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Snakemake Workflow Reference</span>
        </a>
      </div>

      {/* Traceability Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold text-white">
            1. Core Requirement Traceability (UC-01 through UC-08)
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Requirement / Feature</th>
                  <th className="py-3 px-4">Target Actor</th>
                  <th className="py-3 px-4">Implementation Module</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {useCaseMatrix.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {item.actor}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {item.module}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {item.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Snakemake Pipeline Specification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold text-white">
            2. Snakemake GATK Pipeline Rule Architecture
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Bioinformatics Tool</th>
                  <th className="py-3 px-4">Snakemake Rule Name</th>
                  <th className="py-3 px-4">Primary Input File</th>
                  <th className="py-3 px-4">Primary Output Artifact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px] text-slate-300">
                {snakemakeRules.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-white">
                      {r.stage}
                    </td>
                    <td className="py-3 px-4 text-teal-300 font-bold">
                      {r.tool}
                    </td>
                    <td className="py-3 px-4 text-amber-300">
                      {r.rule}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                      {r.input}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 truncate max-w-xs">
                      {r.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
