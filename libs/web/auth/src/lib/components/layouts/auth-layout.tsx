'use client';

import { FC } from 'react';
import { Logo } from "@nlc-ai/web-shared";
import { BackgroundBlobs, GlowOrbs } from '../ui';
import { type AuthLayoutProps } from '../../types';
import { useAuthLayout } from "../../context";

export const AuthLayout: FC<AuthLayoutProps> = ({
  children,
  showLogo = true,
}) => {
  const { title, description } = useAuthLayout();

  return (
    <div
      className="min-h-screen relative overflow-hidden font-inter"
      style={{ background: '#070300' }}
    >
      <div className="absolute inset-0 opacity-10 blur-[2px]">
        <BackgroundBlobs />
      </div>
      <GlowOrbs />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="w-full max-w-[425px] sm:max-w-[500px] lg:max-w-[612px] relative"
          style={{
            maxWidth: '849px',
            background:
              'linear-gradient(198deg, rgba(38, 38, 38, 0.30) 10.03%, rgba(19, 19, 19, 0.30) 75.61%)',
            backdropFilter: 'blur(21px)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 239, 239, 0.2)',
          }}
        >
          <div className="relative px-6 sm:px-8 lg:px-[119px] py-6 lg:py-8">
            {showLogo && (
              <div className="flex justify-center mb-6 lg:mb-8">
                <Logo />
              </div>
            )}

            {(title || description) && (
              <div className="text-center mb-8">
                {title && (
                  <h1 className="self-stretch text-center justify-center text-stone-50 text-4xl font-semibold font-['Inter'] leading-[48px]">
                    {title}
                  </h1>
                )}
                {description && (
                  <div className="self-stretch text-center justify-center text-zinc-500 text-md sm:text-xl font-normal font-['Inter'] leading-loose">
                    {description}
                  </div>
                )}
              </div>
            )}

            {children}

            <div className="text-center mt-6">
              <p className="text-[14px] leading-normal text-[#828282]">
                Using this platform means you agree to the{' '}
                <button className="underline hover:text-[#F9F9F9] transition-colors">
                  Terms of Use
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
