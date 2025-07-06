import {ReactNode} from "react";

export interface AuthFormProps {
  className?: string;
}

export interface LoginFormProps extends AuthFormProps {
  showSignUp?: boolean;
  showGoogleAuth?: boolean;
  showRememberMe?: boolean;
}

export interface RegisterFormProps extends AuthFormProps {
  showGoogleAuth?: boolean;
}

export interface ResetPasswordFormProps extends AuthFormProps {
  token?: string;
}

export interface AccountVerificationFormProps extends AuthFormProps {
  email?: string;
  resendTimer?: number;
}

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string | Element;
  showLogo?: boolean;
}

import Element = React.JSX.Element;
