import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Dna,
  X,
} from 'lucide-react';
import { Variant, VariantImpact, VariantType } from '../../types';

interface VariantTableProps {
  variants: Variant[];
}

export const VariantTable: React.FC<VariantTableProps> = ({ variants }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState<VariantImpact | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<VariantType | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'position' | 'qual' | 'dp' | 'gene'>('position');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const pageSize = 8;

  // Filter & Search
  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.gene.toLowerCase().includes(q) ||
        v.chromosome.toLowerCase().includes(q) ||
        v.position.toString().includes(q) ||
        v.effect.toLowerCase().includes(q) ||
        (v.clinvar && v.clinvar.toLowerCase().includes(q));

      // Impact
      const matchesImpact = impactFilter === 'ALL' || v.impact === impactFilter;

      // Type
      const matchesType = typeFilter === 'ALL' || v.type === typeFilter;

      return matchesSearch && matchesImpact && matchesType;
    });
  }, [variants, searchQuery, impactFilter, typeFilter]);

  // Sort
  const sortedVariants = useMemo(() => {
    return [...filteredVariants].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'position') {
        comparison = a.position - b.position;
      } else if (sortField === 'qual') {
        comparison = a.qual - b.qual;
      } else if (sortField === 'dp') {
        comparison = a.dp - b.dp;
      } else if (sortField === 'gene') {
        comparison = a.gene.localeCompare(b.gene);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredVariants, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedVariants.length / pageSize));
  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedVariants.slice(start, start + pageSize);
  }, [sortedVariants, currentPage]);

  const handleSort = (field: 'position' | 'qual' | 'dp' | 'gene') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getImpactBadge = (impact: VariantImpact) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-800/80">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800/80">
            MODERATE
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-950/80 text-sky-300 border border-sky-800/80">
            LOW
          </span>
        );
      case 'MODIFIER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            MODIFIER
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtering & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search gene, chr, position, effect, or ClinVar..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Impact Filter Tabs */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(['ALL', 'HIGH', 'MODERATE', 'LOW', 'MODIFIER'] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => {
                  setImpactFilter(imp);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  impactFilter === imp
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {imp}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(['ALL', 'SNP', 'INDEL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                  typeFilter === t
                    ? 'bg-slate-700 text-teal-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3.5">Chr</th>
                <th
                  onClick={() => handleSort('position')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Position</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Ref</th>
                <th className="py-3 px-3.5">Alt</th>
                <th
                  onClick={() => handleSort('qual')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>QUAL</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dp')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>DP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gene')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Gene</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Molecular Effect</th>
                <th className="py-3 px-3.5">Impact</th>
                <th className="py-3 px-3.5">ClinVar</th>
                <th className="py-3 px-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
              {paginatedVariants.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    No variants match the current search query or impact filters.
                  </td>
                </tr>
              ) : (
                paginatedVariants.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 font-bold text-teal-400">
                      {v.chromosome}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      {v.position.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-400">
                      {v.ref}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-amber-300">
                      {v.alt}
                    </td>
                    <td className="py-3 px-3.5 text-teal-300">
                      {v.qual.toFixed(1)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      {v.dp}x
                    </td>
                    <td className="py-3 px-3.5 font-sans font-bold text-white group-hover:text-teal-300">
                      {v.gene}
                    </td>
                    <td className="py-3 px-3.5 font-sans text-slate-300 text-[11px]">
                      {v.effect.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3.5">
                      {getImpactBadge(v.impact)}
                    </td>
                    <td className="py-3 px-3.5 font-sans">
                      {v.clinvar === 'Pathogenic' ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                          Pathogenic
                        </span>
                      ) : v.clinvar === 'Likely Pathogenic' ? (
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                          Likely Path.
                        </span>
                      ) : v.clinvar === 'Benign' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                          Benign
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {v.clinvar || 'VUS'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <span className="text-[11px] text-teal-400 group-hover:underline font-sans">
                        Inspect →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination & Statistics */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{paginatedVariants.length}</strong> of{' '}
            <strong className="text-white">{filteredVariants.length}</strong> filtered variants (
            {variants.length} total detected)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Variant Details Modal Drawer */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Gene: {selectedVariant.gene}</span>
                    {getImpactBadge(selectedVariant.impact)}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedVariant.chromosome}:{selectedVariant.position} ({selectedVariant.ref} → {selectedVariant.alt})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">HGVS Coding:</span>
                  <span className="font-mono text-teal-300 font-medium">{selectedVariant.hgvs_c || 'N/A'}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">HGVS Protein:</span>
                  <span className="font-mono text-amber-300 font-medium">{selectedVariant.hgvs_p || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">Genotype (GT):</span>
                  <span className="font-mono text-white font-bold">{selectedVariant.genotype || '0/1 (Het)'}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">Read Depth (DP):</span>
                  <span className="font-mono text-white">{selectedVariant.dp}x coverage</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">QUAL Confidence:</span>
                  <span className="font-mono text-teal-400">{selectedVariant.qual.toFixed(1)}</span>
                </div>
              </div>

              {/* GATK Filtering Annotations */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-[10px] text-slate-500 uppercase">GATK VariantFiltration Annotations:</div>
                <div className="grid grid-cols-3 gap-2 text-slate-300">
                  <div>QD: <span className="text-teal-300 font-bold">{selectedVariant.qd ?? 12.4}</span></div>
                  <div>FS: <span className="text-teal-300 font-bold">{selectedVariant.fs ?? 1.2}</span></div>
                  <div>MQ: <span className="text-teal-300 font-bold">{selectedVariant.mq ?? 60.0}</span></div>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">ClinVar Clinical Significance:</span>
                  <span className="font-semibold text-white">{selectedVariant.clinvar || 'Not Provided'}</span>
                </div>
                <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
                  Filter: {selectedVariant.filter}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVariant(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
