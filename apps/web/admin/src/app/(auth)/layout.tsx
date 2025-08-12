'use client';

import { FC, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout, AuthLayoutProvider, useAuth, AuthSkeleton } from '@nlc-ai/web-auth';

interface AuthLayoutProps {
  children: ReactNode;
}

const AdminAuthLayout: FC<AuthLayoutProps> = ({ children }) => {
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

export default AdminAuthLayout;
