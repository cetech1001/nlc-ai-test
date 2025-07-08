'use client';

import { LoginForm } from "@nlc-ai/auth";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

export default function CoachLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

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
      successMessage={successMessage}
      setSuccessMessage={(message: string) => setSuccessMessage(message)}
      showSignUp={true}
      showGoogleAuth={true}
      showRememberMe={true}
    />
  );
}
