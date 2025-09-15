'use client'

import React from 'react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
                                                         children,
                                                         onClick,
                                                         className = '',
                                                         size = 'md',
                                                         variant = 'primary',
                                                         disabled = false
                                                       }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      default:
        return 'px-5 py-[13px] text-base';
    }
  };

  const getVariantClasses = () => {
    if (variant === 'secondary') {
      return 'border border-[#DF69FF] text-[#DF69FF] bg-transparent hover:bg-gradient-to-t hover:from-[#FEBEFA] hover:via-[#B339D4] hover:to-[#7B21BA] hover:text-white hover:border-transparent';
    }

    return 'bg-gradient-to-t from-[#FEBEFA] via-[#B339D4] to-[#7B21BA] text-white';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex justify-center items-center gap-2 rounded-lg font-inter font-semibold leading-6 tracking-[-0.32px]
        transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
