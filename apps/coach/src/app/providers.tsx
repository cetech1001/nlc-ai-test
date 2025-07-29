'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {ReactNode, useState} from 'react';
import { Sonner, TooltipProvider } from '@nlc-ai/ui';

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
