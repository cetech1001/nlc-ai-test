'use client';

import {useMemo} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { AccountVerificationForm, useAuthPage } from '@nlc-ai/auth';

export function AdminAccountVerificationContent() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

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

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleResetToken = (resetToken: string) => {
    router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
  }

  return (
    <AccountVerificationForm
      handleBackToLogin={handleBackToLogin}
      handleResetToken={handleResetToken}
      email={email} resendTimer={70}/>
  );
}
