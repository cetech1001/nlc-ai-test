import { ModerationStatus, ModerationPriority, ViolationType } from './enums';

export interface ModerationFilters {
  status?: ModerationStatus;
  priority?: ModerationPriority;
  contentType?: 'post' | 'comment' | 'message';
  violationType?: ViolationType[];
  flagCount?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  page?: number;
  limit?: number;
}

export interface ModerationActionFilters {
  type?: string;
  targetType?: 'post' | 'comment' | 'message' | 'member';
  moderatorID?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  page?: number;
  limit?: number;
}

export interface ModerationActionRequest {
  action: 'approve' | 'remove' | 'dismiss' | 'warn' | 'suspend' | 'ban';
  reason: string;
  duration?: number; // For temporary actions like suspensions
  notifyUser?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateModerationRuleRequest {
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
  isEnabled?: boolean;
}

export interface UpdateModerationRuleRequest {
  name?: string;
  description?: string;
  conditions?: Record<string, any>;
  actions?: {
    autoFlag?: boolean;
    autoRemove?: boolean;
    requireReview?: boolean;
    notifyModerators?: boolean;
  };
  isEnabled?: boolean;
}
