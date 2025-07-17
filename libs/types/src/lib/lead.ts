import {Coach} from "./coach";
import {QueryParams} from "./query-params";

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
  coachID?: string | null;
  leadType: LeadType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  status: LeadStatus;
  meetingDate?: Date | null;
  meetingTime?: string | null;
  notes?: string | null;
  lastContactedAt?: Date | null;
  convertedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach | null;
}

export interface LeadQueryParams extends QueryParams{
  status?: LeadStatus;
  source?: string;
  startDate?: string;
  endDate?: string;
  meetingStartDate?: string;
  meetingEndDate?: string;
}

export interface CreateLead extends Pick<Lead, 'firstName' | 'lastName' | 'email' | 'phone' | 'source' | 'meetingTime' | 'notes'> {
  meetingDate?: string;
  status?: LeadStatus;
}
export type UpdateLead = Partial<CreateLead>;

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

export interface LeadStats {
  total: number;
  contacted: number;
  scheduled: number;
  converted: number;
  unresponsive: number;
  conversionRate: number;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status?: string;
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {}

export interface LeadFilters {
  status?: string;
  source?: string[];
  dateRange?: { start: string | null; end: string | null };
  meetingDateRange?: { start: string | null; end: string | null };
}
