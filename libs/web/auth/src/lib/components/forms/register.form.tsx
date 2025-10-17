'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, EyeLashIcon, AlertBanner } from '@nlc-ai/web-ui';
import { Eye } from "lucide-react";
import { ApiResponse } from '@nlc-ai/sdk-core';

import { registerSchema, type RegisterFormData } from '../../schemas';
import { type RegisterFormProps } from '../../types';
import { GoogleIcon } from '../ui';
import { useGoogleOAuth } from '../../hooks';
import { authAPI } from '../../api';
import {UserType} from "@nlc-ai/types";

export const RegisterForm: FC<RegisterFormProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema(props.userType)),
    defaultValues: {
      firstName: '',
      lastName: '',
      inviteToken: props.inviteToken,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError('');

      await authAPI.googleAuth(credentialResponse.credential, props.userType, props.inviteToken);
      props.handleHome();
    } catch (err: any) {
      setError(err.message || err.error?.message || 'Google registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google registration was cancelled or failed');
  };

  const { isLoaded, signIn } = useGoogleOAuth({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  const handleFormSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {

      await authAPI.register(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        props.userType,
        false,
        props.inviteToken
      );
      props.handleAccountVerification(data.email);
    } catch (err: unknown) {
      const apiError = err as ApiResponse<undefined>;
      setError(apiError.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (UserType.CLIENT && !props.inviteToken) {
      setError('Invite token is required');
    } else {
      signIn();
    }
  }

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
            First name<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter your first name"
            {...register('firstName')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.firstName && (
            <p className="text-sm text-red-400">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            Last name<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter your last name"
            {...register('lastName')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.lastName && (
            <p className="text-sm text-red-400">{errors.lastName.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            Password<span className="text-[#FF3030]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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
            Confirm Password<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type="password"
            placeholder="Re-enter your password"
            {...register('confirmPassword')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {props.userType === UserType.CLIENT && (
          <div className="space-y-2">
            <label className="block text-[14px] text-[#F9F9F9] leading-6">
              Invite Token<span className="text-[#FF3030]">*</span>
            </label>
            <Input
              type="text"
              placeholder="Invite token"
              disabled={true}
              {...register('inviteToken')}
              className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
            />
            {errors.inviteToken && (
              <p className="text-sm text-red-400">{errors.inviteToken.message}</p>
            )}
          </div>
        )}

        {props.showGoogleAuth && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={!isLoaded || isLoading}
              className="w-full flex items-center justify-center min-h-[64px] bg-transparent border-[#EFEFEF] hover:bg-white/5 text-[#F9F9F9]/50 hover:text-[#F9F9F9] transition-all duration-200 rounded-[12px] gap-[14px]"
            >
              <GoogleIcon />
              <span className="text-[16px] leading-5">Sign up with Google</span>
            </Button>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full min-h-[64px] text-[16px] leading-[22px] font-semibold text-white border-0 hover:opacity-90 transition-opacity rounded-[8px] disabled:opacity-50"
          style={{
            background:
              'linear-gradient(19deg, #FEBEFA 6.78%, #B339D4 34.87%, #7B21BA 61.32%, #7B26F0 91.07%)',
          }}
        >
          {isLoading || isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-[16px] leading-6 text-[#F9F9F9]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={props.handleSignIn}
            className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
