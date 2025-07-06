'use client';

import { ForgotPasswordForm, useAuthPage } from '@nlc-ai/auth';
import {USER_TYPE} from "@nlc-ai/types";

export default function AdminForgotPasswordPage() {
  useAuthPage({
    title: "Forgot Password",
    description: "Enter your registered email address & we'll send you code to reset your password.",
  });
  return (
    <ForgotPasswordForm userType={USER_TYPE.admin}/>
  );
}
