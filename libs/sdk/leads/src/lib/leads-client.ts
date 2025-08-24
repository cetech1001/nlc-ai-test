import { BaseClient } from '@nlc-ai/sdk-core';
import {
  Lead,
  CreateLead,
  UpdateLead,
  LeadQueryParams,
  LeadStats,
} from './leads.types';
import {Paginated} from "@nlc-ai/types";


export class LeadsServiceClient extends BaseClient {
  async getLeads(params?: LeadQueryParams): Promise<Paginated<Lead>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'source' && Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const response = await this.request<Paginated<Lead>>(
      'GET',
      `/leads?${searchParams}`
    );
    return response.data!;
  }

  async getLeadStats(): Promise<LeadStats> {
    const response = await this.request<LeadStats>('GET', '/leads/stats');
    return response.data!;
  }

  async getLead(id: string): Promise<Lead> {
    const response = await this.request<Lead>('GET', `/leads/${id}`);
    return response.data!;
  }

  async createLead(data: CreateLead): Promise<Lead> {
    const response = await this.request<Lead>('POST', '/leads', { body: data });
    return response.data!;
  }

  async updateLead(id: string, data: UpdateLead): Promise<Lead> {
    const response = await this.request<Lead>('PATCH', `/leads/${id}`, { body: data });
    return response.data!;
  }

  async deleteLead(id: string): Promise<void> {
    await this.request('DELETE', `/leads/${id}`);
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const response = await this.request<Lead>('PATCH', `/leads/${id}/status`, {
      body: { status }
    });
    return response.data!;
  }

  async markLeadAsContacted(id: string, contactMethod: 'email' | 'phone' | 'meeting', notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('POST', `/leads/${id}/contact`, {
      body: { contactMethod, notes }
    });
    return response.data!;
  }

  async scheduleLeadMeeting(id: string, meetingDate: string, meetingTime?: string): Promise<Lead> {
    const response = await this.request<Lead>('POST', `/leads/${id}/schedule-meeting`, {
      body: { meetingDate, meetingTime }
    });
    return response.data!;
  }
}
