'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, useAuthPage, type LoginFormData } from '@nlc-ai/auth';
import {ApiError} from "@/lib/api/auth";
import {useAuth} from "@/lib/hooks/use-auth";

export default function AdminLoginPage() {
  const { login } = useAuth();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useAuthPage({
    title: 'Admin Login',
    description: 'Enter your credentials to access the admin panel.',
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data.email, data.password, data.rememberMe);
      router.push('/home');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      isLoading={isLoading}
      error={error}
      showGoogleAuth={false}
      showRememberMe={true}
    />
  );
}
