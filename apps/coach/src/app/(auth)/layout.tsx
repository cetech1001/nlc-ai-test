'use client';

import {ReactNode, useEffect} from "react";
import { AuthLayout, AuthLayoutProvider } from '@nlc-ai/auth';
import {AuthSkeleton} from "@nlc-ai/ui";
import {useRouter} from "next/navigation";
import {useAuth} from "@nlc-ai/auth";

const CoachAuthLayout = ({ children }: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthSkeleton/>;
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

export default CoachAuthLayout;
