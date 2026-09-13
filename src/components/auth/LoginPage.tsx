import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { authenticate, registerAccount, initAuthDatabase } from '../../utils/authService';
import { DnaParticleHelix } from './DnaParticleHelix';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
  onModeChange?: (mode: 'login' | 'signup') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  initialMode = 'login',
  onModeChange,
}) => {
  const { isDark, toggleTheme } = useTheme();

  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState<UserRole>('Pengguna Analisis');
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation & Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [accountNotFoundNotice, setAccountNotFoundNotice] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Initialize persistent auth database on mount
  useEffect(() => {
    initAuthDatabase();
  }, []);

  // Sync mode with parent if prop changes
  useEffect(() => {
    if (initialMode && initialMode !== authMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setAuthMode(newMode);
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setAccountNotFoundNotice(false);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  // Handle Login Submit (Strictly preserves authentic validation, rejects invalid/unknown accounts)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setAccountNotFoundNotice(false);
    setSuccessMessage(null);

    const emailTrimmed = email.trim();
    let hasClientError = false;

    if (!emailTrimmed) {
      setEmailError('Email is required.');
      hasClientError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasClientError = true;
    }

    if (hasClientError) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate realistic verification latency (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));
      const result = await authenticate(emailTrimmed, password);

      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        if (result.code === 'ACCOUNT_NOT_FOUND') {
          setGeneralError('Account not found. Please create an account first.');
          setAccountNotFoundNotice(true);
        } else if (result.code === 'INVALID_CREDENTIALS') {
          setGeneralError('Invalid email or password.');
        } else {
          setGeneralError(result.error || 'Authentication failed. Please check your credentials.');
        }
      }
    } catch {
      setIsLoading(false);
      setGeneralError('Unable to connect to the authentication service. Please try again.');
    }
  };

  // Handle Sign Up Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setSuccessMessage(null);

    const nameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();
    let hasClientError = false;

    if (!nameTrimmed) {
      setGeneralError('Full Name is required.');
      hasClientError = true;
    }

    if (!emailTrimmed) {
      setEmailError('Email is required.');
      hasClientError = true;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailTrimmed)) {
        setEmailError('Please enter a valid email address.');
        hasClientError = true;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasClientError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      hasClientError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasClientError = true;
    }

    if (hasClientError) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const result = await registerAccount({
        fullName: nameTrimmed,
        email: emailTrimmed,
        password,
        confirmPassword,
        institution: institution.trim() || undefined,
        role,
      });

      setIsLoading(false);

      if (result.success) {
        setSuccessMessage('Account created successfully. Please log in.');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        switchMode('login');
      } else {
        if (result.code === 'EMAIL_EXISTS') {
          setGeneralError('An account with this email already exists. Please log in.');
        } else {
          setGeneralError(result.error || 'Failed to create account.');
        }
      }
    } catch {
      setIsLoading(false);
      setGeneralError('Failed to create account. Please check your inputs and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Subtle Top Utility Bar */}
      <header className="px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-white">
            MutaTrack
          </span>
          <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
            GATK v4.5
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ================================================== */}
        {/* LEFT SIDE: DNA PARTICLE VISUAL & IDENTITY REGION   */}
        {/* ================================================== */}
        <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-100/60 via-slate-50 to-slate-100/80 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/60">
          <div className="w-full max-w-lg flex flex-col items-center text-center space-y-4">
            {/* Interactive DNA Double Helix Canvas (Red & Blue particles) */}
            <div className="w-full">
              <DnaParticleHelix />
            </div>

            {/* Application Title */}
            <div className="space-y-2 pt-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-widest text-slate-900 dark:text-white uppercase font-sans">
                MUTA TRACK
              </h1>

              {/* Single Concise Description Sentence */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                An integrated platform for streamlined genomic variant calling analysis.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* RIGHT SIDE: FUNCTIONAL AUTHENTICATION FORM        */}
        {/* ================================================== */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
            {/* Form Header */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {authMode === 'login'
                  ? 'Sign in to access your genomic variant analyses and workflow pipelines.'
                  : 'Register a new account to begin running DNA-seq variant calling workflows.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                id="tab-login"
                onClick={() => switchMode('login')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-signup"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Success Banner */}
            {successMessage && (
              <div
                id="auth-success-banner"
                role="status"
                className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Error Banner */}
            {generalError && (
              <div
                id="auth-error-banner"
                role="alert"
                className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 text-rose-800 dark:text-rose-200 px-3.5 py-3 rounded-xl text-xs flex flex-col gap-2 animate-fadeIn"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{generalError}</span>
                </div>

                {accountNotFoundNotice && (
                  <div className="pt-1 pl-6">
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      <span>Create an account now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email / Username */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                        if (generalError) setGeneralError(null);
                      }}
                      placeholder="name@organization.org"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border ${
                        emailError
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-300 dark:border-slate-700 focus:border-teal-600'
                      } rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                        if (generalError) setGeneralError(null);
                      }}
                      placeholder="••••••••••••"
                      className={`w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border ${
                        passwordError
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-300 dark:border-slate-700 focus:border-teal-600'
                      } rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Remember me on this workstation</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="login-submit-button"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800/40 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs hover:shadow-teal-500/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                {/* Switch to Sign Up */}
                <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Don&apos;t have an account? </span>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            )}

            {/* SIGN UP / REGISTRATION FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-teal-600 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="name@organization.org"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border ${
                        emailError
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-300 dark:border-slate-700 focus:border-teal-600'
                      } rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Institution (Optional) */}
                <div>
                  <label
                    htmlFor="signup-institution"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Institution / Department <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-institution"
                      type="text"
                      autoComplete="organization"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Center for Genomic Medicine"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-teal-600 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        placeholder="Min. 6 chars"
                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border ${
                          passwordError
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-300 dark:border-slate-700 focus:border-teal-600'
                        } rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError) setConfirmPasswordError(null);
                        }}
                        placeholder="Re-enter password"
                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border ${
                          confirmPasswordError
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-300 dark:border-slate-700 focus:border-teal-600'
                        } rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  id="signup-submit-button"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800/40 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs hover:shadow-teal-500/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
