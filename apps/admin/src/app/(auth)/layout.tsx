'use client';

import {ReactNode} from "react";
import { AuthLayout, AuthLayoutProvider } from '@nlc-ai/auth';

export default function AdminAuthLayout({ children }: {
  children: ReactNode;
}) {
  return (
    <AuthLayoutProvider>
      <AuthLayout>
        {children}
      </AuthLayout>
    </AuthLayoutProvider>
  );
}
