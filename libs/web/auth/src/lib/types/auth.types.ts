import {ReactNode} from "react";
import Element = React.JSX.Element;
import {UserType} from "@nlc-ai/types";

export interface AuthFormProps {
  className?: string;
  userType: UserType;
}

export interface LoginFormProps extends AuthFormProps {
  handleHome: () => void;
  handleSignUp: () => void;
  handleForgotPassword: () => void;
  successMessage: string;
  setSuccessMessage: (message: string) => void;
  removeCookie?: (value: string) => void;
  handleAccountVerification?: (email?: string) => void;
  showSignUp?: boolean;
  showGoogleAuth?: boolean;
  showRememberMe?: boolean;
}

export interface RegisterFormProps extends AuthFormProps {
  handleHome: () => void;
  handleSignIn: () => void;
  handleAccountVerification: (email: string) => void;
  showGoogleAuth?: boolean;
}

export interface ForgotPasswordFormProps extends AuthFormProps {
  handleBackToLogin: () => void;
  handleAccountVerification: (email: string) => void;
}

export interface ResetPasswordFormProps extends AuthFormProps {
  handleBackToLogin: (message?: string) => void;
  token?: string;
}

export interface AccountVerificationFormProps extends AuthFormProps {
  handleBackToLogin: () => void;
  handleResetToken: (resetToken: string) => void;
  handleHome?: () => void;
  email?: string;
  resendTimer?: number;
  verificationType?: 'verification' | 'reset';
}

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string | Element;
  showLogo?: boolean;
}
