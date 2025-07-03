'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ForgotPasswordForm, useAuthPage, type ForgotPasswordFormData } from '@nlc-ai/auth';
import { authAPI, type ApiError } from '@/lib/api/auth';

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useAuthPage({
    title: "Forgot Password",
    description: "Enter your registered email address & we'll send you code to reset your password.",
  });

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(data.email);

      router.push(`/account-verification?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleForgotPassword}
      onBackToLogin={handleBackToLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}
