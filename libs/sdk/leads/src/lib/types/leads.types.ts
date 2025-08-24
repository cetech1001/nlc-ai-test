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
  answers?: Record<string, unknown>;
  qualified?: boolean;
  submittedAt?: Date;
  lastContactedAt?: Date;
  convertedAt?: Date;
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

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  meetingStartDate?: string;
  meetingEndDate?: string;
  coachID?: string;
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
  originalID: string;
}
