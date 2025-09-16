import {BaseClient} from "@nlc-ai/sdk-core";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import {ClientEmailSendClient} from "./client-email-send.client";

export class EmailClient extends BaseClient {
  public clientEmail: ClientEmailSendClient;

  constructor(props: NLCClientConfig) {
    super(props);

    this.clientEmail = new ClientEmailSendClient({
      ...props,
      baseURL: `${props.baseURL}/client-email-send`,
    });
  }

  async sendEmail(data: any) {
    const response = await this.request('POST', '/send', { body: data });
    return response.data!;
  }

  async sendClientInvite(data: any) {

  }

  async getTemplates(coachID: string, filters?: any) {
    const params = new URLSearchParams({ coachID, ...filters });
    const response = await this.request('GET', `/templates?${params}`);
    return response.data!;
  }

  async createTemplate(data: any) {
    const response = await this.request('POST', '/templates', { body: data });
    return response.data!;
  }

  async scheduleEmailSequence(data: any) {
    const response = await this.request('POST', '/sequences', { body: data });
    return response.data!;
  }
}
