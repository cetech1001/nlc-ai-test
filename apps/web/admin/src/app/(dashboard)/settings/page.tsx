'use client'

import {useEffect, useState} from "react";
import {PasswordFormData, UpdateProfileRequest, UserType} from "@nlc-ai/types";
import {Settings} from "@nlc-ai/web-settings";
import {useRouter, useSearchParams} from "next/navigation";
import {sdkClient} from "@/lib";


const AdminSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("profile");

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
    await sdkClient.users.profiles.updatePassword({ newPassword: payload.newPassword });
  }

  const handleAvatarUpload = async (payload: string) => {
    await sdkClient.users.profiles.uploadAvatar(payload)
  }

  const getProfile = () => {
    return sdkClient.users.profiles.getMyProfile();
  }

  return (
    <Settings
      userType={UserType.ADMIN}
      sdkClient={sdkClient}
      activeTab={activeTab}
      handleTabChange={handleTabChange}
      getProfile={getProfile}
      updateProfile={handleUpdateProfile}
      updatePassword={handleUpdatePassword}
      uploadAvatar={handleAvatarUpload}
    />
  );
}

export default AdminSettings;
