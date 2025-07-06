import { BaseAPI } from './base-api';
import {
  Coach,
  CoachDetail,
  CoachFilters,
  CoachKpis,
  CoachStats,
  CoachStatus,
  PaginatedCoachesResponse,
  RecentCoach
} from "@nlc-ai/types";

class CoachesAPI extends BaseAPI {
  /**
   * Get all coaches with advanced filtering
   */
  async getCoaches(
    page = 1,
    limit = 10,
    status?: CoachStatus,
    search?: string,
    additionalFilters?: Omit<CoachFilters, 'status' | 'search'>
  ): Promise<PaginatedCoachesResponse> {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (status) params.append('status', status);
    if (search) params.append('search', search);

    // Handle additional filters
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            // For subscriptionPlan array, join with commas
            params.append(key, value.join(','));
          } else if (typeof value === 'boolean') {
            params.append(key, value.toString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return this.makeRequest(`/coaches?${params.toString()}`);
  }

  /**
   * Advanced filtering method that handles your filter component values
   */
  async getCoachesWithFilters(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
    search = ''
  ): Promise<PaginatedCoachesResponse> {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    // Handle filter values from your filter component
    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
    }

    if (filters.subscriptionPlan && Array.isArray(filters.subscriptionPlan) && filters.subscriptionPlan.length > 0) {
      params.append('subscriptionPlan', filters.subscriptionPlan.join(','));
    }

    if (filters.dateJoined) {
      if (filters.dateJoined.start) {
        params.append('dateJoinedStart', filters.dateJoined.start);
      }
      if (filters.dateJoined.end) {
        params.append('dateJoinedEnd', filters.dateJoined.end);
      }
    }

    if (filters.lastActive) {
      if (filters.lastActive.start) {
        params.append('lastActiveStart', filters.lastActive.start);
      }
      if (filters.lastActive.end) {
        params.append('lastActiveEnd', filters.lastActive.end);
      }
    }

    if (filters.isVerified && filters.isVerified !== '') {
      params.append('isVerified', filters.isVerified);
    }

    return this.makeRequest(`/coaches?${params.toString()}`);
  }

  /**
   * Get coach statistics
   */
  async getCoachStats(): Promise<CoachStats> {
    return this.makeRequest('/coaches/stats');
  }

  /**
   * Get recent coaches for dashboard
   */
  async getRecentCoaches(limit = 6): Promise<RecentCoach[]> {
    return this.makeRequest(`/coaches/recent?limit=${limit}`);
  }

  /**
   * Get inactive coaches (30+ days without login)
   */
  async getInactiveCoaches(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<PaginatedCoachesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('status', 'inactive');

    if (search) params.append('search', search);

    return this.makeRequest(`/coaches?${params.toString()}`);
  }

  /**
   * Get a specific coach by ID
   */
  async getCoach(id: string): Promise<CoachDetail> {
    return this.makeRequest(`/coaches/${id}`);
  }

  /**
   * Get coach KPIs
   */
  async getCoachKpis(id: string, days = 30): Promise<CoachKpis> {
    return this.makeRequest(`/coaches/${id}/kpis?days=${days}`);
  }

  /**
   * Toggle coach status (block/unblock)
   */
  async toggleCoachStatus(id: string): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  /**
   * Deactivate coach (soft delete)
   */
  async deleteCoach(id: string): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update coach information
   */
  async updateCoach(id: string, data: Partial<Coach>): Promise<Coach> {
    return this.makeRequest(`/coaches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Create a new coach
   */
  async createCoach(data: Omit<Coach, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Coach> {
    return this.makeRequest('/coaches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const coachesAPI = new CoachesAPI();
