'use client';

import {useMemo, useState} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AccountVerificationForm, useAuthPage, type AccountVerificationFormData } from '@nlc-ai/auth';

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
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: data.verificationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }

      // Redirect to reset password page
      router.push(`/reset-password?token=${await response.text()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    try {
      await fetch('/api/auth/admin/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error('Failed to resend code:', err);
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
