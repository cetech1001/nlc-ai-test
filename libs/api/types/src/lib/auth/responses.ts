import {AuthUser} from "./user.types";

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface RegistrationResponse {
  message: string;
  coachID?: string;
  clientID?: string;
  requiresVerification?: boolean;
  email?: string;
}

export interface VerificationResponse {
  access_token?: string;
  user?: AuthUser;
  resetToken?: string;
  verified: boolean;
  message: string;
}

export interface ProfileResponse {
  message: string;
  user: Partial<AuthUser>;
}
