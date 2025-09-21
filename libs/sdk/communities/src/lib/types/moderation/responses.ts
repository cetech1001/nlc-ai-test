import { UserType } from '@nlc-ai/sdk-users';
import { ModerationStatus, ModerationPriority, ViolationType, ModerationActionType } from './enums';

export interface ModerationStats {
  pendingReports: number;
  totalFlags: number;
  actionsTaken: number;
  autoResolved: number;
  pendingReportsTrend?: number;
  totalFlagsTrend?: number;
  actionsTakenTrend?: number;
  autoResolvedTrend?: number;
}

export interface FlaggedContent {
  id: string;
  contentID: string;
  contentType: 'post' | 'comment' | 'message';
  content: string;
  authorID: string;
  authorName: string;
  authorType: UserType;
  communityID: string;
  status: ModerationStatus;
  priority: ModerationPriority;
  flagCount: number;
  reasons: ViolationType[];
  aiScore?: number;
  aiReason?: string;
  reportedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationAction {
  id: string;
  communityID: string;
  type: ModerationActionType;
  targetType: 'post' | 'comment' | 'message' | 'member';
  targetID: string;
  targetUser: string;
  targetInfo?: {
    title?: string;
    content?: string;
    authorName?: string;
  };
  moderator: {
    id: string;
    name: string;
    type: UserType;
  };
  reason: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ModerationRule {
  id: string;
  communityID: string;
  name: string;
  description: string;
  type: 'keyword' | 'ai' | 'pattern' | 'user_reports';
  conditions: Record<string, any>;
  actions: {
    autoFlag?: boolean;
    autoRemove?: boolean;
    requireReview?: boolean;
    notifyModerators?: boolean;
  };
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
