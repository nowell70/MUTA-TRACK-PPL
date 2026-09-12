export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  institution?: string;
  lastLoginAt: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}
