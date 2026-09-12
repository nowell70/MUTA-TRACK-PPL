import { AuthCredentials, AuthResponse, AuthUser, ValidationErrors } from './authTypes';

export const DEMO_CREDENTIALS = {
  email: 'demo@mutatrack.id',
  password: 'MutaTrack2026!',
} as const;

export const AUTH_KEYS = {
  STATE: 'mutatrack_isAuthenticated',
  USER: 'mutatrack_authUser',
  STORAGE_TYPE: 'mutatrack_storageType',
} as const;

// Email format validation (standard RFC regex)
export function isValidEmailFormat(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Standard email validation pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

// Synchronous form validation prior to authentication submission
export function validateLoginForm(credentials: { email: string; password: string }): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  const emailTrimmed = credentials.email.trim();
  const passwordTrimmed = credentials.password;

  if (!emailTrimmed) {
    errors.email = 'Email wajib diisi.';
  } else if (!isValidEmailFormat(emailTrimmed)) {
    errors.email = 'Format email tidak valid.';
  }

  if (!passwordTrimmed) {
    errors.password = 'Password wajib diisi.';
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}

// Check existing stored authentication state
export function getStoredAuth(): { isAuthenticated: boolean; user: AuthUser | null } {
  try {
    // Check localStorage first
    const localState = localStorage.getItem(AUTH_KEYS.STATE);
    const localUser = localStorage.getItem(AUTH_KEYS.USER);

    if (localState === 'true' && localUser) {
      return {
        isAuthenticated: true,
        user: JSON.parse(localUser),
      };
    }

    // Check sessionStorage
    const sessionState = sessionStorage.getItem(AUTH_KEYS.STATE);
    const sessionUser = sessionStorage.getItem(AUTH_KEYS.USER);

    if (sessionState === 'true' && sessionUser) {
      return {
        isAuthenticated: true,
        user: JSON.parse(sessionUser),
      };
    }
  } catch (error) {
    console.error('Error reading stored authentication:', error);
  }

  return { isAuthenticated: false, user: null };
}

// Mock Authentication service implementation
export async function authenticate(credentials: AuthCredentials): Promise<AuthResponse> {
  // Simulate brief network/verification delay for realistic UI loading feedback
  await new Promise((resolve) => setTimeout(resolve, 450));

  const normalizedEmail = credentials.email.trim().toLowerCase();
  const rawPassword = credentials.password;

  // Verify against mock demo credentials
  if (
    normalizedEmail === DEMO_CREDENTIALS.email.toLowerCase() &&
    rawPassword === DEMO_CREDENTIALS.password
  ) {
    const user: AuthUser = {
      id: 'USR-MUTA-001',
      email: DEMO_CREDENTIALS.email,
      name: 'Pengguna Analisis',
      role: 'Pengguna Analisis',
      institution: 'Departemen Bioinformatika & Genomika Komputasi',
      lastLoginAt: new Date().toISOString(),
    };

    try {
      // Clear both first to avoid residual state
      clearStoredAuth();

      // Store in selected storage mechanism based on 'Remember me'
      const targetStorage = credentials.rememberMe ? localStorage : sessionStorage;
      targetStorage.setItem(AUTH_KEYS.STATE, 'true');
      targetStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
      targetStorage.setItem(AUTH_KEYS.STORAGE_TYPE, credentials.rememberMe ? 'local' : 'session');
    } catch (storageError) {
      console.warn('Storage write notice:', storageError);
    }

    return {
      success: true,
      user,
    };
  }

  // Generic message for security (does not disclose if email exists or password wrong)
  return {
    success: false,
    error: 'Email atau password tidak valid.',
  };
}

// Clear stored authentication
export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_KEYS.STATE);
    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.STORAGE_TYPE);

    sessionStorage.removeItem(AUTH_KEYS.STATE);
    sessionStorage.removeItem(AUTH_KEYS.USER);
    sessionStorage.removeItem(AUTH_KEYS.STORAGE_TYPE);
  } catch (error) {
    console.error('Error clearing stored authentication:', error);
  }
}
