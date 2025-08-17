import {BaseServiceClient} from "@nlc-ai/sdk-core";

export class EmailServiceClient extends BaseServiceClient {
  async sendEmail(data: any) {
    const response = await this.request('POST', '/email/send', { body: data });
    return response.data!;
  }

  async getTemplates(coachID: string, filters?: any) {
    const params = new URLSearchParams({ coachID, ...filters });
    const response = await this.request('GET', `/email/templates?${params}`);
    return response.data!;
  }

  async createTemplate(data: any) {
    const response = await this.request('POST', '/email/templates', { body: data });
    return response.data!;
  }

  async getEmailThreads(coachID: string, params?: any) {
    const searchParams = new URLSearchParams({ coachID, ...params });
    const response = await this.request('GET', `/email/threads?${searchParams}`);
    return response.data!;
  }

  async scheduleEmailSequence(data: any) {
    const response = await this.request('POST', '/email/sequences', { body: data });
    return response.data!;
  }
}
