export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  inviteToken?: string;
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

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}
