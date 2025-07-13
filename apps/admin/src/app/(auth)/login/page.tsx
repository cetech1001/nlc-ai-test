'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm, useAuthPage } from '@nlc-ai/auth';
import { USER_TYPE } from '@nlc-ai/types';


const AdminLoginPage = () => {
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

  useAuthPage({
    title: 'Admin Login',
    description: 'Enter your credentials to access the admin panel.',
  });

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
      userType={USER_TYPE.admin}
      showSignUp={false}
      showGoogleAuth={false}
      showRememberMe={true}
    />
  );
}

export default AdminLoginPage;
