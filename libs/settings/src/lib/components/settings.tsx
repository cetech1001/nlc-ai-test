import { FC, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SettingsProvider, useSettings } from '../context/settings.context';
import { SettingsTabs } from './settings-tabs';
import { AlertMessages } from './alert-messages';
import { ProfileSection } from './profile-section';
import { AdminIntegrations } from './admin/admin-integrations';
import { SocialIntegrations } from './coach/social-integrations';
import { CourseIntegrations } from './coach/course-integrations';
import { ProfileFormData, PasswordFormData } from '../types/settings.types';

interface SettingsProps {
  userType: 'admin' | 'coach';

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
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Update URL parameters
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', tabId);

    // Use replace to avoid adding to history stack
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  };

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
          onConnectSocial={connectSocial!}
          onDisconnectSocial={disconnectSocial!}
          onTestSocial={testSocial!}
          onSaveCalendly={saveCoachCalendly!}
          onDeleteCalendly={deleteCoachCalendly!}
          onTestCalendly={testCoachCalendly!}
          getSocialIntegrations={getSocialIntegrations!}
          getCalendlySettings={getCoachCalendlySettings!}
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
