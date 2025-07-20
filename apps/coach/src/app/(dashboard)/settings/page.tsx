'use client'

import { Settings } from "@nlc-ai/settings";
import { authAPI } from "@nlc-ai/auth";
import { integrationsAPI } from "@nlc-ai/api-client";
import { coachCalendlyAPI } from "@nlc-ai/api-client";
import { PasswordFormData, UpdateProfileRequest } from "@nlc-ai/types";

const CoachSettings = () => {
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

  // Coach Calendly Handlers
  const handleSaveCoachCalendly = async (accessToken: string) => {
    return coachCalendlyAPI.saveCalendlySettings(accessToken);
  }

  const handleDeleteCoachCalendly = async () => {
    await coachCalendlyAPI.deleteCalendlySettings();
  }

  const handleTestCoachCalendly = async () => {
    await coachCalendlyAPI.testCalendlyConnection();
  }

  const getCoachCalendlySettings = () => {
    return coachCalendlyAPI.getCalendlySettings();
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
      getProfile={getProfile}
      updateProfile={handleUpdateProfile}
      updatePassword={handleUpdatePassword}
      uploadAvatar={handleAvatarUpload}

      // Social integration props
      connectSocial={handleConnectSocial}
      disconnectSocial={handleDisconnectSocial}
      testSocial={handleTestSocial}
      getSocialIntegrations={getSocialIntegrations}

      // Coach Calendly props
      saveCoachCalendly={handleSaveCoachCalendly}
      deleteCoachCalendly={handleDeleteCoachCalendly}
      testCoachCalendly={handleTestCoachCalendly}
      getCoachCalendlySettings={getCoachCalendlySettings}

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
