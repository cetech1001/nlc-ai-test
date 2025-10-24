import { FC } from 'react';
import { SettingsProvider, useSettings } from '../context/settings.context';
import { SettingsTabs } from './settings-tabs';
import { AlertMessages } from './alert-messages';
import { ProfileSection } from './profile-section';
import { SocialIntegrations } from './social-integrations';
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
  uploadAvatar: (data: string) => Promise<void>;
}

const SettingsContent: FC<SettingsProps> = ({
  userType,
  sdkClient,
  activeTab,
  handleTabChange,
  updateProfile,
  updatePassword,
  uploadAvatar,
}) => {
  const { error, success, refreshProfile } = useSettings();

  const handleUpdateProfile = async (data: ProfileFormData) => {
    await updateProfile(data);
    await refreshProfile();
  };

  const handleUpdatePassword = async (data: PasswordFormData) => {
    await updatePassword(data);
  };

  const handleUploadAvatar = async (data: string) => {
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
          sdkClient={sdkClient}
          onUpdateProfile={handleUpdateProfile}
          onUpdatePassword={handleUpdatePassword}
          onUploadAvatar={handleUploadAvatar}
        />
      )}

      {activeTab === 'integrations' && (
        <SocialIntegrations
          userType={userType}
          sdkClient={sdkClient}
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
