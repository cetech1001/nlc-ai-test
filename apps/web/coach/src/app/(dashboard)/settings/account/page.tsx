'use client'

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from 'next/navigation';
import {Settings} from "@nlc-ai/web-settings";
import {useAuth} from "@nlc-ai/web-auth";
import {PasswordFormData, UpdateProfileRequest, UserType} from "@nlc-ai/types";
import {DeleteAccountFlow, sdkClient} from '@/lib';

const CoachAccountSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabID: string) => {
    setActiveTab(tabID);

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', tabID);

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  };

  const handleUpdateProfile = async (payload: UpdateProfileRequest) => {
    await sdkClient.users.profiles.updateProfile(payload);
  }

  const handleUpdatePassword = async (payload: PasswordFormData) => {
    await sdkClient.users.profiles.updatePassword(payload);
  }

  const handleAvatarUpload = async (avatarUrl: string) => {
    await sdkClient.users.profiles.uploadAvatar(avatarUrl)
  }

  const getProfile = () => {
    return sdkClient.users.profiles.getMyProfile();
  }

  const handleDeleteAccount = async () => {
    try {
      // await authAPI.deleteAccount();
      // Clear any stored auth data and redirect
      logout();
      router.push('/auth/login');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete account');
    }
  };

  return (
    <div>
      <Settings
        userType={UserType.COACH}
        sdkClient={sdkClient}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        getProfile={getProfile}
        updateProfile={handleUpdateProfile}
        updatePassword={handleUpdatePassword}
        uploadAvatar={handleAvatarUpload}
      />

      {activeTab === 'profile' && (
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <DeleteAccountFlow onDeleteAccount={handleDeleteAccount} />
        </div>
      )}
    </div>
  );
};

export default CoachAccountSettings;
