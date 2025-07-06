'use client';

import { LoginForm, useAuthPage } from '@nlc-ai/auth';


export default function AdminLoginPage() {
  useAuthPage({
    title: 'Admin Login',
    description: 'Enter your credentials to access the admin panel.',
  });

  return (
    <LoginForm
      showSignUp={false}
      showGoogleAuth={false}
      showRememberMe={true}
    />
  );
}
