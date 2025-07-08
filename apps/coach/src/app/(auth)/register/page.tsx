'use client';

import { RegisterForm } from '@nlc-ai/auth';
import {useRouter} from "next/navigation";

export default function CoachRegisterPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleAccountVerification = (email: string) => {
    router.push(`/account-verification?email=${encodeURIComponent(email)}`);
  }

  return (
    <RegisterForm
      handleSignIn={handleSignIn}
      handleAccountVerification={handleAccountVerification}
      showGoogleAuth={true}/>
  );
}
