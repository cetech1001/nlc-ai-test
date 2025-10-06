import {LeadStatus} from "./enums";

export interface CreateLead {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: LeadStatus;
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
}

export interface CreateLeadRequest extends CreateLead {
  coachID?: string;
}

export interface CreateLandingLead {
  lead: {
    name: string;
    email: string;
    phone?: string;
    marketingOptIn: boolean;
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
  status?: LeadStatus;
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  meetingStartDate?: string;
  meetingEndDate?: string;
  coachID?: string;
}
