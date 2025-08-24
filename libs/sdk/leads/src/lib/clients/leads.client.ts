import {BaseClient, FilterValues, SearchQuery} from '@nlc-ai/sdk-core';
import {
  Lead,
  CreateLead,
  UpdateLead,
  LeadStats,
} from '../types/leads.types';
import {Paginated} from "@nlc-ai/types";


export class LeadsServiceClient extends BaseClient {
  async getLeads(searchOptions: SearchQuery = {}, filters: FilterValues = {}): Promise<Paginated<Lead>> {
    const { page = 1, limit = 10, search } = searchOptions;
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

    const response = await this.request<Paginated<Lead>>(
      'GET',
      `?${params.toString()}`
    );
    return response.data!;
  }

  async getLeadStats(): Promise<LeadStats> {
    const response = await this.request<LeadStats>('GET', '/stats');
    return response.data!;
  }

  async getLead(id: string): Promise<Lead> {
    const response = await this.request<Lead>('GET', `/${id}`);
    return response.data!;
  }

  async createLead(data: CreateLead): Promise<Lead> {
    const response = await this.request<Lead>('POST', '', { body: data });
    return response.data!;
  }

  async updateLead(id: string, data: UpdateLead): Promise<Lead> {
    const response = await this.request<Lead>('PATCH', `/${id}`, { body: data });
    return response.data!;
  }

  async deleteLead(id: string): Promise<void> {
    await this.request('DELETE', `/${id}`);
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const response = await this.request<Lead>('PATCH', `/${id}/status`, {
      body: { status }
    });
    return response.data!;
  }

  async markLeadAsContacted(id: string, contactMethod: 'email' | 'phone' | 'meeting', notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('POST', `/${id}/contact`, {
      body: { contactMethod, notes }
    });
    return response.data!;
  }

  async scheduleLeadMeeting(id: string, meetingDate: string, meetingTime?: string): Promise<Lead> {
    const response = await this.request<Lead>('POST', `/${id}/schedule-meeting`, {
      body: { meetingDate, meetingTime }
    });
    return response.data!;
  }
}
