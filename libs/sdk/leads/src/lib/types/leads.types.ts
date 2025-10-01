import {Coach} from "@nlc-ai/sdk-users";


export enum LeadType {
  COACH_LEAD = 'coach_lead',
  ADMIN_LEAD = 'admin_lead'
}

export enum LeadStatus {
  CONTACTED = 'contacted',
  SCHEDULED = 'scheduled',
  CONVERTED = 'converted',
  UNRESPONSIVE = 'unresponsive',
}

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
  answers?: LeadAnswers;
  qualified?: boolean;
  submittedAt?: Date;
  lastContactedAt?: Date;
  convertedAt?: Date;
  coach?: Coach;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLead {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: 'contacted' | 'scheduled' | 'converted' | 'unresponsive';
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
}

export interface CreateLandingLead {
  lead: {
    name: string;
    email: string;
    phone?: string;
  };
  answers: Record<string, unknown>;
  qualified: boolean;
  submittedAt: string;
}

export interface UpdateLead {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: 'contacted' | 'scheduled' | 'converted' | 'unresponsive';
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
}

export interface LeadStats {
  total: number;
  contacted: number;
  scheduled: number;
  converted: number;
  unresponsive: number;
  disqualified: number;
  conversionRate: number;
  qualificationRate: number;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  meetingDate: string;
  meetingTime: string;
  notes: string;
}

export interface LeadFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
  general?: string;
}

export interface DataTableLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  meetingDate: string;
  lastContacted: string;
  rawStatus: string;
  answers?: Record<string, any>;
  qualified?: boolean;
  originalID: string;
}

export interface LeadQuestion {
  id: number;
  text: string;
  subtitle?: string;
  options?: LeadQuestionOption[];
  multiSelect?: boolean;
  textOnly?: boolean;
  placeholder?: string;
}

export interface LeadQuestionOption {
  text: string;
  value: string;
  disqualifies?: boolean;
  qualifies?: boolean;
  points?: number;
}

export type LeadAnswers = Record<number, string | string[]>;

export interface LeadInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
