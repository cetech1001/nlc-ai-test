'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { LoginForm, useAuthPage, type LoginFormData } from '@nlc-ai/auth';
import {ApiError} from "@/lib/api/auth";
import {useAuth} from "@/lib/hooks/use-auth";

export default function AdminLoginPage() {
  const { login } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  useAuthPage({
    title: 'Admin Login',
    description: 'Enter your credentials to access the admin panel.',
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await login(data.email, data.password, data.rememberMe);
      router.push('/home');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-800/20 border border-green-600 rounded-lg">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        isLoading={isLoading}
        error={error}
        showGoogleAuth={false}
        showRememberMe={true}
      />
    </>
  );
}
