import {CommunityPricing, CommunitySettings} from "@nlc-ai/types";
import {CommunityType, CommunityVisibility} from "./enums";

export interface CreateCommunityForm {
  name: string;
  description: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  slug: string;
  coachID: string;
  courseID: string;
  avatarUrl: string;
  bannerUrl: string;
  pricing: CommunityPricing;
  settings: CommunitySettings;
  isSystemCreated?: boolean;
}

export interface CommunityFormErrors {
  name?: string;
  description?: string;
  slug?: string;
  coachID?: string;
  courseID?: string;
  'pricing.amount'?: string;
  maxPostLength?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  general?: string;
}
