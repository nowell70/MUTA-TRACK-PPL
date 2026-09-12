import React, { useState } from 'react';
import {
  Globe,
  GitBranch,
  Copy,
  Check,
  ExternalLink,
  X,
  Code,
  CheckCircle2,
  Terminal,
  AlertTriangle,
  Play,
} from 'lucide-react';

interface GitHubDeployModalProps {
  onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const ghPagesUrl = 'https://nowell70.github.io/MUTA-TRACK-PPL/';
  const repoUrl = 'https://github.com/nowell70/MUTA-TRACK-PPL';

  const gitCommands = `# Jalankan perintah ini di terminal folder proyek Anda:
git add .
git commit -m "feat: setup Vite relative base and GitHub Actions deploy for GitHub Pages"
git push origin main`;

  const badgeMarkdown = `[![Live Demo](https://img.shields.io/badge/Live%20Website-nowell70.github.io%2FMUTA--TRACK--PPL-0d9488?style=for-the-badge&logo=github&logoColor=white)](${ghPagesUrl})`;
  const linkMarkdown = `### 🌐 Live Web Application\n\n**Akses aplikasi secara langsung di browser:**\n👉 [**MutaTrack — Integrated Variant Calling Platform**](${ghPagesUrl})`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Aktivasi Link GitHub Pages MutaTrack</span>
                <span className="text-[10px] font-mono uppercase bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
                  nowell70.github.io
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Panduan membuat website live dan dapat dibuka langsung di link GitHub Pages Anda.
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

        {/* 1. Official Target GitHub Pages Link */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>1. Link Website GitHub Pages Resmi Anda:</span>
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">Target URL</span>
          </label>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5">
            <input
              type="text"
              readOnly
              value={ghPagesUrl}
              className="flex-1 bg-transparent font-mono text-xs text-slate-800 dark:text-teal-300 focus:outline-none select-all font-bold"
            />
            <button
              onClick={() => handleCopy(ghPagesUrl, 'url')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {copiedSection === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'url' ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
            <a
              href={ghPagesUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
              title="Coba Buka Website di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 2. Mengapa Error "Page not found" Terjadi & Solusinya */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl space-y-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mengapa Link Sebelumnya Muncul &ldquo;Page not found&rdquo;?</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
            Link <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">ais-pre-...</code> adalah link share sementara dari studio. Untuk menampilkan antarmuka aplikasi secara permanen pada link <strong>https://nowell70.github.io/MUTA-TRACK-PPL/</strong>, repository Anda cukup mengaktifkan fitur <strong>GitHub Pages via GitHub Actions</strong>.
          </p>
        </div>

        {/* 3. Langkah 2 Menit Mengaktifkan GitHub Pages */}
        <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-300">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>3 Langkah Mudah Agar Website Aktif di nowell70.github.io:</span>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
            <li>
              <strong>Buka Pengaturan Repository:</strong> Kunjungi repository Anda di{' '}
              <a
                href={`${repoUrl}/settings/pages`}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 font-semibold underline inline-flex items-center gap-1"
              >
                <span>github.com/nowell70/MUTA-TRACK-PPL/settings/pages</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <strong>Pilih Sumber Deployment:</strong> Pada bagian <strong>&ldquo;Build and deployment&rdquo;</strong> &gt; <strong>&ldquo;Source&rdquo;</strong>, ubah dropdown menjadi <strong>GitHub Actions</strong>.
            </li>
            <li>
              <strong>Push Kode Terbaru:</strong> File workflow otomatis (<code className="bg-slate-200 dark:bg-slate-800 px-1 rounded font-mono">.github/workflows/deploy.yml</code>) dan konfigurasi base relatif (<code className="bg-slate-200 dark:bg-slate-800 px-1 rounded font-mono">base: './'</code>) sudah kami pasang. Begitu Anda melakukan push ke GitHub, website otomatis ter-build dan langsung tayang dalam 1 menit!
            </li>
          </ol>
        </div>

        {/* 4. Terminal Command Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Perintah Git untuk Push ke Repository:</span>
            </span>
            <button
              onClick={() => handleCopy(gitCommands, 'git')}
              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
            >
              {copiedSection === 'git' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'git' ? 'Tersalin' : 'Salin Perintah'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto select-all border border-slate-800">
            {gitCommands}
          </pre>
        </div>

        {/* 5. Pasang di Header Repository (Bagian About) */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-500" />
            <span>Cara Pasang di Kolom &ldquo;About&rdquo; Header GitHub:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Buka halaman utama repository <strong>nowell70/MUTA-TRACK-PPL</strong>, klik tombol <strong>⚙️ (Edit)</strong> di sebelah kanan judul &ldquo;About&rdquo;, lalu masukkan URL <strong>https://nowell70.github.io/MUTA-TRACK-PPL/</strong> pada kolom Website dan klik Save.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <a
            href={ghPagesUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Buka https://nowell70.github.io/MUTA-TRACK-PPL/</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

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
