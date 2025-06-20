export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export interface VerificationFormData {
  code: string
}

export interface AuthError {
  message: string
  field?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'coach' | 'admin'
  isVerified: boolean
}
