import { AnalysisJob, LogEntry, StageExecution, Variant, SingleCanvasMetrics } from '../types';
import { MOCK_VARIANTS_SAMPLE_001, MOCK_SINGLE_CANVAS_METRICS } from '../data/mockData';

export const STAGE_DESCRIPTIONS: Record<string, { toolName: string; logs: string[] }> = {
  qc: {
    toolName: 'FastQC v0.12.1',
    logs: [
      'Scanning input FASTQ paired-end archives...',
      'Calculated 14,250,820 read pairs across 151 cycles.',
      'Per-base sequence quality: Median Phred score 37.4 (Q30 = 94.8%).',
      'Per-sequence GC content: 46.2% matching standard mammalian genome distribution.',
      'Adapter contamination: Illumina Universal Adapter detected in 1.9% of fragments.',
      'FastQC summary report generated: PASS (No overrepresented sequences found).',
    ],
  },
  trimming: {
    toolName: 'Cutadapt v4.4 & Trimmomatic',
    logs: [
      'Executing adapter clipping: AGATCGGAAGAGCACACGTCTGAACTCCAGTCA (R1) / AGATCGGAAGAGCGTCGTGTAGGGAAAGAGTGT (R2).',
      'Filtering low-quality trailing bases (Phred < 20) via sliding window (4:20).',
      'Discarding reads shorter than minimum length threshold (36 bp).',
      'Processed 14,250,820 read pairs: 270,710 read pairs trimmed (1.9%).',
      'Surviving read pairs: 13,980,110 (98.1%) written to trimmed FASTQ stream.',
    ],
  },
  alignment: {
    toolName: 'BWA-MEM v0.7.17',
    logs: [
      'Loading reference genome index (BWT / SA / PAC)...',
      'Assigning Read Group: ID:MUT-RUN1 LB:TruSeq PL:ILLUMINA PU:FLOWCELL.LANE1 SM:TARGET',
      'Executing multi-threaded seed-and-extend exact match alignments (threads=8)...',
      'Streaming SAM records to samtools view BAM encoder...',
      'Alignment finished: 13,882,250 / 13,980,110 reads mapped (99.30% mapping rate).',
      'Properly paired reads: 98.42% | Mean insert size: 342.6 bp (sd = 44.1 bp).',
    ],
  },
  bam_proc: {
    toolName: 'Samtools v1.19 & Picard MarkDuplicates & GATK BQSR',
    logs: [
      'Sorting raw alignments by genomic coordinates (chr1..chrM)...',
      'Running Picard MarkDuplicates: Identifying PCR and optical optical cluster duplicates...',
      'Marked 638,583 duplicate reads (4.57% duplication rate).',
      'Building BAI coordinate index file (sorted_dedup.bam.bai)...',
      'GATK BaseRecalibrator: Building empirical error model with known sites (dbSNP / Mills).',
      'GATK ApplyBQSR: Recalibrated base quality scores written to analysis BAM.',
    ],
  },
  var_calling: {
    toolName: 'GATK HaplotypeCaller v4.5.0.0',
    logs: [
      'Initializing GATK HaplotypeCaller in active region mode (--native-pair-hmm-threads 4)...',
      'Traversing genomic intervals: performing local de novo re-assembly on active regions.',
      'Assembling candidate haplotypes via de Bruijn graph algorithm...',
      'Computing PairHMM likelihoods and genotype priors...',
      'Identified 1,412 raw variant candidates: 1,180 SNVs and 232 small InDels.',
      'Raw candidate VCF generated: raw_variants.vcf.gz',
    ],
  },
  filtering: {
    toolName: 'GATK VariantFiltration',
    logs: [
      'Applying GATK hard filters for high-confidence variant discovery:',
      '  - Filter: LowQD (QualByDepth < 2.0)',
      '  - Filter: HighFS (FisherStrand > 60.0 for SNV, > 200.0 for InDel)',
      '  - Filter: LowMQ (RMS Mapping Quality < 40.0)',
      '  - Filter: LowQUAL (Phred-scaled confidence < 30.0)',
      'Variant filtration results: 1,248 passed (88.4%), 164 flagged as low confidence.',
      'High-confidence VCF produced: passed_variants.vcf',
    ],
  },
  annotation: {
    toolName: 'SnpEff v5.2 & ClinVar / Ensembl',
    logs: [
      'Loading gene transcript models (Ensembl Release 105 / RefSeq)...',
      'Annotating genomic variant consequences against canonical transcripts...',
      'Querying ClinVar pathogenic variant catalog and dbSNP rsIDs...',
      'Identified 24 HIGH impact consequences (stop-gained, frameshift, splice donor/acceptor).',
      'Identified 168 MODERATE impact consequences (missense variants).',
      'Found 14 clinically significant pathogenic mutations in onco-driver loci (TP53, BRCA1, EGFR, BRAF).',
      'Functional VCF annotation completed: annotated_variants.vcf',
    ],
  },
  reporting: {
    toolName: 'MultiQC & MutaTrack Engine',
    logs: [
      'Aggregating pipeline metrics across QC, alignment, duplication, and variant statistics...',
      'Constructing Single Canvas unified dashboard matrix...',
      'Generating downloadable clinical/research VCF v4.2 and CSV report tables...',
      'Analysis pipeline completed successfully! All outputs verified.',
    ],
  },
};

export function createGeneratedVariantsForSample(sampleId: string): Variant[] {
  // Return realistic variants tailored to the sample
  return MOCK_VARIANTS_SAMPLE_001.map((v, idx) => ({
    ...v,
    id: `var-${sampleId.toLowerCase()}-${idx + 1}`,
    dp: Math.round(v.dp * (0.85 + Math.random() * 0.3)),
    qual: Math.round(v.qual * (0.9 + Math.random() * 0.2)),
  }));
}

export function createMetricsForSample(sampleId: string): SingleCanvasMetrics {
  return {
    ...MOCK_SINGLE_CANVAS_METRICS,
    readCount: 14250000 + Math.floor(Math.random() * 1000000),
    totalVariants: 1200 + Math.floor(Math.random() * 100),
    highImpactCount: 22 + Math.floor(Math.random() * 6),
  };
}
