'use client'

import {Settings} from "@nlc-ai/settings";
import { authAPI } from "@nlc-ai/auth";
import {PasswordFormData, UpdateProfileRequest} from "@nlc-ai/types";

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

  return (
    <Settings
      userType="coach"
      getProfile={getProfile}
      updateProfile={handleUpdateProfile}
      updatePassword={handleUpdatePassword}
      uploadAvatar={handleAvatarUpload}
    />
  );
};

export default CoachSettings;
