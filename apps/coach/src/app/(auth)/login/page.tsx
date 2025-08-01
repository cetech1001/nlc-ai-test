'use client';

import { LoginForm, useAuthPage } from "@nlc-ai/auth";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";

const CoachLoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [_, __, removeCookie] = useCookies<string>(['g_state']);

  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  useAuthPage({
    title: 'Login',
    description: 'Enter your email and password to access your account.',
  });

  const handleAccountVerification = (email = '') => {
    router.push(`/account-verification?email=${encodeURIComponent(email)}&type=verification`)
  }

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
      handleAccountVerification={handleAccountVerification}
      successMessage={successMessage}
      setSuccessMessage={(message: string) => setSuccessMessage(message)}
      showSignUp={true}
      showGoogleAuth={true}
      showRememberMe={true}
      removeCookie={removeCookie}
    />
  );
}

export default CoachLoginPage;
