'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm, useAuthPage, type ResetPasswordFormData } from '@nlc-ai/auth';
import { authAPI, type ApiError } from '@nlc-ai/auth';

export function AdminResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useAuthPage({
    title: "Password Reset",
    description: "Create a new password to reset your account access.",
  });

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Reset token is missing. Please try the process again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.resetPassword(token, data.password);

      router.push('/login?message=Password reset successfully. Please log in with your new password.');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <h2 className="text-white text-xl mb-4">Invalid Reset Link</h2>
        <p className="text-stone-300 mb-6">
          This reset link is invalid or has expired. Please request a new password reset.
        </p>
        <button
          onClick={() => router.push('/forgot-password')}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Request New Reset
        </button>
      </div>
    );
  }

  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      onBackToLogin={handleBackToLogin}
      isLoading={isLoading}
      error={error}
      clearErrorMessage={() => setError('')}
    />
  );
}
