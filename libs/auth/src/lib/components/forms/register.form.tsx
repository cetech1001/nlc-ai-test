'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, EyeLashIcon } from '@nlc-ai/ui';

import { registerSchema, type RegisterFormData } from '../../schemas/auth-schemas';
import { type RegisterFormProps } from '../../types/auth.types';
import { GoogleIcon } from '../ui/google-icon';
import {Eye} from "lucide-react";

export const RegisterForm: FC<RegisterFormProps> = ({
  onSubmit,
  onSignIn,
  isLoading = false,
  error,
  showGoogleAuth = true,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[14px] text-[#F9F9F9] leading-6">
            Name<span className="text-[#FF3030]">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter your full name"
            {...register('fullName')}
            className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
          />
          {errors.fullName && (
            <p className="text-sm text-red-400">{errors.fullName.message}</p>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CACACA] hover:text-[#F9F9F9] transition-colors"
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

        {showGoogleAuth && (
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center min-h-[64px] bg-transparent border-[#EFEFEF] hover:bg-white/5 text-[#F9F9F9]/50 hover:text-[#F9F9F9] transition-all duration-200 rounded-[12px] gap-[14px]"
          >
            <GoogleIcon />
            <span className="text-[16px] leading-5">Sign up with google</span>
          </Button>
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

      {onSignIn && (
        <div className="text-center">
          <p className="text-[16px] leading-6 text-[#F9F9F9]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSignIn}
              className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
