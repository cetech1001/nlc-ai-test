'use client';

import { LoginForm, useAuthPage } from '@nlc-ai/auth';
import { USER_TYPE } from '@nlc-ai/types';


export default function AdminLoginPage() {
  useAuthPage({
    title: 'Admin Login',
    description: 'Enter your credentials to access the admin panel.',
  });

  return (
    <LoginForm
      userType={USER_TYPE.admin}
      showSignUp={false}
      showGoogleAuth={false}
      showRememberMe={true}
    />
  );
}
