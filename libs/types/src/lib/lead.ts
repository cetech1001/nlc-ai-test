import {Coach} from "./coach";

export enum LeadType {
  COACH_LEAD = 'coach_lead',
  ADMIN_LEAD = 'admin_lead'
}

export interface Lead {
  id: string;
  coachID?: string | null;
  leadType: LeadType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  status: string;
  meetingDate?: Date | null;
  meetingTime?: string | null;
  notes?: string | null;
  lastContactedAt?: Date | null;
  convertedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach | null;
}
