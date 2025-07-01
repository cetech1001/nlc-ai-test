'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm, AuthLayout, type RegisterFormData } from '@nlc-ai/auth';

export default function CoachRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/coach/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Redirect to verification page
      router.push(`/account-verification?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <AuthLayout
      title="Create An Account"
      description="Enter following details to create your account."
    >
      <RegisterForm
        onSubmit={handleRegister}
        onSignIn={handleSignIn}
        isLoading={isLoading}
        error={error}
        showGoogleAuth={true}
      />
    </AuthLayout>
  );
}
