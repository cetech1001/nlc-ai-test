'use client';

import {useState} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {AlertBanner, Button, Input } from '@nlc-ai/ui';
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../schemas';
import {ApiError, AuthFormProps} from "../../types";
import {authAPI} from "../../api";

export const ForgotPasswordForm = (props: AuthFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword(data.email, props.userType);
      toast.success(response.message);
      router.push(`/account-verification?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className={`space-y-6 ${props.className}`}>
      {error && (
        <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            Email<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full min-h-[64px] text-[16px] leading-[22px] font-semibold text-white border-0 hover:opacity-90 transition-opacity rounded-[8px] disabled:opacity-50"
          style={{
            background:
              'linear-gradient(19deg, #FEBEFA 6.78%, #B339D4 34.87%, #7B21BA 61.32%, #7B26F0 91.07%)',
          }}
        >
          {isLoading || isSubmitting ? 'Sending...' : 'Reset Password'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-[16px] leading-6 text-[#F9F9F9]">
          Remember your password?{' '}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};
