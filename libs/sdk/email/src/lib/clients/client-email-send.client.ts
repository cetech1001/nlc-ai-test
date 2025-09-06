import { BaseClient } from "@nlc-ai/sdk-core";

export class ClientEmailSendClient extends BaseClient {
  async sendResponse(responseID: string, data: any) {
    return this.request("POST", `/send/${responseID}`, { body: data });
  }

  async scheduleResponse(responseID: string, data: any) {
    return this.request("POST", `/schedule/${responseID}`, { body: data });
  }

  async sendCustomEmail(data: any) {
    const response = await this.request("POST", "/custom", { body: data });
    return response.data!;
  }

  async cancelScheduledEmail(scheduledEmailID: string) {
    const response = await this.request(
      "POST",
      `/cancel-scheduled/${encodeURIComponent(scheduledEmailID)}`
    );
    return response.data!;
  }
}
