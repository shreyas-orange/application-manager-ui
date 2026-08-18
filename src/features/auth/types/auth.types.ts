export type UserRole = "admin" | "manager" | "user" | "db validator" | "db manager";

export interface UserRoleInfo {
  id: number;
  name: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  // Observed as either a role object or a plain string depending on the
  // endpoint — see getUserRole(), which normalizes both.
  role: UserRoleInfo | string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
}

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}
