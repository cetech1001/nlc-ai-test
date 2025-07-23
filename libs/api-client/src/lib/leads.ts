import { BaseAPI } from './base';
import {CreateLeadRequest, Lead, LeadFilters, UpdateLeadRequest} from "@nlc-ai/types";

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

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.source && Array.isArray(filters.source) && filters.source.length > 0) {
      params.append('source', filters.source.join(','));
    }

    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.append('startDate', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('endDate', filters.dateRange.end);
      }
    }

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

  /*async getCoachLeads(
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

    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.source && Array.isArray(filters.source) && filters.source.length > 0) {
      params.append('source', filters.source.join(','));
    }

    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.append('startDate', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('endDate', filters.dateRange.end);
      }
    }

    if (filters.meetingDateRange) {
      if (filters.meetingDateRange.start) {
        params.append('meetingStartDate', filters.meetingDateRange.start);
      }
      if (filters.meetingDateRange.end) {
        params.append('meetingEndDate', filters.meetingDateRange.end);
      }
    }

    return this.makeRequest(`/coach/leads?${params.toString()}`);
  }

  async getCoachLeadStats(): Promise<{
    total: number;
    contacted: number;
    scheduled: number;
    converted: number;
    unresponsive: number;
    conversionRate: number;
  }> {
    return this.makeRequest('/coach/leads/stats');
  }

  async createCoachLead(data: CreateLeadRequest): Promise<Lead> {
    return this.makeRequest('/coach/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoachLead(id: string, data: UpdateLeadRequest): Promise<Lead> {
    return this.makeRequest(`/coach/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCoachLead(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/coach/leads/${id}`, {
      method: 'DELETE',
    });
  }*/
}

export const leadsAPI = new LeadsAPI();
