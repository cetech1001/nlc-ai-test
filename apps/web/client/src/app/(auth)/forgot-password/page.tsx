'use client';

import { ForgotPasswordForm, useAuthPage } from '@nlc-ai/web-auth';
import {UserType} from "@nlc-ai/types";
import {useRouter} from "next/navigation";

const AdminForgotPasswordPage = () => {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleAccountVerification = (email: string) => {
    router.push(`/account-verification?email=${encodeURIComponent(email)}`);
  }

  useAuthPage({
    title: "Forgot Password",
    description: "Enter your registered email address & we'll send you code to reset your password.",
  });
  return (
    <ForgotPasswordForm
      handleBackToLogin={handleBackToLogin}
      handleAccountVerification={handleAccountVerification}
      userType={UserType.CLIENT}/>
  );
}

export default AdminForgotPasswordPage;
