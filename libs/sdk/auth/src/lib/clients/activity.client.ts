import { BaseClient } from "@nlc-ai/sdk-core";

interface ActivityHeatmapData {
  date: string;
  count: number;
}

interface LoginStats {
  totalLogins: number;
  recentLogins: number;
  lastLoginAt?: Date;
}

export class ActivityClient extends BaseClient {
  async getMyHeatmap(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = `/heatmap${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<{ data: ActivityHeatmapData[] }>('GET', endpoint);
    return response.data!.data;
  }

  async getUserHeatmap(userID: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = `/heatmap/${userID}${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<{ data: ActivityHeatmapData[] }>('GET', endpoint);
    return response.data!.data;
  }

  async getMyStats() {
    const response = await this.request<LoginStats>('GET', '/stats');
    return response.data!;
  }

  async getUserStats(userID: string) {
    const response = await this.request<LoginStats>('GET', `/stats/${userID}`);
    return response.data!;
  }
}
