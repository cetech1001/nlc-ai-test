import { BaseAPI } from './base';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status: 'contacted' | 'scheduled' | 'converted' | 'unresponsive';
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
  lastContactedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface PaginatedLeadsResponse {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class LeadsAPI extends BaseAPI {
  async getLeads(
    page = 1,
    limit = 10,
    filters: LeadFilters = {},
    search = ''
  ): Promise<PaginatedLeadsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);

    // Handle status filter
    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    // Handle source filter (array to comma-separated string)
    if (filters.source && Array.isArray(filters.source) && filters.source.length > 0) {
      params.append('source', filters.source.join(','));
    }

    // Handle date range filters
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.append('startDate', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('endDate', filters.dateRange.end);
      }
    }

    // Handle meeting date range filters
    if (filters.meetingDateRange) {
      if (filters.meetingDateRange.start) {
        params.append('meetingStartDate', filters.meetingDateRange.start);
      }
      if (filters.meetingDateRange.end) {
        params.append('meetingEndDate', filters.meetingDateRange.end);
      }
    }

    return this.makeRequest(`/leads?${params.toString()}`);
  }

  async getLead(id: string): Promise<Lead> {
    return this.makeRequest(`/leads/${id}`);
  }

  async createLead(data: CreateLeadRequest): Promise<Lead> {
    return this.makeRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(id: string, data: UpdateLeadRequest): Promise<Lead> {
    return this.makeRequest(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeadStats(): Promise<{
    total: number;
    contacted: number;
    scheduled: number;
    converted: number;
    unresponsive: number;
    conversionRate: number;
  }> {
    return this.makeRequest('/leads/stats');
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    return this.makeRequest(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const leadsAPI = new LeadsAPI();
