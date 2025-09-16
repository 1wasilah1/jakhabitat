export interface LoginRequest {
  username: string;
  password: string;
  app_id: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AuthMeRequest {
  app_id: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}