import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Determine initial route from current browser URL / hash
function parseCurrentRoute(): 'login' | 'dashboard' {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (hash.includes('dashboard') || path.endsWith('/dashboard')) {
    return 'dashboard';
  }
  if (hash.includes('login') || path.endsWith('/login')) {
    return 'login';
  }
  // Default to login
  return 'login';
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<'login' | 'dashboard'>(() => parseCurrentRoute());

  // Programmatic navigation synchronized with browser history
  const navigateTo = useCallback((route: 'login' | 'dashboard') => {
    setCurrentRoute(route);

    // Calculate base path for Vite & GitHub Pages compatibility
    const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
    const targetUrl = `${base}/${route}`;

    try {
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    } catch {
      // Gracefully handle iframe restrictions if any
    }
  }, []);

  // Listen to browser navigation events (Back/Forward buttons & hash changes)
  useEffect(() => {
    const handlePopState = () => {
      const detected = parseCurrentRoute();
      setCurrentRoute(detected);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Routing Guard Rules:
  // 1. Unauthenticated trying to access /dashboard -> redirect to /login
  // 2. Authenticated on /login -> redirect to /dashboard
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && currentRoute === 'dashboard') {
      navigateTo('login');
    } else if (isAuthenticated && currentRoute === 'login') {
      navigateTo('dashboard');
    }
  }, [isAuthenticated, isLoading, currentRoute, navigateTo]);

  // Loading indicator during initial credential hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Memuat MutaTrack...</p>
        </div>
      </div>
    );
  }

  // Route Dispatcher
  if (currentRoute === 'dashboard' && isAuthenticated) {
    return (
      <ProtectedRoute fallbackRoute={() => navigateTo('login')}>
        <Dashboard onLogout={() => navigateTo('login')} />
      </ProtectedRoute>
    );
  }

  return <LoginPage onLoginSuccess={() => navigateTo('dashboard')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
