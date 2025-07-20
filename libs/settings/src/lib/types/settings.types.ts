import {ReactNode} from "react";
import {Integration} from "@nlc-ai/types";

export interface BaseIntegration {
  id: string;
  name: string;
  platform: string;
  isActive: boolean;
  isConnected: boolean;
  lastSyncAt?: Date;
  syncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialIntegration extends Integration {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  profileData?: {
    username?: string;
    profileUrl?: string;
    followerCount?: number;
    profilePictureUrl?: string;
  };
}

export interface CourseIntegration extends BaseIntegration {
  apiKey?: string;
  subdomain?: string;
  webhookSecret?: string;
  config?: Record<string, any>;
}

export interface EmailProvider extends BaseIntegration {
  type: 'smtp' | 'mailgun' | 'sendgrid' | 'ses';
  isDefault: boolean;
  config: {
    // SMTP Config
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;

    // Mailgun Config
    apiKey?: string;
    domain?: string;
    baseUrl?: string;

    // SendGrid Config
    sendgridApiKey?: string;

    // SES Config
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  fromEmail: string;
  fromName: string;
}

export interface CalendlyIntegration extends BaseIntegration {
  accessToken?: string;
  userUri?: string;
  organizationUri?: string;
  schedulingUrl?: string;
  userName?: string;
  userEmail?: string;
}

export interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  lastSyncDate?: Date;
  syncErrors: number;
}

export interface SettingsTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userType: 'admin' | 'coach';
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string; // Coach only
  businessName?: string; // Coach only
  phone?: string;
  websiteUrl?: string;
  timezone?: string;
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  businessName?: string;
  phone?: string;
  websiteUrl?: string;
  newPassword?: string;
  confirmPassword?: string;
  photo?: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'twitter' | 'tiktok' | 'linkedin' | 'calendly';
export type CoursePlatform = 'kajabi' | 'skool' | 'thinkific' | 'teachable';

export interface SocialPlatformConfig {
  name: string;
  icon: ReactNode;
  color: string;
}

export interface CoursePlatformConfig {
  name: string;
  icon: string;
  color: string;
  fields: {
    name: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
    required: boolean;
  }[];
}

export interface SettingsContextType {
  user: any;
  userType: 'admin' | 'coach';
  isLoading: boolean;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  refreshProfile: () => Promise<void>;
}
