import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Dna,
  Sliders,
  Database,
  Layers,
  ArrowRight,
  Info,
  Sparkles,
  HelpCircle,
  FileCode,
  Check,
} from 'lucide-react';
import {
  AnalysisJob,
  AnalysisParameters,
  FastqFileSummary,
  ReferenceGenome,
  AnnotationDatabase,
  ValidationItem,
} from '../../types';
import { DEFAULT_PARAMETERS, DEMO_PRESET_SAMPLES, INITIAL_PIPELINE_STAGES } from '../../data/mockData';

interface NewAnalysisFormProps {
  existingAnalyses: AnalysisJob[];
  onStartAnalysis: (newJob: AnalysisJob) => void;
  onCancel: () => void;
}

export const NewAnalysisForm: React.FC<NewAnalysisFormProps> = ({
  existingAnalyses,
  onStartAnalysis,
  onCancel,
}) => {
  // Form State
  const [sampleId, setSampleId] = useState('SAMPLE-004');
  const [projectName, setProjectName] = useState('OncoSeq-PanCancer');
  const [organism, setOrganism] = useState('Homo sapiens');
  const [description, setDescription] = useState('Targeted exome panel for pathogenic SNV/InDel detection.');
  const [referenceGenome, setReferenceGenome] = useState<ReferenceGenome>('GRCh38');
  const [customRefName, setCustomRefName] = useState('');
  const [annotationDb, setAnnotationDb] = useState<AnnotationDatabase>('Ensembl');
  const [customDbName, setCustomDbName] = useState('');

  // Files state
  const [fastqR1, setFastqR1] = useState<FastqFileSummary | null>(null);
  const [fastqR2, setFastqR2] = useState<FastqFileSummary | null>(null);
  const [dragActiveR1, setDragActiveR1] = useState(false);
  const [dragActiveR2, setDragActiveR2] = useState(false);

  // Parameters
  const [parameters, setParameters] = useState<AnalysisParameters>(DEFAULT_PARAMETERS);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

  // Helper to test valid FASTQ file extension
  const isValidFastqExtension = (name: string): boolean => {
    const lower = name.toLowerCase();
    return (
      lower.endsWith('.fastq') ||
      lower.endsWith('.fastq.gz') ||
      lower.endsWith('.fq') ||
      lower.endsWith('.fq.gz')
    );
  };

  const handleFileUpload = (
    file: File,
    target: 'R1' | 'R2'
  ) => {
    const validExt = isValidFastqExtension(file.name);
    const summary: FastqFileSummary = {
      name: file.name,
      sizeBytes: file.size,
      sizeFormatted: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      estimatedReads: Math.round(file.size / 150),
      status: validExt ? 'valid' : 'invalid',
      errorMessage: validExt
        ? undefined
        : 'Invalid extension. Must be .fastq, .fastq.gz, .fq, or .fq.gz',
    };

    if (target === 'R1') {
      setFastqR1(summary);
    } else {
      setFastqR2(summary);
    }
  };

  // Load Preset Demo Sample
  const handleLoadPreset = (index: number) => {
    const preset = DEMO_PRESET_SAMPLES[index];
    setSampleId(preset.sampleId);
    setProjectName(preset.projectName);
    setOrganism(preset.organism);
    setDescription(preset.description);
    setReferenceGenome(preset.referenceGenome);
    setAnnotationDb(preset.annotationDb);

    setFastqR1({
      name: preset.r1FileName,
      sizeBytes: preset.r1Size,
      sizeFormatted: (preset.r1Size / (1024 * 1024)).toFixed(1) + ' MB',
      estimatedReads: Math.round(preset.r1Size / 150),
      status: 'valid',
    });

    setFastqR2({
      name: preset.r2FileName,
      sizeBytes: preset.r2Size,
      sizeFormatted: (preset.r2Size / (1024 * 1024)).toFixed(1) + ' MB',
      estimatedReads: Math.round(preset.r2Size / 150),
      status: 'valid',
    });
  };

  // Input Validation Matrix (UC-03)
  const validationItems = useMemo<ValidationItem[]>(() => {
    const items: ValidationItem[] = [];

    // 1. FASTQ R1 Check
    if (!fastqR1) {
      items.push({
        id: 'r1_missing',
        label: 'FASTQ R1 presence',
        valid: false,
        critical: true,
        message: 'FASTQ R1 file is missing. Forward reads are required.',
      });
    } else if (fastqR1.status !== 'valid') {
      items.push({
        id: 'r1_invalid',
        label: 'FASTQ R1 format',
        valid: false,
        critical: true,
        message: fastqR1.errorMessage || 'FASTQ R1 extension is invalid.',
      });
    } else {
      items.push({
        id: 'r1_valid',
        label: `FASTQ R1 valid (${fastqR1.name})`,
        valid: true,
        critical: false,
      });
    }

    // 2. FASTQ R2 Check (Paired-end)
    if (parameters.pairedEnd) {
      if (!fastqR2) {
        items.push({
          id: 'r2_missing',
          label: 'FASTQ R2 presence',
          valid: false,
          critical: true,
          message: 'FASTQ R2 is missing. Paired-end mode requires reverse reads.',
        });
      } else if (fastqR2.status !== 'valid') {
        items.push({
          id: 'r2_invalid',
          label: 'FASTQ R2 format',
          valid: false,
          critical: true,
          message: fastqR2.errorMessage || 'FASTQ R2 extension is invalid.',
        });
      } else {
        items.push({
          id: 'r2_valid',
          label: `FASTQ R2 valid (${fastqR2.name})`,
          valid: true,
          critical: false,
        });
      }
    }

    // 3. Sample ID Empty check
    const trimmedSampleId = sampleId.trim();
    if (!trimmedSampleId) {
      items.push({
        id: 'sample_empty',
        label: 'Sample ID specification',
        valid: false,
        critical: true,
        message: 'Sample ID cannot be empty.',
      });
    } else {
      // 4. Duplicate Sample ID detection within current project
      const duplicateExists = existingAnalyses.some(
        (a) =>
          a.sampleId.toLowerCase() === trimmedSampleId.toLowerCase() &&
          a.projectName.toLowerCase() === projectName.trim().toLowerCase()
      );

      if (duplicateExists) {
        items.push({
          id: 'sample_duplicate',
          label: 'Sample ID uniqueness',
          valid: false,
          critical: true,
          message: `Sample ID "${trimmedSampleId}" already exists within project "${projectName}". Please provide a unique sample identifier.`,
        });
      } else {
        items.push({
          id: 'sample_valid',
          label: `Sample ID unique (${trimmedSampleId})`,
          valid: true,
          critical: false,
        });
      }
    }

    // 5. Reference Genome check
    if (!referenceGenome) {
      items.push({
        id: 'ref_missing',
        label: 'Reference genome',
        valid: false,
        critical: true,
        message: 'Reference genome must be selected.',
      });
    } else if (referenceGenome === 'Custom Reference' && !customRefName.trim()) {
      items.push({
        id: 'ref_custom_empty',
        label: 'Custom reference name',
        valid: false,
        critical: true,
        message: 'Custom FASTA reference designation is required.',
      });
    } else {
      items.push({
        id: 'ref_valid',
        label: `Reference genome selected (${referenceGenome === 'Custom Reference' ? customRefName : referenceGenome})`,
        valid: true,
        critical: false,
      });
    }

    // 6. Annotation Database check
    if (!annotationDb) {
      items.push({
        id: 'db_missing',
        label: 'Annotation database',
        valid: false,
        critical: true,
        message: 'Annotation database must be selected.',
      });
    } else if (annotationDb === 'Custom Database' && !customDbName.trim()) {
      items.push({
        id: 'db_custom_empty',
        label: 'Custom database name',
        valid: false,
        critical: true,
        message: 'Custom annotation database name is required.',
      });
    } else {
      items.push({
        id: 'db_valid',
        label: `Annotation database selected (${annotationDb === 'Custom Database' ? customDbName : annotationDb})`,
        valid: true,
        critical: false,
      });
    }

    // 7. Parameter range validations
    const paramErrors: string[] = [];
    if (parameters.minDepth < 1 || parameters.minDepth > 500) {
      paramErrors.push('Min Depth must be between 1 and 500.');
    }
    if (parameters.variantQualityThreshold < 5 || parameters.variantQualityThreshold > 200) {
      paramErrors.push('Variant QUAL threshold must be between 5 and 200.');
    }
    if (parameters.minMappingQuality < 0 || parameters.minMappingQuality > 60) {
      paramErrors.push('Min Mapping Quality must be between 0 and 60.');
    }

    if (paramErrors.length > 0) {
      items.push({
        id: 'params_invalid',
        label: 'Parameters validation',
        valid: false,
        critical: true,
        message: paramErrors.join(' '),
      });
    } else {
      items.push({
        id: 'params_valid',
        label: 'Parameters valid (GATK Best Practices compliant)',
        valid: true,
        critical: false,
      });
    }

    return items;
  }, [
    fastqR1,
    fastqR2,
    parameters,
    sampleId,
    projectName,
    referenceGenome,
    customRefName,
    annotationDb,
    customDbName,
    existingAnalyses,
  ]);

  const hasCriticalErrors = validationItems.some((item) => !item.valid);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasCriticalErrors) return;

    const newJobId = `MUT-2026-${String(existingAnalyses.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newJob: AnalysisJob = {
      id: newJobId,
      sampleId: sampleId.trim(),
      projectName: projectName.trim(),
      organism: organism.trim(),
      description: description.trim(),
      referenceGenome,
      customReferenceName: customRefName.trim() || undefined,
      annotationDb,
      customDbName: customDbName.trim() || undefined,
      fastqR1,
      fastqR2,
      parameters,
      status: 'Running',
      createdAt: formattedDate,
      stages: INITIAL_PIPELINE_STAGES.map((st, i) => ({
        ...st,
        status: i === 0 ? 'running' : 'pending',
        progress: i === 0 ? 10 : 0,
        startedAt: i === 0 ? formattedDate.slice(11, 16) : undefined,
      })),
      logs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: formattedDate.slice(11, 19),
          level: 'INFO',
          stage: 'Pipeline',
          message: `Analysis ${newJobId} initialized for sample ${sampleId} by Pengguna Analisis`,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: formattedDate.slice(11, 19),
          level: 'SUCCESS',
          stage: 'Validation',
          message: `Input validation completed: FASTQ paired-end verified, reference ${referenceGenome} indexed.`,
        },
        {
          id: `log-${Date.now()}-3`,
          timestamp: formattedDate.slice(11, 19),
          level: 'CMD',
          stage: 'QC',
          message: `fastqc -t 4 -o qc_output/ ${fastqR1?.name} ${fastqR2?.name}`,
        },
      ],
      metrics: {
        readCount: fastqR1?.estimatedReads ? fastqR1.estimatedReads * 2 : 14250000,
        q30ScorePct: 94.6,
        gcContentPct: 46.5,
        meanSequenceLength: 151,
        readsBeforeTrim: fastqR1?.estimatedReads ? fastqR1.estimatedReads * 2 : 14250000,
        readsAfterTrim: 0,
        readsRemoved: 0,
        trimPercentage: 0,
        totalReads: 0,
        mappedReads: 0,
        unmappedReads: 0,
        mappingPercentage: 0,
        meanInsertSize: 340,
        sorted: false,
        indexed: false,
        duplicatePercentage: 0,
        meanReadDepth: 0,
        coverageBreadth20x: 0,
        totalVariants: 0,
        snpsCount: 0,
        indelsCount: 0,
        tiTvRatio: 0,
        hetHomRatio: 0,
        variantsBeforeFilter: 0,
        variantsAfterFilter: 0,
        filterPassPercentage: 0,
        annotatedVariants: 0,
        highImpactCount: 0,
        moderateImpactCount: 0,
        lowImpactCount: 0,
        modifierImpactCount: 0,
        clinvarPathogenicCount: 0,
      },
      variants: [],
      currentStageIndex: 0,
    };

    onStartAnalysis(newJob);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Quick Load Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create New Analysis
            </h1>
            <span className="text-xs font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
              UC-02 / UC-04
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Upload paired FASTQ files, configure GATK variant calling parameters, and perform real-time input validation.
          </p>
        </div>

        {/* Quick Demo Sample Loaders */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick Demo Preset:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset(0)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Load standard NA12878 GIAB paired-end dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>NA12878 Standard</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(1)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Load Hereditary BRCA Oncogenetic panel"
          >
            <Dna className="w-3.5 h-3.5 text-amber-400" />
            <span>BRCA Panel</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleRunAnalysis} className="space-y-8">
        {/* SECTION A: FASTQ Files Upload (Paired End) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <h2 className="text-base font-semibold text-white">
                FASTQ Sequencing Files (Paired-End Illumina)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Accepted: .fastq, .fastq.gz, .fq, .fq.gz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FASTQ R1 Upload */}
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                dragActiveR1
                  ? 'border-teal-400 bg-teal-950/20'
                  : fastqR1 && fastqR1.status === 'valid'
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : fastqR1 && fastqR1.status === 'invalid'
                  ? 'border-rose-500/60 bg-rose-950/10'
                  : 'border-slate-700/80 bg-slate-950/50 hover:border-slate-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActiveR1(true);
              }}
              onDragLeave={() => setDragActiveR1(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActiveR1(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0], 'R1');
                }
              }}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    fastqR1?.status === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-teal-400'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    FASTQ R1 (Forward Reads)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Drag & drop file here or click to browse
                  </p>
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".fastq,.fastq.gz,.fq,.fq.gz"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'R1');
                      }
                    }}
                  />
                  <span className="inline-block mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors">
                    Browse File
                  </span>
                </label>

                {fastqR1 && (
                  <div className="mt-2 w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-left text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-teal-300 truncate max-w-[180px]">
                        {fastqR1.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {fastqR1.sizeFormatted}
                      </span>
                    </div>
                    {fastqR1.status === 'valid' ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid FASTQ format</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-rose-400">
                        <XCircle className="w-3 h-3" />
                        <span>{fastqR1.errorMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* FASTQ R2 Upload */}
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                dragActiveR2
                  ? 'border-teal-400 bg-teal-950/20'
                  : fastqR2 && fastqR2.status === 'valid'
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : fastqR2 && fastqR2.status === 'invalid'
                  ? 'border-rose-500/60 bg-rose-950/10'
                  : 'border-slate-700/80 bg-slate-950/50 hover:border-slate-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActiveR2(true);
              }}
              onDragLeave={() => setDragActiveR2(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActiveR2(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0], 'R2');
                }
              }}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    fastqR2?.status === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-teal-400'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    FASTQ R2 (Reverse Reads)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Drag & drop file here or click to browse
                  </p>
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".fastq,.fastq.gz,.fq,.fq.gz"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'R2');
                      }
                    }}
                  />
                  <span className="inline-block mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors">
                    Browse File
                  </span>
                </label>

                {fastqR2 && (
                  <div className="mt-2 w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-left text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-teal-300 truncate max-w-[180px]">
                        {fastqR2.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {fastqR2.sizeFormatted}
                      </span>
                    </div>
                    {fastqR2.status === 'valid' ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid FASTQ format</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-rose-400">
                        <XCircle className="w-3 h-3" />
                        <span>{fastqR2.errorMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B & C: Reference Genome & Annotation Database */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Genome */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Reference Genome</h2>
                <p className="text-xs text-slate-400">BWA-MEM alignment anchor</p>
              </div>
            </div>

            <div className="space-y-2">
              {(['GRCh38', 'GRCh37', 'Custom Reference'] as ReferenceGenome[]).map((ref) => (
                <label
                  key={ref}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    referenceGenome === ref
                      ? 'bg-teal-950/40 border-teal-500/60 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="referenceGenome"
                      checked={referenceGenome === ref}
                      onChange={() => setReferenceGenome(ref)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-medium font-mono">{ref}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {ref === 'GRCh38' ? 'hg38 (Recommended)' : ref === 'GRCh37' ? 'hg19 legacy' : 'User FASTA'}
                  </span>
                </label>
              ))}

              {referenceGenome === 'Custom Reference' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Reference FASTA Name / URI
                  </label>
                  <input
                    type="text"
                    value={customRefName}
                    onChange={(e) => setCustomRefName(e.target.value)}
                    placeholder="e.g. /references/custom_t2t_chm13.fa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-teal-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Annotation Database */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Annotation Database</h2>
                <p className="text-xs text-slate-400">SnpEff & clinical impact mapping</p>
              </div>
            </div>

            <div className="space-y-2">
              {(['Ensembl', 'RefSeq', 'Custom Database'] as AnnotationDatabase[]).map((db) => (
                <label
                  key={db}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    annotationDb === db
                      ? 'bg-teal-950/40 border-teal-500/60 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="annotationDb"
                      checked={annotationDb === db}
                      onChange={() => setAnnotationDb(db)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-medium font-mono">{db}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {db === 'Ensembl' ? 'Release 105 canonical' : db === 'RefSeq' ? 'NCBI Annotation 109' : 'ClinVar / VEP'}
                  </span>
                </label>
              ))}

              {annotationDb === 'Custom Database' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom SnpEff / VEP Annotation DB Name
                  </label>
                  <input
                    type="text"
                    value={customDbName}
                    onChange={(e) => setCustomDbName(e.target.value)}
                    placeholder="e.g. clinvar_202409_grch38"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-teal-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION D: Sample Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              D
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Sample & Project Information</h2>
              <p className="text-xs text-slate-400">Bioinformatics tracking and metadata traceability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sample ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                placeholder="e.g. SAMPLE-004"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Hereditary-Cancer-Panel"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organism
              </label>
              <input
                type="text"
                value={organism}
                onChange={(e) => setOrganism(e.target.value)}
                placeholder="Homo sapiens"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 italic focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Analysis Description / Study Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Provide experimental notes, sequencing library kit details, or patient cohort references..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-teal-500"
            />
          </div>
        </div>

        {/* SECTION E: Analysis Parameters (UC-04) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                E
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  GATK Analysis Parameters (UC-04)
                </h2>
                <p className="text-xs text-slate-400">
                  Calibrate filtering thresholds and quality cutoffs
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="text-xs text-teal-400 hover:text-teal-300 font-mono underline cursor-pointer"
            >
              {showAdvancedParams ? 'Hide Advanced Options' : 'Show Advanced Pipeline Options'}
            </button>
          </div>

          {/* Primary Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Min Depth */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Minimum Depth (DP)</span>
                <span className="font-mono text-teal-400 font-bold">{parameters.minDepth}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={parameters.minDepth}
                onChange={(e) =>
                  setParameters({ ...parameters, minDepth: parseInt(e.target.value) || 10 })
                }
                className="w-full accent-teal-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 10 (GATK best practice)</p>
            </div>

            {/* Min Variant QUAL */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Min Variant QUAL</span>
                <span className="font-mono text-teal-400 font-bold">{parameters.variantQualityThreshold}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={parameters.variantQualityThreshold}
                onChange={(e) =>
                  setParameters({
                    ...parameters,
                    variantQualityThreshold: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full accent-teal-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 30 (Phred score 99.9% accuracy)</p>
            </div>

            {/* Min Mapping Quality */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Min Mapping Qual (MQ)</span>
                <span className="font-mono text-teal-400 font-bold">{parameters.minMappingQuality}</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={parameters.minMappingQuality}
                onChange={(e) =>
                  setParameters({
                    ...parameters,
                    minMappingQuality: parseInt(e.target.value) || 20,
                  })
                }
                className="w-full accent-teal-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 20 (BWA-MEM MAPQ threshold)</p>
            </div>

            {/* Variant Filtering Threshold */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Filter Threshold (QD)</span>
                <span className="font-mono text-teal-400 font-bold">{parameters.variantFilteringThreshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={parameters.variantFilteringThreshold}
                onChange={(e) =>
                  setParameters({
                    ...parameters,
                    variantFilteringThreshold: parseFloat(e.target.value) || 2.0,
                  })
                }
                className="w-full accent-teal-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: QD &lt; 2.0 flags LowQD</p>
            </div>
          </div>

          {/* Advanced Toggles */}
          {showAdvancedParams && (
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
              <label className="flex items-center gap-2 p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parameters.pairedEnd}
                  onChange={(e) => setParameters({ ...parameters, pairedEnd: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Paired-End Mode (R1 + R2)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parameters.markDuplicates}
                  onChange={(e) => setParameters({ ...parameters, markDuplicates: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Picard MarkDuplicates</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parameters.applyBqsr}
                  onChange={(e) => setParameters({ ...parameters, applyBqsr: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>GATK BaseRecalibrator (BQSR)</span>
              </label>
            </div>
          )}
        </div>

        {/* SECTION 8: INPUT VALIDATION MATRIX (UC-03) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-semibold text-white">
                Pre-Execution Validation Matrix (UC-03)
              </h2>
            </div>
            {hasCriticalErrors ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950 text-rose-300 border border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                Action Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Inputs Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {validationItems.map((val) => (
              <div
                key={val.id}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                  val.valid
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                }`}
              >
                {val.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center gap-1.5">
                    <span>{val.valid ? '✓' : '✕'}</span>
                    <span>{val.label}</span>
                  </div>
                  {val.message && (
                    <p className={`text-[11px] ${val.valid ? 'text-emerald-400/80' : 'text-rose-300'}`}>
                      {val.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasCriticalErrors && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                MutaTrack requires all critical inputs (FASTQ files, reference genome, valid sample ID) to be resolved before dispatching analysis to the computational worker.
              </span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="run-analysis-btn"
            type="submit"
            disabled={hasCriticalErrors}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer"
          >
            <span>Run Analysis (UC-05)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
