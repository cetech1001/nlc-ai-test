'use client';

import { useIsMobile } from '@nlc-ai/ui';
import { useEffect, useState } from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
  breakpoint?: number;
}

export function ResponsiveWrapper({ children, mobileComponent, breakpoint = 768 }: ResponsiveWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>{children}</div>;
  }

  if (isMobile && mobileComponent) {
    return <div>{mobileComponent}</div>;
  }

  return <div>{children}</div>;
}
