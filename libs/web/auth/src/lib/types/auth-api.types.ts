import {UserType} from "@nlc-ai/api-types";

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    avatarUrl?: string;
    type: UserType
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}
