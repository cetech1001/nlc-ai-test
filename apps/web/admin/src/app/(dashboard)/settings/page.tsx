'use client'

import {useEffect, useState} from "react";
import { authAPI } from "@nlc-ai/web-auth";
import {PasswordFormData, UpdateProfileRequest, UserType} from "@nlc-ai/types";
import {Settings} from "@nlc-ai/web-settings";
import {useRouter, useSearchParams} from "next/navigation";
import {calendlyAPI} from "@nlc-ai/web-api-client";
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
    await authAPI.updateProfile(payload);
  }

  const handleUpdatePassword = async (payload: PasswordFormData) => {
    await authAPI.updatePassword({ newPassword: payload.newPassword });
  }

  const handleAvatarUpload = async (payload: FormData) => {
    await authAPI.uploadAvatar(payload)
  }

  const getProfile = () => {
    return authAPI.getProfile();
  }

  const loadCalendlySettings = async () => {
    return calendlyAPI.getSettings();
  };

  const handleCalendlyConnect = async (accessToken: string) => {
    return calendlyAPI.saveSettings(accessToken);
  };

  const handleCalendlyDisconnect = async () => {
    return calendlyAPI.deleteSettings();
  };

  const testConnection = async () => {
    await calendlyAPI.getCurrentUser();
  };

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

      saveCalendlySettings={handleCalendlyConnect}
      deleteCalendlySettings={handleCalendlyDisconnect}
      testCalendlyConnection={testConnection}
      getCalendlySettings={loadCalendlySettings}
    />
  );
}

export default AdminSettings;
