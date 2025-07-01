'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseAuthFormOptions {
  redirectTo?: string;
  apiEndpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useAuthForm = ({
  redirectTo,
  apiEndpoint,
  onSuccess,
  onError,
}: UseAuthFormOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // @ts-ignore
        throw new Error(errorData?.message || 'Request failed');
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result);
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    setError,
  };
};
