'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, EyeLashIcon, AlertBanner } from '@nlc-ai/ui';
import {Eye} from "lucide-react";
import {useRouter} from "next/navigation";
import { resetPasswordSchema, type ResetPasswordFormData } from '../../schemas';
import {ApiError, type ResetPasswordFormProps} from '../../types';
import {authAPI} from "../../api";

export const ResetPasswordForm = (props: ResetPasswordFormProps) => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    if (!props.token) {
      setError('Reset token is missing. Please try the process again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.resetPassword(props.token, data.password);

      router.push('/login?message=Password reset successfully. Please log in with your new password.');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to reset password');
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
        <AlertBanner
          type={"error"}
          message={error}
          onDismiss={() => setError('')}/>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            New Password<span className="text-[#FF3030]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              {...register('password')}
              className="min-h-[64px] px-4 pr-12 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/3 sm:top-1/2 -translate-y-1/2 text-[#CACACA] hover:text-[#F9F9F9] transition-colors"
            >
              {showPassword ? <Eye/> : <EyeLashIcon/>}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            Confirm New Password<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type={'password'}
            placeholder="Re-enter your new password"
            {...register('confirmPassword')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
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
          {isLoading || isSubmitting ? 'Resetting...' : 'Reset Password'}
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
