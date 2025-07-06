'use client';

import {useMemo} from 'react';
import { useSearchParams } from 'next/navigation';
import { AccountVerificationForm, useAuthPage } from '@nlc-ai/auth';

export function AdminAccountVerificationContent() {
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

  return (
    <AccountVerificationForm email={email} resendTimer={70}/>
  );
}
