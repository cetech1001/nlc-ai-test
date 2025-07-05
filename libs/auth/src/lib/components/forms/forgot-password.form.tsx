'use client';

import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {AlertBanner, Button, Input } from '@nlc-ai/ui';

import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../schemas/auth-schemas';
import { type ForgotPasswordFormProps } from '../../types/auth.types';

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  error,
  clearErrorMessage,
  className = '',
}) => {
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
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <AlertBanner type={"error"} message={error} onDismiss={clearErrorMessage}/>
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

      {onBackToLogin && (
        <div className="text-center">
          <p className="text-[16px] leading-6 text-[#F9F9F9]">
            Remember your password?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
