'use client';

import { LoginForm } from "@nlc-ai/auth";

export default function CoachLoginPage() {
  return (
    <LoginForm
      showSignUp={true}
      showGoogleAuth={true}
      showRememberMe={true}
    />
  );
}
