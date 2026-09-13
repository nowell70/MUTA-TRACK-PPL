import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { NewAnalysisForm } from './components/analysis/NewAnalysisForm';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { ResultsView } from './components/results/ResultsView';
import { HistoryView } from './components/history/HistoryView';
import { TraceabilityView } from './components/traceability/TraceabilityView';
import { GmailVerificationModal } from './components/auth/GmailVerificationModal';
import { AnalysisJob, User } from './types';
import { MOCK_ANALYSES } from './data/mockData';
import { initAuthDatabase } from './utils/authService';

const STORAGE_KEY = 'mutatrack_analysis_jobs';
const USER_KEY = 'mutatrack_user';

export default function App() {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedLocal = localStorage.getItem(USER_KEY);
      if (savedLocal) {
        return JSON.parse(savedLocal);
      }
      const savedSession = sessionStorage.getItem(USER_KEY);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch {
      // fallback
    }
    return null;
  });

  // 2. Analyses Repository State (persisted to localStorage)
  const [analyses, setAnalyses] = useState<AnalysisJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return MOCK_ANALYSES;
  });

  // 3. Navigation & Modals State
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string>('MUT-2026-001');
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);

  // Initialize persistent auth database on mount
  useEffect(() => {
    initAuthDatabase();
  }, []);

  // Sync analyses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    } catch (e) {
      console.error('Failed to persist analyses to localStorage', e);
    }
  }, [analyses]);

  // Sync user state to storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Failed to sync user storage', e);
    }
  }, [currentUser]);

  // URL Route Synchronization
  const syncBrowserUrl = useCallback((pageName: string) => {
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
      const targetUrl = `${base}/${pageName}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    } catch {
      // graceful fallback
    }
  }, []);

  // Sync URL on initial mount and route change
  useEffect(() => {
    if (!currentUser) {
      syncBrowserUrl('login');
    } else {
      syncBrowserUrl(currentPage);
    }
  }, [currentUser, currentPage, syncBrowserUrl]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (!currentUser) {
        return;
      }

      if (path.endsWith('/login') || hash.includes('login')) {
        // stay on dashboard if authenticated
        setCurrentPage('dashboard');
      } else if (path.endsWith('/new-analysis') || hash.includes('new-analysis')) {
        setCurrentPage('new-analysis');
      } else if (path.endsWith('/monitoring') || hash.includes('monitoring')) {
        setCurrentPage('monitoring');
      } else if (path.endsWith('/results') || hash.includes('results')) {
        setCurrentPage('results');
      } else if (path.endsWith('/history') || hash.includes('history')) {
        setCurrentPage('history');
      } else if (path.endsWith('/traceability') || hash.includes('traceability')) {
        setCurrentPage('traceability');
      } else {
        setCurrentPage('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [currentUser]);

  // Derive active running job and active result job
  const runningJob = analyses.find((a) => a.status === 'Running');
  const activeJob = analyses.find((a) => a.id === selectedJobId) || analyses[0];
  const activeResultJob =
    analyses.find((a) => a.id === selectedJobId && a.status === 'Completed') ||
    analyses.find((a) => a.status === 'Completed') ||
    analyses[0];

  // Navigation Handler
  const handleNavigate = (page: string, jobId?: string) => {
    if (jobId) {
      setSelectedJobId(jobId);
    }
    setCurrentPage(page);
    syncBrowserUrl(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login / Logout Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
    syncBrowserUrl('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    syncBrowserUrl('login');
  };

  // Start New Analysis Handler (UC-05)
  const handleStartNewAnalysis = (newJob: AnalysisJob) => {
    setAnalyses((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    handleNavigate('monitoring', newJob.id);
  };

  // Update Existing Job (from simulator or pause/resume)
  const handleUpdateJob = (updatedJob: AnalysisJob) => {
    setAnalyses((prev) =>
      prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    );
  };

  // Cancel Job Handler
  const handleCancelJob = (jobId: string) => {
    setAnalyses((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: 'Failed' as const,
              logs: [
                ...job.logs,
                {
                  id: `log-${Date.now()}-cancelled`,
                  timestamp: new Date().toLocaleTimeString(),
                  level: 'WARN' as const,
                  stage: 'Process Control',
                  message: 'Analysis cancelled manually by Pengguna Analisis.',
                },
              ],
            }
          : job
      )
    );
  };

  // Delete Analysis Handler
  const handleDeleteAnalysis = (jobId: string) => {
    setAnalyses((prev) => prev.filter((job) => job.id !== jobId));
    if (selectedJobId === jobId) {
      const remaining = analyses.filter((job) => job.id !== jobId);
      if (remaining.length > 0) {
        setSelectedJobId(remaining[0].id);
      }
    }
  };

  // If user is not logged in, render UC-01 Login & Sign In Page
  if (!currentUser) {
    const isSignupUrl =
      typeof window !== 'undefined' &&
      (window.location.pathname.toLowerCase().endsWith('/signup') ||
        window.location.hash.toLowerCase().includes('signup'));

    return (
      <LoginPage
        onLoginSuccess={handleLogin}
        initialMode={isSignupUrl ? 'signup' : 'login'}
        onModeChange={(mode) => {
          syncBrowserUrl(mode);
        }}
      />
    );
  }

  // Once authenticated, render full MutaTrack Integrated Platform
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        user={currentUser}
        runningJob={runningJob}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentPage={currentPage}
        onOpenVerifyModal={() => setShowVerifyModal(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          analyses={analyses}
          runningJob={runningJob}
          activeResultJob={activeResultJob}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto pb-16">
          {currentPage === 'dashboard' && (
            <DashboardOverview
              analyses={analyses}
              user={currentUser}
              onNavigate={handleNavigate}
              onDeleteAnalysis={handleDeleteAnalysis}
            />
          )}

          {currentPage === 'new-analysis' && (
            <NewAnalysisForm
              existingAnalyses={analyses}
              onStartAnalysis={handleStartNewAnalysis}
              onCancel={() => handleNavigate('dashboard')}
              currentUser={currentUser}
            />
          )}

          {currentPage === 'monitoring' && activeJob && (
            <MonitoringView
              job={activeJob}
              onUpdateJob={handleUpdateJob}
              onViewResults={(jobId) => handleNavigate('results', jobId)}
              onCancelJob={handleCancelJob}
            />
          )}

          {currentPage === 'results' && activeResultJob && (
            <ResultsView
              job={activeResultJob}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'history' && (
            <HistoryView
              analyses={analyses}
              onNavigate={handleNavigate}
              onDeleteAnalysis={handleDeleteAnalysis}
            />
          )}

          {currentPage === 'traceability' && (
            <TraceabilityView />
          )}
        </main>
      </div>

      {/* Gmail Verification Modal */}
      {showVerifyModal && (
        <GmailVerificationModal
          user={currentUser}
          onClose={() => setShowVerifyModal(false)}
          onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}
    </div>
  );
}
