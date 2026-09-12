import React from 'react';
import { Dna, Shield, Sun, Moon } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-colors">
      {/* Top Bar with Minimal Header & Theme Toggle */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 px-6 py-3.5 flex items-center justify-between backdrop-blur-xs sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600/10 dark:bg-teal-500/20 border border-teal-600/20 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400">
            <Dna className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">MutaTrack</span>
            <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              v1.0 • GATK DNA-seq
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline text-[11px]">Mode Gelap</span>
            </>
          )}
        </button>
      </header>

      {/* Center Scientific Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg dark:shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header & Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 items-center justify-center text-teal-700 dark:text-teal-400 mb-1">
              <Dna className="w-7 h-7" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  MutaTrack
                </h1>
                <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  UC-01
                </span>
              </div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Integrated Variant Calling Platform
              </p>
            </div>

            <div className="pt-2">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Welcome to MutaTrack
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Integrated analysis for genomic variant calling.
              </p>
            </div>
          </div>

          {/* Login Form Component */}
          <LoginForm onSuccess={onLoginSuccess} />

          {/* Trust & Security Footnote */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Sistem Autentikasi Pengguna Analisis Bioinformatika</span>
          </div>
        </div>
      </main>

      {/* Minimal Scientific Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 py-3 px-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        MutaTrack • Integrated Variant Calling Platform — UC-01 Login
      </footer>
    </div>
  );
};
