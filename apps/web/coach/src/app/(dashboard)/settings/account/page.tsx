'use client'

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from 'next/navigation';
import {Settings} from "@nlc-ai/web-settings";
import {authAPI, useAuth} from "@nlc-ai/web-auth";
import {coachesAPI, integrationsAPI} from "@nlc-ai/web-api-client";
import {PasswordFormData, UpdateProfileRequest, UserType} from "@nlc-ai/types";

const CoachSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
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
    await coachesAPI.updateCoach(user?.id || '', payload);
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

  // Social Integration Handlers
  const handleConnectSocial = async (platform: string, authData: any) => {
    return integrationsAPI.connectPlatform(platform, authData);
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
      return integrationsAPI.connectPlatform(platform, credentials);
    } catch (error) {
      console.error('Failed to connect course platform:', error);
      throw error;
    }
  };

  const handleDisconnectCourse = async (integrationId: string) => {
    try {
      await integrationsAPI.disconnectIntegration(integrationId);
    } catch (error) {
      console.error('Failed to disconnect course platform:', error);
      throw error;
    }
  };

  const handleTestCourse = async (integrationId: string) => {
    try {
      await integrationsAPI.testIntegration(integrationId);
    } catch (error) {
      console.error('Failed to test course platform:', error);
      throw error;
    }
  };

  const handleUpdateCourse = async (integrationId: string, data: any) => {
    try {
      // return integrationsAPI.updateIntegration(integrationId, data);
    } catch (error) {
      console.error('Failed to update course platform:', error);
      throw error;
    }
  };

  const getCourseIntegrations = async () => {
    try {
      const integrations = await integrationsAPI.getCourseIntegrations();
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
      userType={UserType.coach}
      activeTab={activeTab}
      handleTabChange={handleTabChange}
      getProfile={getProfile}
      updateProfile={handleUpdateProfile}
      updatePassword={handleUpdatePassword}
      uploadAvatar={handleAvatarUpload}

      connectSocial={handleConnectSocial}
      disconnectSocial={handleDisconnectSocial}
      testSocial={handleTestSocial}
      getSocialIntegrations={getSocialIntegrations}

      connectCourse={handleConnectCourse}
      disconnectCourse={handleDisconnectCourse}
      testCourse={handleTestCourse}
      updateCourse={handleUpdateCourse}
      getCourseIntegrations={getCourseIntegrations}
    />
  );
};

export default CoachSettings;
