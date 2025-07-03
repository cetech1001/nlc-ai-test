'use client';

import {useMemo, useState} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AccountVerificationForm, useAuthPage, type AccountVerificationFormData } from '@nlc-ai/auth';
import { authAPI, type ApiError } from '@/lib/api/auth';

export function AdminAccountVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const description = useMemo(() => (
    <>
      Enter the verification code we've sent you to{' '}
      <span className="text-stone-50">{email}</span>
    </>
  ), [email]);

  useAuthPage({
    title: "Account Verification",
    description,
  });

  const handleVerification = async (data: AccountVerificationFormData) => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyCode(email, data.verificationCode);

      router.push(`/reset-password?token=${encodeURIComponent(response.resetToken)}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    try {
      await authAPI.resendCode(email);
      // Show success message or toast
      setError(''); // Clear any existing errors
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend code');
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <AccountVerificationForm
      onSubmit={handleVerification}
      onResendCode={handleResendCode}
      onBackToLogin={handleBackToLogin}
      email={email}
      isLoading={isLoading}
      error={error}
    />
  );
}
