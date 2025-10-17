'use client';

import {ReactNode, useEffect} from "react";
import { AuthLayout, AuthLayoutProvider, useAuth, AuthSkeleton } from '@nlc-ai/web-auth';
import {useRouter} from "next/navigation";

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
