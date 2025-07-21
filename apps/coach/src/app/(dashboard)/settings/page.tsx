'use client'

import {useEffect, useState} from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings } from "@nlc-ai/settings";
import { authAPI } from "@nlc-ai/auth";
import { integrationsAPI } from "@nlc-ai/api-client";
import { PasswordFormData, UpdateProfileRequest } from "@nlc-ai/types";

const CoachSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');

  // Initialize active tab from URL parameters
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabID: string) => {
    setActiveTab(tabID);

    // Update URL parameters
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', tabID);

    // Use replace to avoid adding to history stack
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  };

  const handleUpdateProfile = async (payload: UpdateProfileRequest) => {
    await authAPI.updateProfile(payload);
  }

  const handleUpdatePassword = async (payload: PasswordFormData) => {
    await authAPI.updatePassword(payload);
  }

  const handleAvatarUpload = async (payload: FormData) => {
    await authAPI.uploadAvatar(payload)
  }

  const getProfile = () => {
    return authAPI.getProfile();
  }

  // Social Integration Handlers
  const handleConnectSocial = async (platform: string, authData: any) => {
    return integrationsAPI.connectSocial(platform, authData);
  }

  const handleDisconnectSocial = async (integrationId: string) => {
    await integrationsAPI.disconnectSocialIntegration(integrationId);
  }

  const handleTestSocial = async (integrationId: string) => {
    await integrationsAPI.testSocialIntegration(integrationId);
  }

  const getSocialIntegrations = () => {
    return integrationsAPI.getSocialIntegrations();
  }

  // Mock handlers for course integrations (to be implemented later)
  const handleConnectCourse = async (platform: string, credentials: any) => {
    // TODO: Implement course integrations API
    throw new Error('Course integrations not yet implemented');
  }

  const handleDisconnectCourse = async (integrationId: string) => {
    // TODO: Implement course integrations API
    throw new Error('Course integrations not yet implemented');
  }

  const handleTestCourse = async (integrationId: string) => {
    // TODO: Implement course integrations API
    throw new Error('Course integrations not yet implemented');
  }

  const handleUpdateCourse = async (integrationId: string, data: any) => {
    // TODO: Implement course integrations API
    throw new Error('Course integrations not yet implemented');
  }

  const getCourseIntegrations = async () => {
    // TODO: Implement course integrations API
    return [];
  }

  return (
    <Settings
      userType="coach"
      activeTab={activeTab}
      handleTabChange={handleTabChange}
      getProfile={getProfile}
      updateProfile={handleUpdateProfile}
      updatePassword={handleUpdatePassword}
      uploadAvatar={handleAvatarUpload}

      // Social integration props
      connectSocial={handleConnectSocial}
      disconnectSocial={handleDisconnectSocial}
      testSocial={handleTestSocial}
      getSocialIntegrations={getSocialIntegrations}

      // Course integration props (placeholder)
      connectCourse={handleConnectCourse}
      disconnectCourse={handleDisconnectCourse}
      testCourse={handleTestCourse}
      updateCourse={handleUpdateCourse}
      getCourseIntegrations={getCourseIntegrations}
    />
  );
};

export default CoachSettings;
