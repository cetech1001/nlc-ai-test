import {CommunityType, CommunityVisibility} from "@nlc-ai/sdk-community";

export interface CreateCommunityForm {
  name: string;
  description: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  coachID: string;
  courseID: string;
  avatarUrl: string;
  bannerUrl: string;
  isPaid: boolean;
  monthlyPrice: string;
  settings: {
    allowMemberPosts: boolean;
    requireApproval: boolean;
    allowFileUploads: boolean;
    maxPostLength: number;
    allowPolls: boolean;
    allowEvents: boolean;
    moderationLevel: string;
  };
}

export interface CommunityFormErrors {
  name?: string;
  description?: string;
  coachID?: string;
  courseID?: string;
  monthlyPrice?: string;
  maxPostLength?: string;
  general?: string;
}
