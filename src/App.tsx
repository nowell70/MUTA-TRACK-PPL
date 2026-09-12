import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { NewAnalysisForm } from './components/analysis/NewAnalysisForm';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { ResultsView } from './components/results/ResultsView';
import { HistoryView } from './components/history/HistoryView';
import { TraceabilityView } from './components/traceability/TraceabilityView';
import { AnalysisJob, User } from './types';
import { MOCK_ANALYSES } from './data/mockData';

const STORAGE_KEY = 'mutatrack_analysis_jobs';
const USER_KEY = 'mutatrack_user';

export default function App() {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default logged in as Noel Bioinformatician for immediate exploration
    return {
      id: 'USR-001',
      name: 'Noel Bioinformatician',
      email: 'noel.analyst@mutatrack.org',
      role: 'Pengguna Analisis',
      institution: 'Genomic Medicine Institute',
    };
  });

  // 2. Analyses Repository State (persisted to localStorage)
  const [analyses, setAnalyses] = useState<AnalysisJob[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_ANALYSES;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    } catch (e) {
      console.error('Failed to persist analyses to localStorage', e);
    }
  }, [analyses]);

  // Save user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [currentUser]);

  // 3. Navigation State
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string>('MUT-2026-001');

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login / Logout Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Start New Analysis Handler (UC-05)
  const handleStartNewAnalysis = (newJob: AnalysisJob) => {
    setAnalyses((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    setCurrentPage('monitoring');
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

  // Reset to initial mock dataset
  const handleResetDemoData = () => {
    setAnalyses(MOCK_ANALYSES);
    setSelectedJobId('MUT-2026-001');
    setCurrentPage('dashboard');
  };

  // If user is not logged in, show UC-01 Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        user={currentUser}
        runningJob={runningJob}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentPage={currentPage}
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
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'new-analysis' && (
            <NewAnalysisForm
              onStartAnalysis={handleStartNewAnalysis}
              onCancel={() => handleNavigate('dashboard')}
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
    </div>
  );
}
