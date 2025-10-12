import {DateRange, QueryParams} from '../../query-params';
import {
  EmailThreadStatus,
  EmailThreadPriority,
} from './enums';
import { EmailAttachment } from './common';

export interface ThreadsQueryRequest extends QueryParams {
  coachID?: string;
  clientID?: string;
  leadID?: string;
  status?: EmailThreadStatus;
  priority?: EmailThreadPriority;
  isRead?: boolean;
  dateRange?: DateRange;
}

export interface ReplyToThreadRequest {
  threadID: string;
  messageID: string;
  text?: string;
  html?: string;
  templateID?: string;
  templateVariables?: Record<string, any>;
  attachments?: EmailAttachment[];
  scheduleFor?: string;
  replyToAll?: boolean;
}

export interface UpdateEmailThreadRequest {
  status?: EmailThreadStatus;
  priority?: EmailThreadPriority;
  isRead?: boolean;
  clientID?: string;
  leadID?: string;
}
