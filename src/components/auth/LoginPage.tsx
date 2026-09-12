import React, { useState } from 'react';
import { Dna, ShieldCheck, KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { User } from '../../types';
import { CURRENT_USER } from '../../data/mockData';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('noelbioinfnoel@apps.ipb.ac.id');
  const [password, setPassword] = useState('biomuta2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate empty fields
    if (!identifier.trim()) {
      setError('Please enter your bioinformatics username or institutional email.');
      return;
    }
    if (!password.trim()) {
      setError('Please provide your secure access credentials.');
      return;
    }

    setIsLoading(true);

    // Mock authentication with quick scientific verification
    setTimeout(() => {
      setIsLoading(false);
      // Valid credentials or demo account
      if (
        identifier.toLowerCase().includes('ipb.ac.id') ||
        identifier.toLowerCase().includes('demo') ||
        identifier.toLowerCase() === 'noelbioinfnoel@apps.ipb.ac.id' ||
        identifier.toLowerCase() === 'pengguna'
      ) {
        onLoginSuccess({
          ...CURRENT_USER,
          email: identifier.includes('@') ? identifier : `${identifier}@mutatrack.genomics.org`,
        });
      } else if (password.length >= 4) {
        onLoginSuccess({
          email: identifier,
          name: identifier.split('@')[0],
          role: 'Pengguna Analisis',
          affiliation: 'Genomics Research Center',
        });
      } else {
        setError('Authentication rejected: Invalid laboratory credentials or inactive account.');
      }
    }, 450);
  };

  const handleUseDemo = () => {
    setIdentifier('noelbioinfnoel@apps.ipb.ac.id');
    setPassword('biomuta2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">MutaTrack</span>
              <span className="text-[10px] font-mono uppercase bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                v1.4 • GATK Integrated
              </span>
            </div>
            <p className="text-xs text-slate-400">Integrated Variant Calling Platform (UC-01 Login)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Biomedical Authentication Gateway</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Platform Authentication
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in as <strong className="text-teal-300">Pengguna Analisis</strong> to access input validation, GATK variant calling pipelines, and single-canvas dashboards.
            </p>
          </div>

          {error && (
            <div
              id="login-error-banner"
              className="bg-rose-950/70 border border-rose-800/80 text-rose-300 px-4 py-3 rounded-lg text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Username field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-slate-300"
              >
                Institutional Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. noelbioinfnoel@apps.ipb.ac.id"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-slate-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-slate-500 font-mono">Secured Token</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Control Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account Quick Access */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Predefined Demo Account:</span>
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-teal-400 hover:text-teal-300 font-mono text-[11px] underline cursor-pointer"
              >
                Autofill Credentials
              </button>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Actor:</span>
                <span className="text-teal-300">Pengguna Analisis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-200">noelbioinfnoel@apps.ipb.ac.id</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security:</span>
                <span className="text-slate-400">biomuta2026 (Demo)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-8 py-3 text-center text-xs text-slate-500 font-mono">
        MutaTrack — Integrated Variant Calling Platform • Workflow Reference: Snakemake GATK DNA-seq Pipeline
      </footer>
    </div>
  );
};
