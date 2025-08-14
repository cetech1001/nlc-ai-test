export enum UserType {
  admin = 'admin',
  coach = 'coach',
  client = 'client'
}

export type AUTH_TYPES = 'admin' | 'coach' | 'client';

export interface ValidatedGoogleUser {
  providerID: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface AuthenticatedUser {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean | null;
    businessName: string | null;
    avatarUrl: string | null;
  };
}

export interface AuthUser {
  id: string;
  email: string;
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
