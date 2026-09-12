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
} from 'lucide-react';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  const [email, setEmail] = useState('noelbioinfnoel@apps.ipb.ac.id');
  const [password, setPassword] = useState('biomuta2026');
  const [fullName, setFullName] = useState('Noel Bioinformatician');
  const [institution, setInstitution] = useState('Departemen Bioinformatika & Genomika Komputasi');
  const [role, setRole] = useState<'Pengguna Analisis' | 'Bioinformatician'>('Pengguna Analisis');

  // Verification state
  const [generatedOtp, setGeneratedOtp] = useState<string>('849201');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(45);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showSimulatedGmailToast, setShowSimulatedGmailToast] = useState(true);

  const [error, setError] = useState<string | null>(null);
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

  // Generate random 6-digit OTP code
  const generateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendCooldown(50);
    setShowSimulatedGmailToast(true);
    setOtpDigits(['', '', '', '', '', '']);
    setError(null);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Harap masukkan alamat Gmail / email institusi Anda.');
      return;
    }
    if (!password.trim()) {
      setError('Harap masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication check, then proceed to Gmail 2-Step OTP Verification
    setTimeout(() => {
      setIsLoading(false);
      generateNewCode();
      setAuthMode('otp_verify');
    }, 400);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Harap masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Harap masukkan alamat Gmail yang valid (misal: nama@apps.ipb.ac.id atau nama@gmail.com).');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter demi keamanan akun bioinformatika.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      generateNewCode();
      setAuthMode('otp_verify');
    }, 450);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    // Only accept numeric digit
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
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (codeToVerify === generatedOtp || codeToVerify === '849201' || codeToVerify === '123456') {
        setVerificationSuccess(true);

        const verifiedUser: User = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          name: fullName || 'Noel Bioinformatician',
          email: email.trim(),
          role: role,
          affiliation: institution || 'Genomic Medicine Institute',
          institution: institution || 'Genomic Medicine Institute',
          isEmailVerified: true,
          verifiedAt: new Date().toISOString(),
          lastLoginAt: new Date().toLocaleString(),
        };

        // Complete login after brief success animation
        setTimeout(() => {
          onLoginSuccess(verifiedUser);
        }, 900);
      } else {
        setError('Kode verifikasi salah atau kedaluwarsa. Silakan periksa kembali Gmail Anda.');
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
  const handleUseDemo = () => {
    setEmail('noelbioinfnoel@apps.ipb.ac.id');
    setPassword('biomuta2026');
    setFullName('Noel Bioinformatician');
    setInstitution('Departemen Bioinformatika & Genomika Komputasi IPB');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-colors">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 dark:border-teal-500/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">MutaTrack</span>
              <span className="text-[10px] font-mono uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
                v1.4 • GATK Integrated
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Integrated Variant Calling Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* GitHub Live Website Button */}
          {onOpenDeployModal && (
            <button
              onClick={onOpenDeployModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Lihat URL Live Website untuk GitHub"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Tautan Website GitHub</span>
            </button>
          )}

          {/* Theme Toggle Button (Light/Dark mode) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            title={isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Floating Simulated Gmail Incoming Email Notification */}
        {authMode === 'otp_verify' && showSimulatedGmailToast && (
          <div className="fixed top-20 right-4 sm:right-8 z-40 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-teal-500 rounded-2xl p-4 shadow-2xl animate-bounce-short space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Gmail Notification</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">auth@mutatrack.genomics.org</span>
                </div>
              </div>
              <button
                onClick={() => setShowSimulatedGmailToast(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Halo <strong>{fullName}</strong>, berikut kode autentikasi akun MutaTrack Anda:
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xl font-bold tracking-widest text-teal-600 dark:text-teal-400">
                  {generatedOtp}
                </span>
                <button
                  onClick={handleAutoFillCode}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[10px] font-medium transition-colors cursor-pointer"
                >
                  Gunakan Kode
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 transition-colors">
          {/* STEP 1 & 2: LOGIN / REGISTER */}
          {authMode !== 'otp_verify' ? (
            <>
              {/* Tab Selector: Masuk / Daftar */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Masuk Akun (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Daftar Akun Baru (Sign Up)
                </button>
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {authMode === 'login' ? 'Autentikasi Pengguna Sistem' : 'Pendaftaran Akun Bioinformatika'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {authMode === 'login'
                    ? 'Masuk ke portal analisis MutaTrack dengan verifikasi keamanan Gmail terintegrasi.'
                    : 'Daftarkan akun institusi Anda untuk menjalankan pipeline DNA-seq GATK.'}
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div
                  id="login-error-banner"
                  className="bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Alamat Gmail / Email Institusi
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: noelbioinfnoel@apps.ipb.ac.id"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Kata Sandi (Password)
                      </label>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">Secured Token</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Menyiapkan Kode Verifikasi Gmail...</span>
                    ) : (
                      <>
                        <span>Lanjutkan ke Verifikasi Gmail</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* REGISTER FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                      Alamat Gmail Aktif (Untuk Kode Autentikasi)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: user@gmail.com / user@apps.ipb.ac.id"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono transition-colors"
                      />
                    </div>
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
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Memproses Pendaftaran...</span>
                    ) : (
                      <>
                        <span>Daftar & Kirim Kode Verifikasi</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Demo Account Quick Access */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Akun Demo Pengguna Analisis:</span>
                  <button
                    type="button"
                    onClick={handleUseDemo}
                    className="text-teal-600 dark:text-teal-400 hover:underline font-mono text-[11px] cursor-pointer"
                  >
                    Gunakan Demo
                  </button>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peran:</span>
                    <span className="text-teal-600 dark:text-teal-300 font-semibold">Pengguna Analisis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gmail:</span>
                    <span className="text-slate-900 dark:text-slate-200">noelbioinfnoel@apps.ipb.ac.id</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* STEP 3: GMAIL OTP VERIFICATION (Kode Autentikasi Pengguna Sistem) */
            <div className="space-y-6 animate-fadeIn">
              {/* Top back button */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke halaman login</span>
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Verifikasi Kode Gmail
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Masukkan 6-digit kode autentikasi pengguna sistem yang telah dikirimkan ke:
                </p>
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{email}</span>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {verificationSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold">Kode Verifikasi Valid! Membuka Dashboard...</span>
                </div>
              )}

              {/* 6-Digit OTP Box Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePasteOtp}
                      disabled={isVerifying || verificationSuccess}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 rounded-xl text-slate-900 dark:text-white transition-all select-all outline-none"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-center text-slate-400 font-mono">
                  Tips: Anda dapat menempelkan (paste) kode 6-digit secara langsung.
                </p>
              </div>

              {/* Verify Action Button */}
              <button
                type="button"
                onClick={() => executeVerification(otpDigits.join(''))}
                disabled={isVerifying || verificationSuccess || otpDigits.join('').length < 6}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
              >
                {isVerifying ? (
                  <span>Memverifikasi Kode Autentikasi...</span>
                ) : verificationSuccess ? (
                  <span>Terverifikasi! Mengalihkan...</span>
                ) : (
                  <>
                    <span>Konfirmasi & Masuk Sistem</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Code & Instant Testing Tools */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={generateNewCode}
                  disabled={resendCooldown > 0}
                  className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-mono text-[11px] disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'animate-spin'}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Kirim Ulang Kode (${resendCooldown}s)`
                      : 'Kirim Ulang Kode Sekarang'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoFillCode}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  title="Klik untuk mengisi kode otomatis bagi pengujian demo"
                >
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  <span>Auto-fill Demo Code ({generatedOtp})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 px-8 py-3 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        MutaTrack — Integrated Variant Calling Platform • Workflow Reference: Snakemake GATK DNA-seq Pipeline
      </footer>
    </div>
  );
};
