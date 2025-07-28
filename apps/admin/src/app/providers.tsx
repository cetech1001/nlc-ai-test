'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sonner, TooltipProvider } from '@nlc-ai/ui';
import {ReactNode, useState} from 'react';
import {CookiesProvider} from "react-cookie";


interface IProps {
  children: ReactNode;
}

export function Providers({ children }: IProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </CookiesProvider>
  );
}
