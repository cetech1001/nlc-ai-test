'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, AuthLayout, type LoginFormData } from '@nlc-ai/auth';

export default function CoachLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/coach/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();
      localStorage.setItem('coachToken', result.token);
      router.push('/coach/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <AuthLayout
      title="Coach Login"
      description="Enter your email and password to access your account."
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onSignUp={handleSignUp}
        isLoading={isLoading}
        error={error}
        showGoogleAuth={true}
        showRememberMe={true}
      />
    </AuthLayout>
  );
}
