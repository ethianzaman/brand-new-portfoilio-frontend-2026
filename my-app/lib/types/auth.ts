export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: AuthUser;
  email?: string;
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