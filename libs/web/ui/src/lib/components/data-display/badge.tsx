'use client'

import {FC, ReactNode} from 'react';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: ReactNode;
}

const badgeVariants = {
  default: 'bg-purple-600/20 text-purple-400 border border-purple-600/30',
  secondary: 'bg-gray-600/20 text-gray-400 border border-gray-600/30',
  destructive: 'bg-red-600/20 text-red-400 border border-red-600/30',
  outline: 'border border-stone-600 text-stone-400 bg-transparent',
};

export const Badge: FC<BadgeProps> = ({
                                              variant = 'default',
                                              className = '',
                                              children
                                            }) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantClasses = badgeVariants[variant];

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
