'use client';

import { FC, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout, AuthLayoutProvider, useAuth, AuthSkeleton } from '@nlc-ai/auth';
import {CookiesProvider} from "react-cookie";

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
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <AuthLayoutProvider>
        <AuthLayout>
          {children}
        </AuthLayout>
      </AuthLayoutProvider>
    </CookiesProvider>
  );
}

export default AdminAuthLayout;
