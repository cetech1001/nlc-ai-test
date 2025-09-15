import { FC } from 'react';
import { SettingsProvider, useSettings } from '../context/settings.context';
import { SettingsTabs } from './settings-tabs';
import { AlertMessages } from './alert-messages';
import { ProfileSection } from './profile-section';
import { AdminIntegrations } from './admin/admin-integrations';
import { SocialIntegrations } from './coach/social-integrations';
import { CourseIntegrations } from './coach/course-integrations';
import { ProfileFormData, PasswordFormData } from '../types/settings.types';
import {UserType} from "@nlc-ai/types";
import {NLCClient} from "@nlc-ai/sdk-main";


interface SettingsProps {
  userType: UserType;
  activeTab: string;
  sdkClient: NLCClient;
  handleTabChange: (tabID: string) => void;

  // Profile functions
  getProfile: () => Promise<any>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  updatePassword: (data: PasswordFormData) => Promise<void>;
  uploadAvatar: (data: FormData) => Promise<void>;

  // Admin integration functions
  saveCalendlySettings?: (accessToken: string) => Promise<any>;
  deleteCalendlySettings?: () => Promise<any>;
  testCalendlyConnection?: () => Promise<void>;
  saveEmailProvider?: (provider: any) => Promise<any>;
  deleteEmailProvider?: (id: string) => Promise<any>;
  setDefaultEmailProvider?: (id: string) => Promise<any>;
  testEmailProvider?: (id: string) => Promise<void>;
  getCalendlySettings?: () => Promise<any>;
  getEmailProviders?: () => Promise<any[]>;

  // Coach integration functions
  connectSocial?: (platform: any, authData: any) => Promise<any>;
  disconnectSocial?: (integrationId: string) => Promise<void>;
  testSocial?: (integrationId: string) => Promise<void>;
  connectCourse?: (platform: any, credentials: any) => Promise<any>;
  disconnectCourse?: (integrationId: string) => Promise<void>;
  testCourse?: (integrationId: string) => Promise<void>;
  updateCourse?: (integrationId: string, data: any) => Promise<any>;
  getSocialIntegrations?: () => Promise<any[]>;
  getCourseIntegrations?: () => Promise<any[]>;

  // Coach Calendly (different from admin)
  saveCoachCalendly?: (accessToken: string) => Promise<any>;
  deleteCoachCalendly?: () => Promise<any>;
  testCoachCalendly?: () => Promise<void>;
  getCoachCalendlySettings?: () => Promise<any>;
}

const SettingsContent: FC<SettingsProps> = ({
  userType,
  sdkClient,
  activeTab,
  handleTabChange,
  updateProfile,
  updatePassword,
  uploadAvatar,

  // Admin functions
  saveCalendlySettings,
  deleteCalendlySettings,
  testCalendlyConnection,
  saveEmailProvider,
  deleteEmailProvider,
  setDefaultEmailProvider,
  testEmailProvider,
  getCalendlySettings,
  getEmailProviders,

  // Coach functions
  connectSocial,
  disconnectSocial,
  testSocial,
  connectCourse,
  disconnectCourse,
  testCourse,
  updateCourse,
  getSocialIntegrations,
  getCourseIntegrations,
  saveCoachCalendly,
  deleteCoachCalendly,
  testCoachCalendly,
  getCoachCalendlySettings,
}) => {
  const { error, success, refreshProfile } = useSettings();

  const handleUpdateProfile = async (data: ProfileFormData) => {
    await updateProfile(data);
    await refreshProfile();
  };

  const handleUpdatePassword = async (data: PasswordFormData) => {
    await updatePassword(data);
  };

  const handleUploadAvatar = async (data: FormData) => {
    await uploadAvatar(data);
    await refreshProfile();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black overflow-hidden">
      <AlertMessages success={success} error={error} />

      <SettingsTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userType={userType}
      />

      {activeTab === 'profile' && (
        <ProfileSection
          onUpdateProfile={handleUpdateProfile}
          onUpdatePassword={handleUpdatePassword}
          onUploadAvatar={handleUploadAvatar}
        />
      )}

      {activeTab === 'integrations' && userType === 'admin' && (
        <AdminIntegrations
          onSaveCalendly={saveCalendlySettings!}
          onDeleteCalendly={deleteCalendlySettings!}
          onTestCalendly={testCalendlyConnection!}
          onSaveEmailProvider={saveEmailProvider!}
          onDeleteEmailProvider={deleteEmailProvider!}
          onSetDefaultEmailProvider={setDefaultEmailProvider!}
          onTestEmailProvider={testEmailProvider!}
          getCalendlySettings={getCalendlySettings!}
          getEmailProviders={getEmailProviders!}
        />
      )}

      {activeTab === 'integrations' && userType === 'coach' && (
        <SocialIntegrations
          sdkClient={sdkClient}
        />
      )}

      {activeTab === 'courses' && userType === 'coach' && (
        <CourseIntegrations
          onConnectCourse={connectCourse!}
          onDisconnectCourse={disconnectCourse!}
          onTestCourse={testCourse!}
          onUpdateCourse={updateCourse!}
          getCourseIntegrations={getCourseIntegrations!}
        />
      )}
    </div>
  );
};

export const Settings: FC<SettingsProps> = (props) => {
  return (
    <SettingsProvider userType={props.userType} getProfile={props.getProfile}>
      <SettingsContent {...props} />
    </SettingsProvider>
  );
};
