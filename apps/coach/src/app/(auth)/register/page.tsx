'use client';

import { RegisterForm, useAuthPage } from '@nlc-ai/web-auth';
import {useRouter} from "next/navigation";

const CoachRegisterPage = () => {
  const router = useRouter();

  useAuthPage({
    title: 'Create An Account',
    description: 'Enter following details to create your account.',
  });

  const handleHome = () => {
    router.push('/home');
  }

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleAccountVerification = (email: string) => {
    router.push(`/account-verification?email=${encodeURIComponent(email)}`);
  }

  return (
    <RegisterForm
      handleHome={handleHome}
      handleSignIn={handleSignIn}
      handleAccountVerification={handleAccountVerification}
      showGoogleAuth={true}/>
  );
}

export default CoachRegisterPage;
