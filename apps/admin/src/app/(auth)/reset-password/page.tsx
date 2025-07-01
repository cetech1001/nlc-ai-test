'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm, useAuthPage, type ResetPasswordFormData } from '@nlc-ai/auth';

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useAuthPage({
    title: "Password Reset",
    description: "Create a new password to reset your account access.",
  })

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      // Redirect to login with success message
      router.push('/login?message=Password reset successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      onBackToLogin={handleBackToLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}
