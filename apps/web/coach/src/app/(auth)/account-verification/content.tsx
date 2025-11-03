'use client';

import {useMemo} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AccountVerificationForm, useAuthPage } from '@nlc-ai/web-auth';
import {UserType} from "@nlc-ai/types";

export const CoachAccountVerificationContent = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'verification';

  const description = useMemo(() => {
    if (type === 'verification') {
      return (
        <>
          Please verify your email address. Enter the verification code we've sent to{' '}
          <span className="text-stone-50">{email}</span>
        </>
      );
    } else {
      return (
        <>
          Enter the verification code we've sent you to{' '}
          <span className="text-stone-50">{email}</span>
        </>
      );
    }
  }, [email, type]);

  const title = type === 'verification' ? 'Email Verification' : 'Account Verification';

  useAuthPage({
    title,
    description,
  });

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleResetToken = (resetToken: string) => {
    router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
  }

  const handleHome = () => {
    router.push('/home');
  }

  return (
    <AccountVerificationForm
      userType={UserType.COACH}
      handleBackToLogin={handleBackToLogin}
      handleResetToken={handleResetToken}
      handleHome={handleHome}
      email={email}
      resendTimer={70}
      verificationType={type as 'verification' | 'reset'}
    />
  );
}
