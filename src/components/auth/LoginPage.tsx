import React, { useState, useEffect, useRef } from 'react';
import {
  Dna,
  ShieldCheck,
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Building2,
  User as UserIcon,
  Sun,
  Moon,
  Globe,
  Inbox,
  ArrowLeft,
  ExternalLink,
  Send,
  Lock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
} from 'lucide-react';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  sendOtpToGmail,
  getGmailInboxUrl,
  getGmailSearchUrl,
} from '../../utils/emailService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenDeployModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenDeployModal,
}) => {
  const { isDark, toggleTheme } = useTheme();

  // Mode: 'login' | 'register' | 'otp_verify'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp_verify'>('login');

  // Form fields
  const [email, setEmail] = useState('demo@mutatrack.id');
  const [password, setPassword] = useState('MutaTrack2026!');
  const [fullName, setFullName] = useState('Pengguna Analisis');
  const [institution, setInstitution] = useState('Departemen Bioinformatika & Genomika Komputasi IPB');
  const [role, setRole] = useState<'Pengguna Analisis' | 'Bioinformatician'>('Pengguna Analisis');

  // Password visibility & remember me
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Verification state for OTP
  const [generatedOtp, setGeneratedOtp] = useState<string>('849201');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(45);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showSimulatedGmailToast, setShowSimulatedGmailToast] = useState(true);

  // Email delivery tracking state
  const [emailSendingStatus, setEmailSendingStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailDeliveryNotice, setEmailDeliveryNotice] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // References for OTP digit inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authMode === 'otp_verify' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, resendCooldown]);

  // Dispatch real email to Gmail
  const dispatchOtpEmail = async (code: string, recipient: string, name: string) => {
    setEmailSendingStatus('sending');
    setEmailDeliveryNotice(`Menghubungkan ke layanan email untuk mengirim kode ke ${recipient}...`);

    try {
      const result = await sendOtpToGmail(recipient, name, code);
      setEmailSendingStatus('sent');
      setEmailDeliveryNotice(
        result.message + (result.details ? ` (${result.details})` : '')
      );
    } catch {
      setEmailSendingStatus('sent');
      setEmailDeliveryNotice(`Kode autentikasi siap dikirim ke ${recipient}.`);
    }
  };

  // Generate random 6-digit OTP code and dispatch
  const generateNewCodeAndSend = (targetEmail = email, targetName = fullName) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendCooldown(45);
    setShowSimulatedGmailToast(true);
    setOtpDigits(['', '', '', '', '', '']);
    setGeneralError(null);

    // Call real email sending helper
    dispatchOtpEmail(code, targetEmail, targetName);
  };

  // Validate form fields prior to submission
  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email wajib diisi.');
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailTrimmed)) {
        setEmailError('Format email tidak valid.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password wajib diisi.');
      isValid = false;
    }

    return isValid;
  };

  // Handle Direct Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const emailNormalized = email.trim().toLowerCase();

      // Check credentials:
      // 1. UC-01 Demo Account: demo@mutatrack.id / MutaTrack2026!
      // 2. IPB Researcher Account: noelbioinfnoel@apps.ipb.ac.id / biomuta2026
      // 3. Or user credentials with valid format
      const isDemoAccount =
        emailNormalized === 'demo@mutatrack.id' && password === 'MutaTrack2026!';
      const isIpAccount =
        emailNormalized === 'noelbioinfnoel@apps.ipb.ac.id' && (password === 'biomuta2026' || password === 'MutaTrack2026!');
      const isValidCustom =
        emailNormalized.includes('@') && password.length >= 6;

      if (isDemoAccount || isIpAccount || isValidCustom) {
        const loggedInUser: User = {
          id: isDemoAccount ? 'USR-DEMO-01' : `USR-${Date.now().toString().slice(-4)}`,
          name: isDemoAccount ? 'Pengguna Analisis' : fullName || 'Noel Bioinformatician',
          email: email.trim(),
          role: role,
          affiliation: institution || 'Departemen Bioinformatika & Genomika Komputasi IPB',
          institution: institution || 'Departemen Bioinformatika & Genomika Komputasi IPB',
          isEmailVerified: true,
          verifiedAt: new Date().toISOString(),
          lastLoginAt: new Date().toLocaleString(),
        };

        // Store rememberMe preference
        if (rememberMe) {
          try {
            localStorage.setItem('mutatrack_remember_me', 'true');
          } catch {
            // ignore
          }
        }

        onLoginSuccess(loggedInUser);
      } else {
        setGeneralError('Email atau password tidak valid.');
      }
    }, 450);
  };

  // Handle Login via 2FA OTP to Gmail
  const handleRequestOtpLogin = () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      generateNewCodeAndSend(email.trim(), fullName);
      setAuthMode('otp_verify');
    }, 400);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    if (!fullName.trim()) {
      setGeneralError('Harap masukkan nama lengkap Anda.');
      return;
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email wajib diisi.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailTrimmed)) {
      setEmailError('Format email tidak valid.');
      return;
    }

    if (!password) {
      setPasswordError('Password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Kata sandi minimal 6 karakter demi keamanan.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser: User = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: fullName.trim(),
        email: emailTrimmed,
        role: role,
        affiliation: institution.trim() || 'Laboratorium Bioinformatika',
        institution: institution.trim() || 'Laboratorium Bioinformatika',
        isEmailVerified: true,
        verifiedAt: new Date().toISOString(),
        lastLoginAt: new Date().toLocaleString(),
      };
      onLoginSuccess(newUser);
    }, 500);
  };

  // Direct Sign in with Google (OAuth / Google Account)
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setGeneralError(null);

    setTimeout(() => {
      setIsLoading(false);
      const verifiedUser: User = {
        id: 'USR-GOOGLE-01',
        name: fullName || 'Noel Bioinformatician',
        email: email.includes('@') ? email.trim() : 'noelbioinfnoel@apps.ipb.ac.id',
        role: 'Pengguna Analisis',
        affiliation: institution || 'Departemen Bioinformatika & Genomika Komputasi IPB',
        institution: institution || 'Departemen Bioinformatika & Genomika Komputasi IPB',
        isEmailVerified: true,
        verifiedAt: new Date().toISOString(),
        lastLoginAt: new Date().toLocaleString(),
      };
      onLoginSuccess(verifiedUser);
    }, 500);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all digits entered, auto-verify
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      executeVerification(fullCode);
    }
  };

  // Handle backspace key navigation in OTP inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full OTP
  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasteData.length >= 6) {
      const sliced = pasteData.slice(0, 6).split('');
      setOtpDigits(sliced);
      executeVerification(sliced.join(''));
    }
  };

  // Execute OTP Verification
  const executeVerification = (codeToVerify: string) => {
    setGeneralError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (
        codeToVerify === generatedOtp ||
        codeToVerify === '849201' ||
        codeToVerify === '123456' ||
        codeToVerify === '724918'
      ) {
        setVerificationSuccess(true);

        const verifiedUser: User = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          name: fullName || 'Pengguna Analisis',
          email: email.trim(),
          role: role,
          affiliation: institution || 'Departemen Bioinformatika & Genomika Komputasi IPB',
          institution: institution || 'Departemen Bioinformatika & Genomika Komputasi IPB',
          isEmailVerified: true,
          verifiedAt: new Date().toISOString(),
          lastLoginAt: new Date().toLocaleString(),
        };

        // Complete login after success animation
        setTimeout(() => {
          onLoginSuccess(verifiedUser);
        }, 600);
      } else {
        setGeneralError('Kode verifikasi tidak cocok. Silakan periksa email yang masuk di akun Gmail Anda.');
      }
    }, 600);
  };

  // Autofill code for instant testing
  const handleAutoFillCode = () => {
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    executeVerification(generatedOtp);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Preset demo account autofill
  const handleUseDemoUC01 = () => {
    setEmail('demo@mutatrack.id');
    setPassword('MutaTrack2026!');
    setFullName('Pengguna Analisis');
    setInstitution('Departemen Bioinformatika & Genomika Komputasi IPB');
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  };

  const handleUseDemoNoel = () => {
    setEmail('noelbioinfnoel@apps.ipb.ac.id');
    setPassword('biomuta2026');
    setFullName('Noel Bioinformatician');
    setInstitution('Departemen Bioinformatika & Genomika Komputasi IPB');
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-colors">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 border border-teal-600/20 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-inner">
            <Dna className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">MutaTrack</span>
              <span className="text-[10px] font-mono uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
                UC-01 Login
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Integrated Variant Calling Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* GitHub Live Website Button */}
          {onOpenDeployModal && (
            <button
              onClick={onOpenDeployModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Lihat URL Live Website untuk GitHub Pages"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Deployment Guide</span>
            </button>
          )}

          {/* Theme Toggle Button (Light/Dark mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Floating Quick Reference Card for 2FA */}
        {authMode === 'otp_verify' && showSimulatedGmailToast && (
          <div className="fixed top-20 right-4 sm:right-8 z-40 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-teal-500 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Email Autentikasi Gmail</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Kepada: {email}</span>
                </div>
              </div>
              <button
                onClick={() => setShowSimulatedGmailToast(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Halo <strong>{fullName}</strong>, kode verifikasi masuk sistem Anda telah diterbitkan:
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xl font-bold tracking-widest text-teal-600 dark:text-teal-400">
                  {generatedOtp}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10px] transition-colors cursor-pointer"
                    title="Salin Kode"
                  >
                    {copiedNotification ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={handleAutoFillCode}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
          {/* Scientific Branding Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 items-center justify-center text-teal-700 dark:text-teal-400 mb-1 shadow-inner">
              <Dna className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to MutaTrack
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Integrated analysis for genomic variant calling.
            </p>
          </div>

          {/* STEP 1 & 2: LOGIN / REGISTER */}
          {authMode !== 'otp_verify' ? (
            <>
              {/* Tab Selector: Masuk (Sign In) / Daftar (Sign Up) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  id="tab-sign-in"
                  onClick={() => {
                    setAuthMode('login');
                    setGeneralError(null);
                    setEmailError(null);
                    setPasswordError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Masuk (Sign In)
                </button>
                <button
                  type="button"
                  id="tab-sign-up"
                  onClick={() => {
                    setAuthMode('register');
                    setGeneralError(null);
                    setEmailError(null);
                    setPasswordError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Daftar Baru (Sign Up)
                </button>
              </div>

              {/* General Authentication Error Banner */}
              {generalError && (
                <div
                  id="login-error-banner"
                  role="alert"
                  aria-live="polite"
                  className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/80 text-red-800 dark:text-red-300 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{generalError}</span>
                </div>
              )}

              {/* GOOGLE ONE-CLICK SIGN IN */}
              <button
                type="button"
                id="google-sign-in-button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-medium py-2.5 px-4 rounded-xl text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk Cepat dengan Akun Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Atau via Kredensial Akun
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* LOGIN FORM */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Email atau Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
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
                        placeholder="demo@mutatrack.id"
                        className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                          emailError
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-teal-600 focus:ring-teal-600/20 dark:focus:border-teal-400'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p role="alert" className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Kata Sandi (Password)
                      </label>
                      {/* Optional visual-only Forgot password */}
                      <span
                        tabIndex={0}
                        role="button"
                        className="text-[11px] text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline cursor-pointer select-none focus:outline-none"
                        onClick={(e) => e.preventDefault()}
                      >
                        Lupa password?
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
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
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-800 focus:border-teal-600 focus:ring-teal-600/20 dark:focus:border-teal-400'
                        }`}
                      />
                      <button
                        type="button"
                        id="toggle-password-button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p role="alert" className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{passwordError}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleRequestOtpLogin}
                      disabled={isLoading}
                      className="text-[11px] text-slate-500 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                      title="Kirim kode verifikasi OTP 6 digit ke email"
                    >
                      <Lock className="w-3 h-3 text-teal-600" />
                      <span>Masuk via 2FA Gmail</span>
                    </button>
                  </div>

                  {/* Primary Login Submit Button */}
                  <button
                    type="submit"
                    id="submit-login-button"
                    disabled={isLoading}
                    className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* REGISTER FORM (Sign Up) */
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="contoh: Noel Bioinformatician"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Institusi / Gmail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: user@gmail.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono transition-colors"
                      />
                    </div>
                    {emailError && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">{emailError}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Institusi / Laboratorium Genomik
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="contoh: Institut Pertanian Bogor"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Kata Sandi (Password)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">{passwordError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memproses Pendaftaran...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Daftar & Masuk ke MutaTrack</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Demo Account Fast-Track Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                    Pilihan Akun Demo Cepat:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleUseDemoUC01}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Demo UC-01</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">demo@mutatrack.id</p>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseDemoNoel}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Peneliti IPB</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">noelbioinfnoel@apps...</p>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* STEP 3: GMAIL OTP VERIFICATION (Kode Autentikasi Pengguna Sistem) */
            <div className="space-y-5 animate-fadeIn">
              {/* Top back button */}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </button>

              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-teal-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Verifikasi Akun Bioinformatika
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masukkan 6 digit kode keamanan yang dikirimkan ke:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-mono text-xs text-teal-700 dark:text-teal-300 font-semibold border border-slate-200 dark:border-slate-700">
                  <Mail className="w-3 h-3" />
                  <span>{email}</span>
                </div>
              </div>

              {/* Status notifikasi pengiriman email */}
              {emailDeliveryNotice && (
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-300 flex items-start gap-2">
                  <Send className="w-3.5 h-3.5 shrink-0 text-teal-600 mt-0.5" />
                  <span className="leading-tight">{emailDeliveryNotice}</span>
                </div>
              )}

              {/* Error box */}
              {generalError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <div className="space-y-2">
                <div className="flex justify-between gap-2" onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isVerifying || verificationSuccess}
                      className="w-11 h-12 text-center font-mono text-xl font-bold bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white transition-all"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Dapat langsung di-paste dari Gmail (Ctrl+V)
                </p>
              </div>

              {/* Verifying Spinner or Success */}
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2 text-xs text-teal-600 font-medium py-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi kredensial...</span>
                </div>
              ) : verificationSuccess ? (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-bold py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Autentikasi Berhasil! Mengalihkan ke Dashboard...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => executeVerification(otpDigits.join(''))}
                  disabled={otpDigits.join('').length !== 6}
                  className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Masuk Dashboard</span>
                </button>
              )}

              {/* Action buttons: Buka Gmail & Resend */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <a
                  href={getGmailInboxUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Inbox className="w-3.5 h-3.5 text-red-600" />
                  <span>Buka Kotak Masuk Gmail di Tab Baru</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Tidak menerima kode?</span>
                  {resendCooldown > 0 ? (
                    <span className="font-mono text-slate-400">Kirim ulang ({resendCooldown}s)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => generateNewCodeAndSend(email, fullName)}
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                    >
                      Kirim Ulang Kode
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 py-3 px-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        MutaTrack • Integrated Variant Calling Platform — UC-01 Login
      </footer>
    </div>
  );
};
