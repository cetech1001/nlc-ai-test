'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm, useAuthPage } from '@nlc-ai/auth';
import {USER_TYPE} from "@nlc-ai/types";

export const CoachResetPasswordContent = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  useAuthPage({
    title: "Password Reset",
    description: "Create a new password to reset your account access.",
  });

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

  const handleBackToLogin = (message?: string) => {
    let param = "";
    if (message) {
      param = `?message=${message}`;
    }
    router.push(`/login${param}`);
  };

  return (
    <ResetPasswordForm
      handleBackToLogin={handleBackToLogin}
      token={token}
      userType={USER_TYPE.admin}/>
  );
}
