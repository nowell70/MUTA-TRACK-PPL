import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, KeyRound, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { validateLoginForm, DEMO_CREDENTIALS } from '../auth/authService';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Interaction & validation states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset previous errors
    setGeneralError(null);
    setFieldErrors({});

    // Client-side validation
    const { isValid, errors } = validateLoginForm({ email, password });
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (response.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setGeneralError(response.error || 'Email atau password tidak valid.');
      }
    } catch (err) {
      console.error('Login process error:', err);
      setGeneralError('Terjadi kesalahan pada sistem. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill demo credentials for quick evaluation
  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setFieldErrors({});
    setGeneralError(null);
  };

  // Clear specific field error when user starts editing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  return (
    <div className="w-full">
      {/* General Authentication Error Banner */}
      {generalError && (
        <div
          id="login-general-error"
          role="alert"
          aria-live="polite"
          className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300 transition-all"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true" />
          <span className="font-medium leading-relaxed">{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email or Username Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Email atau Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={handleEmailChange}
              placeholder="demo@mutatrack.id"
              aria-invalid={!!fieldErrors.email || !!generalError}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 transition-colors ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700 dark:focus:border-teal-400'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
            >
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            {/* Optional visual-only 'Forgot password?' link */}
            <span
              tabIndex={0}
              role="button"
              className="text-[11px] text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline cursor-pointer select-none focus:outline-none focus:underline"
              onClick={(e) => {
                e.preventDefault();
                // Visual element only as requested; do not implement recovery yet
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                }
              }}
            >
              Lupa password?
            </span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••••••"
              aria-invalid={!!fieldErrors.password || !!generalError}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 transition-colors ${
                fieldErrors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-slate-700 dark:focus:border-teal-400'
              }`}
            />
            <button
              type="button"
              id="toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
            >
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Remember me Checkbox */}
        <div className="flex items-center pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:checked:bg-teal-500"
            />
            <span>Remember me</span>
          </label>
        </div>

        {/* Submit Login Button */}
        <button
          type="submit"
          id="login-submit-button"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 py-2.5 px-4 text-xs font-semibold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      {/* Demo Credentials Reference Box for Fast Testing */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-medium text-[11px] uppercase tracking-wider">Demo Account (UC-01):</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer hover:underline"
          >
            <Sparkles className="h-3 w-3" />
            <span>Isi Otomatis</span>
          </button>
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">demo@mutatrack.id</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Password:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">MutaTrack2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
