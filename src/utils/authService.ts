import { User, UserRole } from '../types';
import { generateSalt, hashPassword, verifyPassword } from './cryptoUtils';

export interface StoredAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution: string;
  affiliation: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
}

const STORAGE_ACCOUNTS_KEY = 'mutatrack_registered_accounts';
const STORAGE_SESSION_KEY = 'mutatrack_active_session';
const STORAGE_USER_KEY = 'mutatrack_user';

// Initial pre-seeded accounts
const INITIAL_DEMO_ACCOUNTS = [
  {
    id: 'USR-DEMO-001',
    email: 'demo@mutatrack.id',
    name: 'Pengguna Analisis',
    role: 'Pengguna Analisis' as UserRole,
    institution: 'Departemen Bioinformatika & Genomika Komputasi IPB',
    affiliation: 'Departemen Bioinformatika & Genomika Komputasi IPB',
    plainPassword: 'MutaTrack2026!',
    isEmailVerified: true,
  },
  {
    id: 'USR-RES-002',
    email: 'noelbioinfnoel@apps.ipb.ac.id',
    name: 'Noel Bioinformatician',
    role: 'Bioinformatician' as UserRole,
    institution: 'Laboratorium Bioinformatika IPB',
    affiliation: 'Laboratorium Bioinformatika IPB',
    plainPassword: 'biomuta2026',
    isEmailVerified: true,
  },
];

/**
 * Initialize accounts database in persistent storage.
 * Seeds initial accounts with salted password hashes if no database is found.
 */
export async function initAuthDatabase(): Promise<StoredAccount[]> {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Unable to read accounts from localStorage:', e);
  }

  // Pre-seed accounts with cryptographic salt and SHA-256 hash
  const seededAccounts: StoredAccount[] = [];
  const now = new Date().toISOString();

  for (const acc of INITIAL_DEMO_ACCOUNTS) {
    const salt = generateSalt(16);
    const hash = await hashPassword(acc.plainPassword, salt);
    seededAccounts.push({
      id: acc.id,
      email: acc.email.toLowerCase(),
      name: acc.name,
      role: acc.role,
      institution: acc.institution,
      affiliation: acc.affiliation,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: now,
      isEmailVerified: acc.isEmailVerified,
    });
  }

  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(seededAccounts));
  } catch (e) {
    console.warn('Unable to persist initial accounts to localStorage:', e);
  }

  return seededAccounts;
}

/**
 * Retrieve all registered accounts from persistent storage.
 */
function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

/**
 * Save updated accounts list to persistent storage.
 */
function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to persistent storage:', e);
  }
}

/**
 * Strip sensitive credentials and return a safe User object.
 */
export function sanitizeUser(account: StoredAccount): User {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    affiliation: account.affiliation,
    institution: account.institution,
    isEmailVerified: account.isEmailVerified,
    lastLoginAt: account.lastLoginAt,
  };
}

/**
 * Find account by email (case-insensitive).
 */
export async function findAccountByEmail(email: string): Promise<StoredAccount | null> {
  const normalized = email.trim().toLowerCase();
  let accounts = getStoredAccounts();
  if (accounts.length === 0) {
    accounts = await initAuthDatabase();
  }
  const match = accounts.find((a) => a.email.toLowerCase() === normalized);
  return match || null;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  code?: 'ACCOUNT_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'VALIDATION_ERROR' | 'EMAIL_EXISTS' | 'SERVER_ERROR';
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  institution?: string;
  role?: UserRole;
}

/**
 * Authenticate user with email and password.
 * Strictly verifies against stored accounts using salted cryptographic hash.
 */
export async function authenticate(email: string, password: string): Promise<AuthResult> {
  const emailTrimmed = (email || '').trim();
  const passwordTrimmed = password || '';

  // 1. Validation checks
  if (!emailTrimmed) {
    return {
      success: false,
      error: 'Email is required.',
      code: 'VALIDATION_ERROR',
    };
  }

  if (!passwordTrimmed) {
    return {
      success: false,
      error: 'Password is required.',
      code: 'VALIDATION_ERROR',
    };
  }

  // 2. Lookup account
  const account = await findAccountByEmail(emailTrimmed);
  if (!account) {
    return {
      success: false,
      error: 'Account not found. Please create an account first.',
      code: 'ACCOUNT_NOT_FOUND',
    };
  }

  // 3. Verify password hash
  const isValid = await verifyPassword(passwordTrimmed, account.passwordSalt, account.passwordHash);
  if (!isValid) {
    return {
      success: false,
      error: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS',
    };
  }

  // 4. Update last login timestamp
  account.lastLoginAt = new Date().toLocaleString();
  const allAccounts = getStoredAccounts();
  const index = allAccounts.findIndex((a) => a.id === account.id);
  if (index !== -1) {
    allAccounts[index] = account;
    saveStoredAccounts(allAccounts);
  }

  // 5. Create safe user and save session
  const safeUser = sanitizeUser(account);
  try {
    const sessionToken = `session_${Date.now()}_${generateSalt(8)}`;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ token: sessionToken, userId: safeUser.id, email: safeUser.email }));
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(safeUser));
  } catch (e) {
    console.warn('Failed to save session to storage:', e);
  }

  return {
    success: true,
    user: safeUser,
  };
}

/**
 * Register a new user account.
 * Persists the account securely with a unique salt and hashed password.
 * Does NOT auto-login, returns message to return to login.
 */
export async function registerAccount(input: RegisterInput): Promise<AuthResult & { message?: string }> {
  const fullName = (input.fullName || '').trim();
  const email = (input.email || '').trim().toLowerCase();
  const password = input.password || '';
  const confirmPassword = input.confirmPassword || '';
  const institution = (input.institution || '').trim() || 'Biomedical Research Center';
  const role: UserRole = input.role || 'Pengguna Analisis';

  // 1. Full name validation
  if (!fullName) {
    return {
      success: false,
      error: 'Full Name is required.',
      code: 'VALIDATION_ERROR',
    };
  }

  // 2. Email format validation
  if (!email) {
    return {
      success: false,
      error: 'Email is required.',
      code: 'VALIDATION_ERROR',
    };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Invalid email address format.',
      code: 'VALIDATION_ERROR',
    };
  }

  // 3. Password presence & length
  if (!password) {
    return {
      success: false,
      error: 'Password is required.',
      code: 'VALIDATION_ERROR',
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long.',
      code: 'VALIDATION_ERROR',
    };
  }

  // 4. Confirm password match
  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match.',
      code: 'VALIDATION_ERROR',
    };
  }

  // 5. Duplicate email detection
  const existing = await findAccountByEmail(email);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please log in.',
      code: 'EMAIL_EXISTS',
    };
  }

  // 6. Generate cryptographic salt and hash password
  const salt = generateSalt(16);
  const hash = await hashPassword(password, salt);

  const newAccount: StoredAccount = {
    id: `USR-${Date.now().toString().slice(-6)}`,
    email,
    name: fullName,
    role,
    institution,
    affiliation: institution,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    isEmailVerified: true,
  };

  const accounts = getStoredAccounts();
  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  return {
    success: true,
    message: 'Account created successfully. Please log in.',
    user: sanitizeUser(newAccount),
  };
}

/**
 * Invalidate current session and log out.
 * Preserves registered accounts in persistent storage.
 */
export function logoutSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);
  } catch (e) {
    console.error('Failed to clear session storage:', e);
  }
}

/**
 * Retrieve the currently authenticated user from active session storage.
 */
export function getCurrentSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY) || sessionStorage.getItem(STORAGE_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return null;
}
