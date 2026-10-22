import type { UserRole } from "./user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  /** Present when the payload came from a protected current-user endpoint. */
  role?: UserRole;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: AuthUser;
  email?: string;
  role?: UserRole;
  data?: {
    token?: string;
    user?: AuthUser;
  };
  message?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
