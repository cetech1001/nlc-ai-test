'use client';

import {ReactNode, useEffect} from "react";
import { AuthLayout, AuthLayoutProvider } from '@nlc-ai/auth';
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/hooks/use-auth";

export default function AdminAuthLayout({ children }: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayoutProvider>
      <AuthLayout>
        {children}
      </AuthLayout>
    </AuthLayoutProvider>
  );
}
