'use client';

import { LoginForm, useAuthPage } from '@nlc-ai/auth';
import { USER_TYPE } from '@nlc-ai/types';
import {useRouter} from "next/navigation";


export default function AdminLoginPage() {
  const router = useRouter();

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
      userType={USER_TYPE.admin}
      showSignUp={false}
      showGoogleAuth={false}
      showRememberMe={true}
    />
  );
}
