import {UserProfile} from "../users";

export interface AuthResponse {
  access_token: string;
  user: UserProfile;
  isNewUser?: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface VerificationResponse {
  message: string;
  resetToken?: string;
  verified?: boolean;
  access_token?: string;
}

export interface AvatarUploadResponse {
  message: string;
  avatarUrl: string;
}
