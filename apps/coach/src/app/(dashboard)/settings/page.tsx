'use client'

import {useEffect, useState} from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings } from "@nlc-ai/settings";
import { authAPI, useAuth } from "@nlc-ai/auth";
import {coachesAPI, integrationsAPI} from "@nlc-ai/api-client";
import { PasswordFormData, UpdateProfileRequest } from "@nlc-ai/types";

const CoachSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
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
    await coachesAPI.updateCoach(user?.id || '', payload);
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
    return integrationsAPI.connectSocialPlatform(platform, authData);
  }

  const handleDisconnectSocial = async (integrationId: string) => {
    await integrationsAPI.disconnectIntegration(integrationId);
  }

  const handleTestSocial = async (integrationId: string) => {
    await integrationsAPI.testIntegration(integrationId);
  }

  const getSocialIntegrations = () => {
    return integrationsAPI.getSocialIntegrations();
  }

  const handleConnectCourse = async (platform: string, credentials: any) => {
    try {
      const result = await integrationsAPI.connectCoursePlatform(platform, credentials);
      // Add any custom logic here (analytics, notifications, etc.)
      return result;
    } catch (error) {
      console.error('Failed to connect course platform:', error);
      throw error;
    }
  };

  const handleDisconnectCourse = async (integrationId: string) => {
    try {
      await integrationsAPI.disconnectIntegration(integrationId);
      // Add any custom logic here
    } catch (error) {
      console.error('Failed to disconnect course platform:', error);
      throw error;
    }
  };

  const handleTestCourse = async (integrationId: string) => {
    try {
      await integrationsAPI.testIntegration(integrationId);
      // Add any custom logic here
    } catch (error) {
      console.error('Failed to test course platform:', error);
      throw error;
    }
  };

  const handleUpdateCourse = async (integrationId: string, data: any) => {
    try {
      const result = await integrationsAPI.updateIntegration(integrationId, data);
      // Add any custom logic here
      return result;
    } catch (error) {
      console.error('Failed to update course platform:', error);
      throw error;
    }
  };

  const getCourseIntegrations = async () => {
    try {
      const integrations = await integrationsAPI.getCourseIntegrations();
      // Transform data if needed
      return integrations.map(integration => ({
        ...integration,
        name: integration.config?.name || integration.platformName,
        platform: integration.platformName,
        isConnected: integration.isActive
      }));
    } catch (error) {
      console.error('Failed to get course integrations:', error);
      throw error;
    }
  };

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
