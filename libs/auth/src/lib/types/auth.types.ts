import {ReactNode} from "react";

export interface AuthFormProps {
  onSubmit: (data: any) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
  clearErrorMessage?: () => void;
  successMessage?: string;
  clearSuccessMessage?: () => void;
  className?: string;
}

export interface LoginFormProps extends AuthFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  showGoogleAuth?: boolean;
  showRememberMe?: boolean;
}

export interface RegisterFormProps extends AuthFormProps {
  onSubmit: (data: RegisterFormData) => void | Promise<void>;
  onSignIn?: () => void;
  showGoogleAuth?: boolean;
}

export interface ForgotPasswordFormProps extends AuthFormProps {
  onSubmit: (data: ForgotPasswordFormData) => void | Promise<void>;
  onBackToLogin?: () => void;
}

export interface ResetPasswordFormProps extends AuthFormProps {
  onSubmit: (data: ResetPasswordFormData) => void | Promise<void>;
  onBackToLogin?: () => void;
}

export interface AccountVerificationFormProps extends AuthFormProps {
  onSubmit: (data: AccountVerificationFormData) => void | Promise<void>;
  onResendCode?: () => void;
  onBackToLogin?: () => void;
  email?: string;
  resendTimer?: number;
}

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string | Element;
  showLogo?: boolean;
}

import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  AccountVerificationFormData,
} from '../schemas';
import Element = React.JSX.Element;
