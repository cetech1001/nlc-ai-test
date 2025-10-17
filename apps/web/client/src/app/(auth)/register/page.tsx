'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RegisterForm, useAuthPage } from '@nlc-ai/web-auth';
import { UserType } from "@nlc-ai/types";

const ClientRegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('token') || '';

  useAuthPage({
    title: 'Create Your Account',
    description: 'Complete your registration to start working with your coach.',
  });

  /*if (!inviteToken) {
    return (
      <div className="text-center py-8">
        <h2 className="text-white text-xl mb-4">Invalid Invitation</h2>
        <p className="text-stone-300 mb-6">
          This invitation link is invalid or has expired. Please contact your coach for a new invitation.
        </p>
      </div>
    );
  }*/

  const handleHome = () => {
    router.push('/home');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleAccountVerification = (email: string) => {
    router.push(`/account-verification?email=${encodeURIComponent(email)}&token=${inviteToken}`);
  };

  return (
    <RegisterForm
      userType={UserType.CLIENT}
      handleHome={handleHome}
      handleSignIn={handleSignIn}
      handleAccountVerification={handleAccountVerification}
      inviteToken={inviteToken}
      showGoogleAuth={true}
    />
  );
};

export default ClientRegisterPage;
