import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Dna,
  Database,
  ArrowRight,
  Info,
  Sparkles,
  Trash2,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import {
  AnalysisJob,
  AnalysisParameters,
  FastqFileSummary,
  ReferenceGenome,
  AnnotationDatabase,
  ValidationItem,
  User,
} from '../../types';
import { DEFAULT_PARAMETERS, DEMO_PRESET_SAMPLES, INITIAL_PIPELINE_STAGES } from '../../data/mockData';

interface NewAnalysisFormProps {
  existingAnalyses?: AnalysisJob[];
  onStartAnalysis: (newJob: AnalysisJob) => void;
  onCancel: () => void;
  currentUser?: User | null;
}

export const NewAnalysisForm: React.FC<NewAnalysisFormProps> = ({
  existingAnalyses = [],
  onStartAnalysis,
  onCancel,
  currentUser,
}) => {
  // 1. Project & Sample Information State
  const [projectName, setProjectName] = useState('Exome-Variant-Study');
  const [sampleId, setSampleId] = useState('SAMPLE-004');
  const [organism, setOrganism] = useState('Homo sapiens');
  const [description, setDescription] = useState('Targeted exome sequencing for germline and somatic variant identification.');

  // 2. FASTQ Files State
  const [fastqR1, setFastqR1] = useState<FastqFileSummary | null>(null);
  const [fastqR2, setFastqR2] = useState<FastqFileSummary | null>(null);
  const [dragActiveR1, setDragActiveR1] = useState(false);
  const [dragActiveR2, setDragActiveR2] = useState(false);

  // 3. Reference Genome State
  const [referenceGenome, setReferenceGenome] = useState<ReferenceGenome>('GRCh38');
  const [customRefName, setCustomRefName] = useState('');
  const [customRefFile, setCustomRefFile] = useState<File | null>(null);
  const [dragActiveRef, setDragActiveRef] = useState(false);

  // 4. Annotation Database State
  const [annotationDb, setAnnotationDb] = useState<AnnotationDatabase>('Ensembl');
  const [customDbName, setCustomDbName] = useState('');
  const [customDbFile, setCustomDbFile] = useState<File | null>(null);
  const [dragActiveDb, setDragActiveDb] = useState(false);

  // 5. Analysis Parameters State (Focused 4 Core Parameters)
  const [minMappingQuality, setMinMappingQuality] = useState<number>(20);
  const [minBaseQuality, setMinBaseQuality] = useState<number>(20);
  const [minReadDepth, setMinReadDepth] = useState<number>(10);
  const [variantQualityThreshold, setVariantQualityThreshold] = useState<number>(30);

  // Advanced toggles
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [markDuplicates, setMarkDuplicates] = useState(true);
  const [applyBqsr, setApplyBqsr] = useState(true);

  // Helper: check valid FASTQ extension
  const isValidFastq = (filename: string): boolean => {
    const lower = filename.toLowerCase();
    return (
      lower.endsWith('.fastq') ||
      lower.endsWith('.fastq.gz') ||
      lower.endsWith('.fq') ||
      lower.endsWith('.fq.gz')
    );
  };

  const handleFileUpload = (file: File, target: 'R1' | 'R2') => {
    const valid = isValidFastq(file.name);
    const summary: FastqFileSummary = {
      name: file.name,
      sizeBytes: file.size,
      sizeFormatted: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      estimatedReads: file.size > 0 ? Math.round(file.size / 150) : 0,
      status: valid ? 'valid' : 'invalid',
      errorMessage: !valid
        ? 'Invalid file extension. Must be .fastq, .fastq.gz, .fq, or .fq.gz'
        : file.size === 0
        ? 'File is empty (0 bytes).'
        : undefined,
    };

    if (target === 'R1') {
      setFastqR1(summary);
    } else {
      setFastqR2(summary);
    }
  };

  const handleRemoveFile = (target: 'R1' | 'R2') => {
    if (target === 'R1') {
      setFastqR1(null);
    } else {
      setFastqR2(null);
    }
  };

  // Preset sample loader
  const handleLoadPreset = (index: number) => {
    const preset = DEMO_PRESET_SAMPLES[index];
    if (!preset) return;

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

  // Validation Matrix
  const validationItems = useMemo<ValidationItem[]>(() => {
    const items: ValidationItem[] = [];

    // FASTQ R1 Check
    if (!fastqR1) {
      items.push({
        id: 'r1_missing',
        label: 'FASTQ R1 file presence',
        valid: false,
        critical: true,
        message: 'FASTQ R1 is required.',
      });
    } else if (fastqR1.status !== 'valid') {
      items.push({
        id: 'r1_invalid',
        label: 'FASTQ R1 file format',
        valid: false,
        critical: true,
        message: fastqR1.errorMessage || 'Invalid FASTQ R1 file.',
      });
    } else {
      items.push({
        id: 'r1_ok',
        label: `FASTQ R1 ready: ${fastqR1.name}`,
        valid: true,
        critical: false,
      });
    }

    // FASTQ R2 Check
    if (!fastqR2) {
      items.push({
        id: 'r2_missing',
        label: 'FASTQ R2 file presence',
        valid: false,
        critical: true,
        message: 'FASTQ R2 is required.',
      });
    } else if (fastqR2.status !== 'valid') {
      items.push({
        id: 'r2_invalid',
        label: 'FASTQ R2 file format',
        valid: false,
        critical: true,
        message: fastqR2.errorMessage || 'Invalid FASTQ R2 file.',
      });
    } else {
      items.push({
        id: 'r2_ok',
        label: `FASTQ R2 ready: ${fastqR2.name}`,
        valid: true,
        critical: false,
      });
    }

    // Sample ID Check
    const trimmedSampleId = sampleId.trim();
    if (!trimmedSampleId) {
      items.push({
        id: 'sample_missing',
        label: 'Sample ID specification',
        valid: false,
        critical: true,
        message: 'Sample ID is required.',
      });
    } else {
      // Check duplicate Sample ID
      const duplicate = existingAnalyses.some(
        (job) => job.sampleId.toLowerCase() === trimmedSampleId.toLowerCase()
      );
      if (duplicate) {
        items.push({
          id: 'sample_duplicate',
          label: 'Sample ID uniqueness',
          valid: false,
          critical: true,
          message: 'Sample ID already exists. Please choose a unique Sample ID.',
        });
      } else {
        items.push({
          id: 'sample_ok',
          label: `Sample ID unique: ${trimmedSampleId}`,
          valid: true,
          critical: false,
        });
      }
    }

    // Project Name Check
    if (!projectName.trim()) {
      items.push({
        id: 'project_missing',
        label: 'Project Name specification',
        valid: false,
        critical: true,
        message: 'Project Name is required.',
      });
    } else {
      items.push({
        id: 'project_ok',
        label: `Project Name: ${projectName.trim()}`,
        valid: true,
        critical: false,
      });
    }

    // Reference Genome Check
    if (!referenceGenome) {
      items.push({
        id: 'ref_missing',
        label: 'Reference genome selection',
        valid: false,
        critical: true,
        message: 'Reference genome is required.',
      });
    } else if (referenceGenome === 'Custom Reference' && !customRefName.trim() && !customRefFile) {
      items.push({
        id: 'ref_custom_missing',
        label: 'Custom Reference FASTA',
        valid: false,
        critical: true,
        message: 'Custom Reference FASTA file or name is required.',
      });
    } else {
      items.push({
        id: 'ref_ok',
        label: `Reference genome: ${referenceGenome === 'Custom Reference' ? customRefName || customRefFile?.name : referenceGenome}`,
        valid: true,
        critical: false,
      });
    }

    // Annotation Database Check
    if (!annotationDb) {
      items.push({
        id: 'db_missing',
        label: 'Annotation database selection',
        valid: false,
        critical: true,
        message: 'Annotation database is required.',
      });
    } else if (annotationDb === 'Custom Database' && !customDbName.trim() && !customDbFile) {
      items.push({
        id: 'db_custom_missing',
        label: 'Custom Database file',
        valid: false,
        critical: true,
        message: 'Custom Database file or name is required.',
      });
    } else {
      items.push({
        id: 'db_ok',
        label: `Annotation database: ${annotationDb === 'Custom Database' ? customDbName || customDbFile?.name : annotationDb}`,
        valid: true,
        critical: false,
      });
    }

    // Parameters Validation
    if (minReadDepth <= 0) {
      items.push({
        id: 'param_depth',
        label: 'Minimum Read Depth validation',
        valid: false,
        critical: true,
        message: 'Minimum read depth must be greater than 0.',
      });
    }

    if (minMappingQuality < 0 || minMappingQuality > 60) {
      items.push({
        id: 'param_mapq',
        label: 'Minimum Mapping Quality validation',
        valid: false,
        critical: true,
        message: 'Minimum mapping quality must be between 0 and 60.',
      });
    }

    if (minBaseQuality < 0 || minBaseQuality > 40) {
      items.push({
        id: 'param_baseq',
        label: 'Minimum Base Quality validation',
        valid: false,
        critical: true,
        message: 'Minimum base quality must be between 0 and 40.',
      });
    }

    if (variantQualityThreshold < 10 || variantQualityThreshold > 100) {
      items.push({
        id: 'param_qual',
        label: 'Variant Quality Threshold validation',
        valid: false,
        critical: true,
        message: 'Variant quality threshold must be between 10 and 100.',
      });
    }

    const hasParamError = minReadDepth <= 0 || minMappingQuality < 0 || minMappingQuality > 60 || minBaseQuality < 0 || minBaseQuality > 40 || variantQualityThreshold < 10 || variantQualityThreshold > 100;
    if (!hasParamError) {
      items.push({
        id: 'params_ok',
        label: 'Analysis parameters valid',
        valid: true,
        critical: false,
      });
    }

    return items;
  }, [
    fastqR1,
    fastqR2,
    sampleId,
    projectName,
    existingAnalyses,
    referenceGenome,
    customRefName,
    customRefFile,
    annotationDb,
    customDbName,
    customDbFile,
    minReadDepth,
    minMappingQuality,
    minBaseQuality,
    variantQualityThreshold,
  ]);

  const hasCriticalErrors = validationItems.some((item) => !item.valid);
  const errorMessages = validationItems.filter((item) => !item.valid).map((item) => item.message || item.label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasCriticalErrors) return;

    // Generate unique sequential Analysis ID (MUT-2026-XXX)
    const nextNum = existingAnalyses.length + 1;
    const analysisId = `MUT-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const assembledParams: AnalysisParameters = {
      ...DEFAULT_PARAMETERS,
      minMappingQuality,
      minDepth: minReadDepth,
      variantQualityThreshold,
      markDuplicates,
      applyBqsr,
      pairedEnd: true,
    };

    // Construct the new analysis record with status 'Pending'
    const newJob: AnalysisJob = {
      id: analysisId,
      sampleId: sampleId.trim(),
      projectName: projectName.trim(),
      organism: organism.trim() || 'Homo sapiens',
      description: description.trim(),
      referenceGenome,
      customReferenceName: referenceGenome === 'Custom Reference' ? customRefName.trim() || customRefFile?.name : undefined,
      annotationDb,
      customDbName: annotationDb === 'Custom Database' ? customDbName.trim() || customDbFile?.name : undefined,
      fastqR1,
      fastqR2,
      parameters: assembledParams,
      status: 'Pending',
      createdAt: timestamp,
      stages: INITIAL_PIPELINE_STAGES.map((st, idx) => ({
        ...st,
        status: idx === 0 ? 'running' : 'pending',
        progress: idx === 0 ? 5 : 0,
        startedAt: idx === 0 ? timestamp.slice(11, 16) : undefined,
      })),
      logs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: timestamp.slice(11, 19),
          level: 'INFO',
          stage: 'Queue',
          message: `Analysis Job Created: ${analysisId} for sample "${sampleId.trim()}". Status initialized as Pending.`,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: timestamp.slice(11, 19),
          level: 'SUCCESS',
          stage: 'Input Validation',
          message: `Pre-execution validation successful: Forward R1 (${fastqR1?.name}), Reverse R2 (${fastqR2?.name}), Reference (${referenceGenome}).`,
        },
      ],
      metrics: {
        readCount: fastqR1?.estimatedReads ? fastqR1.estimatedReads * 2 : 12000000,
        q30ScorePct: 94.8,
        gcContentPct: 45.8,
        meanSequenceLength: 151,
        readsBeforeTrim: fastqR1?.estimatedReads ? fastqR1.estimatedReads * 2 : 12000000,
        readsAfterTrim: 0,
        readsRemoved: 0,
        trimPercentage: 0,
        totalReads: 0,
        mappedReads: 0,
        unmappedReads: 0,
        mappingPercentage: 0,
        meanInsertSize: 320,
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
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              New Analysis Setup
            </h1>
            <span className="text-[11px] font-mono bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
              GATK Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure sample metadata, upload paired-end FASTQ reads, and calibrate filtering parameters.
          </p>
        </div>

        {/* Quick Demo Dataset Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Preset:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset(0)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Load standard NA12878 GIAB paired-end dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>NA12878 GIAB</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(1)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Load Hereditary BRCA Oncogenetic panel"
          >
            <Dna className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>BRCA Panel</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Project & Sample Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Project & Sample Information
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Identifiers for downstream tracking, logging, and variant reporting.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. OncoSeq-PanCancer"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Sample ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sample ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                placeholder="e.g. SAMPLE-004"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Organism */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organism
              </label>
              <input
                type="text"
                value={organism}
                onChange={(e) => setOrganism(e.target.value)}
                placeholder="Homo sapiens"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 italic placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Study Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Experimental cohort, sequencing platform (e.g. Illumina NovaSeq 6000), target capture kit details..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        {/* SECTION 2: FASTQ Input (Paired-End) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  FASTQ Sequencing Input (Paired-End Reads)
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload raw forward (R1) and reverse (R2) sequencing reads.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Accepted: .fastq, .fastq.gz, .fq, .fq.gz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FASTQ R1 Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  FASTQ R1 (Forward Reads) <span className="text-rose-500">*</span>
                </span>
                {fastqR1 && fastqR1.status === 'valid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" />
                    <span>✓ Ready</span>
                  </span>
                )}
              </div>

              {!fastqR1 ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                    dragActiveR1
                      ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-teal-500/70 bg-white dark:bg-slate-900'
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
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Drag & drop forward read file here, or{' '}
                    <label className="text-teal-700 dark:text-teal-400 underline cursor-pointer">
                      browse
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
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Supports standard Illumina paired-end R1</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                        {fastqR1.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {fastqR1.sizeFormatted} • ~{fastqR1.estimatedReads?.toLocaleString()} reads
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium transition-colors cursor-pointer">
                        Replace
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
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('R1')}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {fastqR1.status === 'valid' ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>✓ Ready for alignment</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fastqR1.errorMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FASTQ R2 Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  FASTQ R2 (Reverse Reads) <span className="text-rose-500">*</span>
                </span>
                {fastqR2 && fastqR2.status === 'valid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" />
                    <span>✓ Ready</span>
                  </span>
                )}
              </div>

              {!fastqR2 ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                    dragActiveR2
                      ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-teal-500/70 bg-white dark:bg-slate-900'
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
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Drag & drop reverse read file here, or{' '}
                    <label className="text-teal-700 dark:text-teal-400 underline cursor-pointer">
                      browse
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
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Supports standard Illumina paired-end R2</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                        {fastqR2.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {fastqR2.sizeFormatted} • ~{fastqR2.estimatedReads?.toLocaleString()} reads
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium transition-colors cursor-pointer">
                        Replace
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
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('R2')}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {fastqR2.status === 'valid' ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>✓ Ready for alignment</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fastqR2.errorMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Reference Genome & Annotation Database */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Genome */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reference Genome
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select or upload FASTA assembly for BWA-MEM alignment.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(['GRCh38', 'GRCh37', 'Custom Reference'] as ReferenceGenome[]).map((ref) => (
                <label
                  key={ref}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    referenceGenome === ref
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
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
                    <span className="text-xs font-semibold font-mono">{ref}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {ref === 'GRCh38' ? 'hg38 (Recommended)' : ref === 'GRCh37' ? 'hg19 legacy' : 'User FASTA'}
                  </span>
                </label>
              ))}

              {/* Custom Reference Upload Option */}
              {referenceGenome === 'Custom Reference' && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Reference Name / Label <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customRefName}
                      onChange={(e) => setCustomRefName(e.target.value)}
                      placeholder="e.g. T2T-CHM13-v2.0"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Upload Reference FASTA (.fa, .fasta)
                    </label>
                    {!customRefFile ? (
                      <div
                        className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors cursor-pointer ${
                          dragActiveRef
                            ? 'border-teal-500 bg-teal-50/30'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActiveRef(true);
                        }}
                        onDragLeave={() => setDragActiveRef(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActiveRef(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            setCustomRefFile(e.dataTransfer.files[0]);
                          }
                        }}
                      >
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Drag & drop reference FASTA here, or{' '}
                          <label className="text-teal-700 dark:text-teal-400 underline cursor-pointer">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept=".fa,.fasta,.fna"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setCustomRefFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                        <span className="font-mono text-teal-700 dark:text-teal-400 truncate max-w-[200px]">
                          {customRefFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomRefFile(null)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Annotation Database */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Annotation Database
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select SnpEff / ClinVar database for functional consequence mapping.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(['Ensembl', 'RefSeq', 'Custom Database'] as AnnotationDatabase[]).map((db) => (
                <label
                  key={db}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    annotationDb === db
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
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
                    <span className="text-xs font-semibold font-mono">{db}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {db === 'Ensembl' ? 'Release 105 canonical' : db === 'RefSeq' ? 'NCBI 109' : 'ClinVar / VEP'}
                  </span>
                </label>
              ))}

              {/* Custom Database Upload Option */}
              {annotationDb === 'Custom Database' && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Database Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customDbName}
                      onChange={(e) => setCustomDbName(e.target.value)}
                      placeholder="e.g. ClinVar_2024_GRCh38"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Upload Database File (.gtf, .gff, .vcf)
                    </label>
                    {!customDbFile ? (
                      <div
                        className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors cursor-pointer ${
                          dragActiveDb
                            ? 'border-teal-500 bg-teal-50/30'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActiveDb(true);
                        }}
                        onDragLeave={() => setDragActiveDb(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActiveDb(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            setCustomDbFile(e.dataTransfer.files[0]);
                          }
                        }}
                      >
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Drag & drop GTF/GFF/VCF here, or{' '}
                          <label className="text-teal-700 dark:text-teal-400 underline cursor-pointer">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept=".gtf,.gff,.gff3,.vcf,.vcf.gz"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setCustomDbFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                        <span className="font-mono text-teal-700 dark:text-teal-400 truncate max-w-[200px]">
                          {customDbFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomDbFile(null)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: Analysis Parameters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Analysis Parameters
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Core thresholds for alignment quality and variant filtering.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {showAdvancedParams ? 'Hide Advanced Options' : 'Show Advanced Pipeline Options'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Minimum Mapping Quality */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Min Mapping Quality</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{minMappingQuality}</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={minMappingQuality}
                onChange={(e) => setMinMappingQuality(parseInt(e.target.value) || 0)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 20 (MAPQ score)</p>
            </div>

            {/* Minimum Base Quality */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Min Base Quality</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{minBaseQuality}</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={minBaseQuality}
                onChange={(e) => setMinBaseQuality(parseInt(e.target.value) || 0)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 20 (Phred score Q20)</p>
            </div>

            {/* Minimum Read Depth */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Min Read Depth</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{minReadDepth}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={minReadDepth}
                onChange={(e) => setMinReadDepth(parseInt(e.target.value) || 1)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 10 (GATK recommendation)</p>
            </div>

            {/* Variant Quality Threshold */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Variant Quality Threshold</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{variantQualityThreshold}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={variantQualityThreshold}
                onChange={(e) => setVariantQualityThreshold(parseInt(e.target.value) || 30)}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Default: 30 (QUAL threshold)</p>
            </div>
          </div>

          {/* Advanced Pipeline Toggles */}
          {showAdvancedParams && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markDuplicates}
                  onChange={(e) => setMarkDuplicates(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-semibold block">Picard MarkDuplicates</span>
                  <span className="text-[10px] text-slate-500">Flag optical & PCR duplicate reads prior to HaplotypeCaller</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyBqsr}
                  onChange={(e) => setApplyBqsr(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-semibold block">GATK BaseRecalibrator (BQSR)</span>
                  <span className="text-[10px] text-slate-500">Recalibrate base quality scores against known SNP databases</span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* SECTION 5: Input Validation Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Input Validation Status
              </h2>
            </div>
            {!hasCriticalErrors ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Input validation successful.</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Validation errors detected</span>
              </span>
            )}
          </div>

          {/* If there are errors, display clear messages */}
          {hasCriticalErrors ? (
            <div className="space-y-2">
              <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 rounded-xl p-4 text-xs space-y-1.5">
                <p className="font-semibold text-rose-900 dark:text-rose-200">
                  Please resolve the following issues before starting the analysis:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-rose-700 dark:text-rose-300">
                  {errorMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All inputs verified: FASTQ paired files ready, reference genome and annotation database configured, parameters validated. Ready to dispatch job.
              </span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="start-analysis-button"
            type="submit"
            disabled={hasCriticalErrors}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
