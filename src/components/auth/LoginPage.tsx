import React, { useState, useEffect } from 'react';
import {
  Dna,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  User as UserIcon,
  Building2,
  Sparkles,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { authenticate, registerAccount, initAuthDatabase } from '../../utils/authService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenDeployModal?: () => void;
  initialMode?: 'login' | 'signup';
  onModeChange?: (mode: 'login' | 'signup') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenDeployModal,
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

  // Password visibility
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

  // Initialize auth database on mount
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

  // Handle Login Submit
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
      // Simulate realistic network delay (300ms)
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
          setGeneralError(result.error || 'Authentication failed. Please try again.');
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
        // Set success message, switch to login view, prefill email, clear password
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

  // Demo Account Quick Fillers
  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setAccountNotFoundNotice(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-600 selection:text-white transition-colors">
      {/* Top Application Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400">
            <Dna className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                MutaTrack
              </span>
              <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                GATK v4.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Integrated Variant Calling Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDeployModal && (
            <button
              onClick={onOpenDeployModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Deployment Guide</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {authMode === 'login' ? 'Sign In to MutaTrack' : 'Create an Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {authMode === 'login'
                ? 'Enter your credentials to access your genomic variant analyses.'
                : 'Register a new researcher account to start running variant calling.'}
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

          {/* General Error Banner */}
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

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                      if (generalError) setGeneralError(null);
                    }}
                    placeholder="e.g. demo@mutatrack.id"
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-600/20'
                    }`}
                  />
                </div>
                {emailError && (
                  <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                      if (generalError) setGeneralError(null);
                    }}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                      passwordError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-600/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Submit Login Button */}
              <button
                type="submit"
                id="login-submit-button"
                disabled={isLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link to Sign Up */}
              <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                <span>Don&apos;t have an account? </span>
                <button
                  type="button"
                  id="link-to-signup"
                  onClick={() => switchMode('signup')}
                  className="font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP / REGISTRATION FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="jane.doe@genomics.org"
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500/20 focus:border-teal-600'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{emailError}</p>
                )}
              </div>

              {/* Institution / Organization (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Institution / Organization <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled={isLoading}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Bioinformatics & Genomics Center"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Minimum 6 characters"
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      passwordError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500/20 focus:border-teal-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError(null);
                    }}
                    placeholder="Re-enter password"
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      confirmPasswordError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500/20 focus:border-teal-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{confirmPasswordError}</p>
                )}
              </div>

              {/* Create Account Submit Button */}
              <button
                type="submit"
                id="signup-submit-button"
                disabled={isLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              {/* Link to Sign In */}
              <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
                <span>Already have an account? </span>
                <button
                  type="button"
                  id="link-to-signin"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Credentials Strip */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Quick Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchMode('login');
                  fillDemoAccount('demo@mutatrack.id', 'MutaTrack2026!');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Account</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">demo@mutatrack.id</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchMode('login');
                  fillDemoAccount('noelbioinfnoel@apps.ipb.ac.id', 'biomuta2026');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Researcher IPB</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">noelbioinfnoel@apps...</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-3 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        MutaTrack — Integrated DNA-Seq Variant Calling Platform • Computational Genomics Lab
      </footer>
    </div>
  );
};
