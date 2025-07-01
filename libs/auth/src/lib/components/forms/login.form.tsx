'use client';

import { useState, FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Checkbox, EyeLashIcon } from '@nlc-ai/ui';

import { loginSchema, type LoginFormData } from '../../schemas';
import { type LoginFormProps } from '../../types';
import { GoogleIcon } from '../ui';

export const LoginForm: FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignUp,
  isLoading = false,
  error,
  showGoogleAuth = true,
  showRememberMe = true,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Login error:', error);
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

        <div className="space-y-3">
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
                <EyeLashIcon />
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {(showRememberMe || onForgotPassword) && (
            <div className="flex items-center justify-between">
              {showRememberMe && (
                <label className="flex items-center gap-[6px] cursor-pointer">
                  <div className="relative">
                    <Checkbox
                      {...register('rememberMe')}
                      checked={rememberMe}
                      className="w-8 h-8 border-2 border-[#CACACA] data-[state=checked]:bg-magenta data-[state=checked]:border-magenta rounded-lg"
                    />
                  </div>
                  <span className="text-[16px] leading-5 text-[#F9F9F9]">
                    Remember me
                  </span>
                </label>
              )}
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[16px] leading-5 text-[#F9F9F9] hover:text-magenta-light transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}
        </div>

        {showGoogleAuth && (
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center min-h-[64px] bg-transparent border-[#EFEFEF] hover:bg-white/5 text-[#F9F9F9]/50 hover:text-[#F9F9F9] transition-all duration-200 rounded-[12px] gap-[14px]"
          >
            <GoogleIcon />
            <span className="text-[16px] leading-5">Sign in with google</span>
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
          {isLoading || isSubmitting ? 'Signing In...' : 'Login'}
        </Button>
      </form>

      {onSignUp && (
        <div className="text-center">
          <p className="text-[16px] leading-6 text-[#F9F9F9]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSignUp}
              className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
