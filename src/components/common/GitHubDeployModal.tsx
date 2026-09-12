import React, { useState } from 'react';
import {
  Globe,
  GitBranch,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  Layers,
  Code,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface GitHubDeployModalProps {
  onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const sharedAppUrl = 'https://ais-pre-wl6wk4vz3vjx6sfy34ajnl-471576547192.asia-southeast1.run.app';
  const devAppUrl = 'https://ais-dev-wl6wk4vz3vjx6sfy34ajnl-471576547192.asia-southeast1.run.app';

  const badgeMarkdown = `[![Live Demo](https://img.shields.io/badge/Live%20Website-MutaTrack%20Bioinformatics-0d9488?style=for-the-badge&logo=dna&logoColor=white)](${sharedAppUrl})`;
  const linkMarkdown = `### 🌐 Live Web Application\n\n**Akses aplikasi secara langsung di browser:**\n👉 [**MutaTrack — Integrated Variant Calling Platform**](${sharedAppUrl})`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tampilkan di GitHub Berupa Link Website</span>
                <span className="text-[10px] font-mono uppercase bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
                  Live Deployment
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Panduan memasang tautan website live di header & README repository GitHub Anda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Live Website URL Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>1. Link Website Publik (Bisa Diakses Siapa Saja)</span>
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">Production Ready</span>
          </label>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5">
            <input
              type="text"
              readOnly
              value={sharedAppUrl}
              className="flex-1 bg-transparent font-mono text-xs text-slate-800 dark:text-teal-300 focus:outline-none select-all"
            />
            <button
              onClick={() => handleCopy(sharedAppUrl, 'url')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {copiedSection === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'url' ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
            <a
              href={sharedAppUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
              title="Buka website di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 2. Cara pasang di GitHub Repository (About section) */}
        <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-300">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Cara Agar Tampil di Bagian Kanan Atas Repository GitHub (Kolom &ldquo;About&rdquo;):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
            <li>Buka repository GitHub proyek MutaTrack Anda.</li>
            <li>Di sisi kanan atas halaman repository, cari kotak <strong>&ldquo;About&rdquo;</strong> dan klik icon gerigi (<strong>⚙️ Edit</strong>).</li>
            <li>Pada kolom <strong>&ldquo;Website&rdquo;</strong>, tempelkan (paste) link website publik di atas.</li>
            <li>Centang kotak <em>&ldquo;Use your GitHub Pages website&rdquo;</em> (jika menggunakan Pages) atau simpan link langsung.</li>
            <li>Klik tombol hijau <strong>&ldquo;Save changes&rdquo;</strong>. Link website akan langsung muncul dengan ikon bola dunia 🌐 di header GitHub!</li>
          </ol>
        </div>

        {/* 3. Badge & Markdown untuk README.md */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              2. Markdown Badge untuk ditaruh di file README.md GitHub:
            </span>
            <button
              onClick={() => handleCopy(badgeMarkdown, 'badge')}
              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
            >
              {copiedSection === 'badge' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'badge' ? 'Tersalin' : 'Salin Badge'}</span>
            </button>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-300 overflow-x-auto select-all">
            {badgeMarkdown}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              3. Teks Tautan Markdown untuk README.md:
            </span>
            <button
              onClick={() => handleCopy(linkMarkdown, 'link')}
              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
            >
              {copiedSection === 'link' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'link' ? 'Tersalin' : 'Salin Teks Markdown'}</span>
            </button>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
            {linkMarkdown}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            File README.md di proyek ini sudah otomatis memuat link website resmi.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
