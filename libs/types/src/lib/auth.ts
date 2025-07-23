export enum UserType {
  admin = 'admin',
  coach = 'coach'
}

export type AUTH_TYPES = 'admin' | 'coach';

export interface AuthUser {
  id: string;
  type: AUTH_TYPES;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  password: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}
