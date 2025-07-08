'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {AlertBanner, Button, Input } from '@nlc-ai/ui';

import { accountVerificationSchema, type AccountVerificationFormData } from '../../schemas';
import {type AccountVerificationFormProps, ApiError} from '../../types';
import {authAPI} from "../../api";

export const AccountVerificationForm = (props: AccountVerificationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(props.resendTimer || 60);
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountVerificationFormData>({
    resolver: zodResolver(accountVerificationSchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    return () => null;
  }, [timer]);

  const handleFormSubmit = async (data: AccountVerificationFormData) => {
    setSuccessMessage('');

    if (!props.email) {
      setError('Email address is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyCode(props.email, data.verificationCode);

      props.handleResetToken(response.resetToken);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (canResend) {
      await handleResendCode();
      setTimer(props.resendTimer || 60);
      setCanResend(false);
    }
  };

  const handleResendCode = async () => {
    if (!props.email) {
      setError('Email address is required');
      return;
    }

    try {
      await authAPI.resendCode(props.email);
      setSuccessMessage('Verification code has been resent to your email address');
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend code');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 ${props.className}`}>
      {error && (
        <AlertBanner
          type={"error"}
          message={error}
          onDismiss={() => setError('')}/>
      )}

      {successMessage && (
        <AlertBanner
          type={"success"}
          message={successMessage}
          onDismiss={() => setSuccessMessage('')}/>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            Verification Code<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter verification code"
            autoComplete={"new-password"}
            {...register('verificationCode')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.verificationCode && (
            <p className="text-sm text-red-400">{errors.verificationCode.message}</p>
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
          {isLoading || isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </form>

      <div className="text-center space-y-[6px]">
        <p className="text-[16px] leading-6 text-[#F9F9F9]">
          Didn't Receive Code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`transition-colors ${
              canResend
                ? 'text-[#DF69FF] hover:text-[#FEBEFA]'
                : 'text-[#828282] cursor-not-allowed'
            }`}
          >
            {canResend ? 'Resend' : `Resend ${formatTime(timer)}`}
          </button>
        </p>
        <p className="text-[16px] leading-6 text-[#F9F9F9]">
          <button
            type="button"
            onClick={props.handleBackToLogin}
            className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};
