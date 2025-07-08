'use client';

import {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {Eye} from "lucide-react";
import { Button, Input, Checkbox, EyeLashIcon, AlertBanner } from '@nlc-ai/ui';
import {useSearchParams} from "next/navigation";
import {ApiError} from "@nlc-ai/api-client";
import { loginSchema, type LoginFormData } from '../../schemas';
import { type LoginFormProps } from '../../types';
import { GoogleIcon } from '../ui';
import {useAuth} from "../../hooks";

export const LoginForm = (props: LoginFormProps) => {
  const { login } = useAuth();

  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await login(data.email, data.password, data.rememberMe, props.userType);
      props.handleHome();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
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
                className="absolute right-4 top-1/3 sm:top-1/2 -translate-y-1/2 text-[#CACACA] hover:text-[#F9F9F9] transition-colors"
              >
                {showPassword ? <Eye/> : <EyeLashIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            {props.showRememberMe && (
              <label className="flex items-center gap-[6px] cursor-pointer">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === 'indeterminate' ? false : checked);
                      }}
                      className="w-8 h-8 border-2 border-[#CACACA] data-[state=checked]:bg-magenta data-[state=checked]:border-magenta rounded-lg"
                    />
                  )}
                />
                <span className="text-[16px] leading-5 text-[#F9F9F9]">
                    Remember me
                  </span>
              </label>
            )}
            <button
              type="button"
              onClick={props.handleForgotPassword}
              className="text-[16px] leading-5 text-[#F9F9F9] hover:text-magenta-light transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {props.showGoogleAuth && (
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

      {props.showSignUp && (
        <div className="text-center">
          <p className="text-[16px] leading-6 text-[#F9F9F9]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={props.handleSignUp}
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
