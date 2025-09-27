export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
    isVerified?: boolean;
    avatarUrl?: string;
    businessName?: string;
    role?: string;
    coaches?: Array<{
      coachID: string;
      coachName: string;
      businessName: string;
      isPrimary: string;
      status: string;
    }>,
    currentCoach?: {
      coachID: string;
      coachName: string;
      businessName: string;
    },
  };
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

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    timezone?: string;
    desktopNotifications?: boolean;
    emailNotifications?: boolean;
    businessName?: string;
    isVerified?: boolean;
    websiteUrl?: string;
    bio?: string;
    phone?: string;
    role?: string;
  };
}

export interface AvatarUploadResponse {
  message: string;
  avatarUrl: string;
}
