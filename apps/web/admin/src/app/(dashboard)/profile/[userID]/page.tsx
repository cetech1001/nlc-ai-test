'use client';

import { useParams } from 'next/navigation';
import { AboutPage } from '@nlc-ai/web-shared';
import { sdkClient } from '@/lib';
import { UserType } from '@nlc-ai/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const AdminProfilePage = () => {
  const params = useParams();
  const userID = params.userID as string;
  const [userType, setUserType] = useState<UserType>(UserType.COACH);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectUserType = async () => {
      try {
        // Try to fetch as coach first
        const coachProfile = await sdkClient.users.profiles.lookupUserProfile(userID, UserType.COACH);
        if (coachProfile) {
          setUserType(UserType.COACH);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Not a coach, try client
        try {
          const clientProfile = await sdkClient.users.profiles.lookupUserProfile(userID, UserType.CLIENT);
          if (clientProfile) {
            setUserType(UserType.CLIENT);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          toast.error('Failed to load profile');
          setIsLoading(false);
        }
      }
    };

    if (userID) {
      detectUserType();
    }
  }, [userID]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <AboutPage
        sdkClient={sdkClient}
        userID={userID}
        userType={userType}
      />
    </div>
  );
};

export default AdminProfilePage;
