export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  timezone?: string;
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  marketingOptIn?: boolean;
  triggerPasswordReset?: boolean;
}

export interface CoachRegistrationRequest extends RegistrationRequest {}

export interface ClientRegistrationRequest extends RegistrationRequest {
  inviteToken: string;
}

export interface ClientGoogleAuthRequest extends GoogleAuthRequest {
  inviteToken?: string;
}

export interface SwitchCoachContextRequest {
  coachID: string;
}
