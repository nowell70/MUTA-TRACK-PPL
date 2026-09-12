import React from 'react';
import { Dna, LogOut, CheckCircle2, UserCheck, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogoutClick = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-colors">
      {/* Top Application Bar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 px-6 py-3.5 flex items-center justify-between backdrop-blur-xs sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600/10 dark:bg-teal-500/20 border border-teal-600/20 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400">
            <Dna className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">MutaTrack</span>
            <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Integrated Variant Calling Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-xs"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* User Info Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-medium text-slate-700 dark:text-slate-200">{user?.email || 'demo@mutatrack.id'}</span>
            <span className="text-[10px] font-mono uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded">
              {user?.role || 'Pengguna Analisis'}
            </span>
          </div>

          {/* Functional Logout Button */}
          <button
            type="button"
            id="dashboard-logout-button"
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/80 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Center Content: Dashboard Placeholder */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              MutaTrack Dashboard
            </h1>
            <p className="text-base font-medium text-teal-700 dark:text-teal-400">
              Login successful.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Welcome to MutaTrack.
            </p>
          </div>

          {/* User Session Metadata Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-left text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Sesi Terautentikasi (UC-01)</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                AKTIF
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Akun:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{user?.email || 'demo@mutatrack.id'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Aktor:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{user?.role || 'Pengguna Analisis'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Platform:</span>
              <span className="text-slate-800 dark:text-slate-200">MutaTrack v1.0</span>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 py-3 px-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        MutaTrack • Integrated Variant Calling Platform — UC-01 Login
      </footer>
    </div>
  );
};
