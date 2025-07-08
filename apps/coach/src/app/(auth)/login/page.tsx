'use client';

import { LoginForm } from "@nlc-ai/auth";
import {useRouter} from "next/navigation";

export default function CoachLoginPage() {
  const router = useRouter();

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/register');
  }

  const handleHome = () => {
    router.push('/home');
  }

  return (
    <LoginForm
      handleHome={handleHome}
      handleSignUp={handleSignUp}
      handleForgotPassword={handleForgotPassword}
      showSignUp={true}
      showGoogleAuth={true}
      showRememberMe={true}
    />
  );
}
