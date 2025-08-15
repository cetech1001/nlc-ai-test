import { LeadStatus, LeadType } from './enums';

export interface Lead {
  id: string;
  coachID?: string;
  leadType: LeadType;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  meetingDate?: Date;
  meetingTime?: string;
  notes?: string;
  answers?: Record<string, unknown>;
  qualified?: boolean;
  submittedAt?: Date;
  lastContactedAt?: Date;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
