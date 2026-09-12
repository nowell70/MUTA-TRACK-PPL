export type UserRole = 'Pengguna Analisis' | 'Bioinformatician' | 'Principal Investigator' | 'Lab Manager';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  affiliation: string;
}

export type ReferenceGenome = 'GRCh38' | 'GRCh37' | 'Custom Reference';
export type AnnotationDatabase = 'Ensembl' | 'RefSeq' | 'Custom Database';
export type AnalysisStatus = 'Pending' | 'Validating' | 'Running' | 'Completed' | 'Failed' | 'Paused';

export interface AnalysisParameters {
  minMappingQuality: number; // default 20 (0-60)
  minBaseQuality: number;    // default 20 (0-40)
  minDepth: number;          // default 10 (1-100)
  variantQualityThreshold: number; // default 30 (10-100)
  variantFilteringThreshold: number; // default 2.0 (e.g. QD >= 2.0)
  pairedEnd: boolean;
  callerMethod: 'GATK HaplotypeCaller' | 'FreeBayes' | 'DeepVariant';
  applyBqsr: boolean;
  markDuplicates: boolean;
}

export type PipelineStageId =
  | 'qc'
  | 'trimming'
  | 'alignment'
  | 'bam_proc'
  | 'var_calling'
  | 'filtering'
  | 'annotation'
  | 'reporting';

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export interface StageExecution {
  id: PipelineStageId;
  name: string;
  tool: string;
  commandSnippet: string;
  status: StageStatus;
  progress: number; // 0 to 100
  startedAt?: string;
  completedAt?: string;
  metrics?: Record<string, string | number>;
  description: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'CMD';
  stage: string;
  message: string;
}

export type VariantImpact = 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER';
export type VariantType = 'SNP' | 'INDEL';

export interface Variant {
  id: string;
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  qual: number;
  dp: number; // read depth
  filter: 'PASS' | 'LowQual' | 'VQSR';
  gene: string;
  effect: string;
  impact: VariantImpact;
  type: VariantType;
  hgvs_c?: string;
  hgvs_p?: string;
  clinvar?: 'Pathogenic' | 'Likely Pathogenic' | 'Uncertain significance' | 'Benign' | 'Not provided';
  af?: number; // allele frequency 0.0 - 1.0
  genotype?: '0/1' | '1/1' | '0/0';
  qd?: number; // QualByDepth
  fs?: number; // FisherStrand
  mq?: number; // MappingQuality
}

export interface SingleCanvasMetrics {
  // FASTQ Quality
  readCount: number;
  q30ScorePct: number;
  gcContentPct: number;
  meanSequenceLength: number;
  // Trimming
  readsBeforeTrim: number;
  readsAfterTrim: number;
  readsRemoved: number;
  trimPercentage: number;
  // Alignment
  totalReads: number;
  mappedReads: number;
  unmappedReads: number;
  mappingPercentage: number;
  meanInsertSize: number;
  // BAM Processing
  sorted: boolean;
  indexed: boolean;
  duplicatePercentage: number;
  meanReadDepth: number;
  coverageBreadth20x: number;
  // Variant Calling
  totalVariants: number;
  snpsCount: number;
  indelsCount: number;
  tiTvRatio: number;
  hetHomRatio: number;
  // Filtering
  variantsBeforeFilter: number;
  variantsAfterFilter: number;
  filterPassPercentage: number;
  // Annotation
  annotatedVariants: number;
  highImpactCount: number;
  moderateImpactCount: number;
  lowImpactCount: number;
  modifierImpactCount: number;
  clinvarPathogenicCount: number;
}

export interface FastqFileSummary {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  estimatedReads?: number;
  status: 'valid' | 'invalid' | 'corrupt';
  errorMessage?: string;
}

export interface AnalysisJob {
  id: string;
  sampleId: string;
  projectName: string;
  organism: string;
  description: string;
  referenceGenome: ReferenceGenome;
  annotationDb: AnnotationDatabase;
  customReferenceName?: string;
  customDbName?: string;
  fastqR1: FastqFileSummary | null;
  fastqR2: FastqFileSummary | null;
  parameters: AnalysisParameters;
  status: AnalysisStatus;
  createdAt: string;
  completedAt?: string;
  stages: StageExecution[];
  logs: LogEntry[];
  metrics: SingleCanvasMetrics;
  variants: Variant[];
  currentStageIndex: number;
  errorMessage?: string;
}

export interface ValidationItem {
  id: string;
  label: string;
  valid: boolean;
  critical: boolean;
  message?: string;
}
