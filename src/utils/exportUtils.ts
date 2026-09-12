import { AnalysisJob, Variant } from '../types';

/**
 * Generates an authentic VCF v4.2 format file from analysis variants.
 */
export function generateVcfContent(job: AnalysisJob): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const lines: string[] = [
    '##fileformat=VCFv4.2',
    `##fileDate=${dateStr}`,
    '##source=MutaTrack_GATK_Pipeline_v1.4',
    `##reference=${job.referenceGenome}`,
    `##sampleID=${job.sampleId}`,
    `##project=${job.projectName}`,
    '##phasing=none',
    '##FILTER=<ID=PASS,Description="All filters passed">',
    '##FILTER=<ID=LowQual,Description="Low quality variant based on GATK hard thresholds">',
    '##FILTER=<ID=HighFS,Description="FisherStrand strand bias > 60.0">',
    '##INFO=<ID=DP,Number=1,Type=Integer,Description="Approximate read depth; some reads may have been filtered">',
    '##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency, for each ALT allele, in the same order as listed">',
    '##INFO=<ID=QD,Number=1,Type=Float,Description="QualByDepth: variant confidence normalized by depth">',
    '##INFO=<ID=FS,Number=1,Type=Float,Description="Phred-scaled p-value using Fisher\'s exact test to detect strand bias">',
    '##INFO=<ID=MQ,Number=1,Type=Float,Description="RMS Mapping Quality">',
    '##INFO=<ID=ANN,Number=.,Type=String,Description="Functional annotations: \'Allele | Annotation | Annotation_Impact | Gene_Name | Feature_Type | HGVS.c | HGVS.p | ClinVar\'">',
    '##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">',
    '##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allelic depths for the ref and alt alleles in the order listed">',
    '##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Approximate read depth (reads with MQ=255 or with bad mates are filtered)">',
    '##FORMAT=<ID=GQ,Number=1,Type=Integer,Description="Genotype Quality">',
    '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t' + job.sampleId,
  ];

  const variants = job.variants || [];
  for (const v of variants) {
    const ann = `${v.alt}|${v.effect}|${v.impact}|${v.gene}|Transcript|${v.hgvs_c || '.'}|${v.hgvs_p || '.'}|${v.clinvar || '.'}`;
    const info = `DP=${v.dp};AF=${v.af ?? 0.5};QD=${v.qd ?? 12.0};FS=${v.fs ?? 1.5};MQ=${v.mq ?? 60.0};ANN=${ann}`;
    const gt = v.genotype || '0/1';
    const altCount = Math.round(v.dp * (v.af ?? 0.5));
    const refCount = Math.max(0, v.dp - altCount);
    const format = 'GT:AD:DP:GQ';
    const sampleVal = `${gt}:${refCount},${altCount}:${v.dp}:${Math.min(99, Math.round(v.qual / 3))}`;

    lines.push(
      `${v.chromosome}\t${v.position}\t${v.id}\t${v.ref}\t${v.alt}\t${v.qual.toFixed(1)}\t${v.filter}\t${info}\t${format}\t${sampleVal}`
    );
  }

  return lines.join('\n');
}

/**
 * Generates an easy-to-read CSV format for non-bioinformatics and clinical users.
 */
export function generateCsvContent(job: AnalysisJob): string {
  const headers = [
    'Sample_ID',
    'Project',
    'Chromosome',
    'Position',
    'Reference_Base',
    'Alternate_Base',
    'Variant_Type',
    'Quality_Score_Phred',
    'Read_Depth',
    'Filter_Status',
    'Gene_Symbol',
    'Molecular_Effect',
    'Functional_Impact',
    'HGVS_Coding',
    'HGVS_Protein',
    'ClinVar_Significance',
    'Allele_Frequency',
    'Genotype',
  ];

  const rows = (job.variants || []).map((v) => [
    job.sampleId,
    `"${job.projectName}"`,
    v.chromosome,
    v.position,
    v.ref,
    v.alt,
    v.type,
    v.qual.toFixed(1),
    v.dp,
    v.filter,
    v.gene,
    v.effect,
    v.impact,
    `"${v.hgvs_c || ''}"`,
    `"${v.hgvs_p || ''}"`,
    `"${v.clinvar || 'Not evaluated'}"`,
    v.af !== undefined ? v.af.toFixed(3) : '0.500',
    v.genotype || '0/1',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Triggers file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadVcf(job: AnalysisJob): void {
  const content = generateVcfContent(job);
  const filename = `${job.sampleId}_${job.id}_mutatrack.vcf`;
  downloadFile(content, filename, 'text/plain;charset=utf-8');
}

export function downloadCsv(job: AnalysisJob): void {
  const content = generateCsvContent(job);
  const filename = `${job.sampleId}_${job.id}_variants_summary.csv`;
  downloadFile(content, filename, 'text/csv;charset=utf-8');
}
