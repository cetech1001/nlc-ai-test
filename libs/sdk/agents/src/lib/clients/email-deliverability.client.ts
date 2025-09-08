import { BaseClient } from '@nlc-ai/sdk-core';
import {AnalyzeEmailRequest, DeliverabilityAnalysis} from "@nlc-ai/types";

export class EmailDeliverabilityClient extends BaseClient {
  async analyzeEmailDeliverability(data: AnalyzeEmailRequest): Promise<DeliverabilityAnalysis> {
    const response = await this.request<DeliverabilityAnalysis>('POST', '/analyze', {
      body: data,
    });
    return response.data!;
  }

  async quickDeliverabilityCheck(subject: string, body: string): Promise<{ score: number; issues: string[] }> {
    const response = await this.request<{ score: number; issues: string[] }>('POST', '/quick-check', {
      body: { subject, body },
    });
    return response.data!;
  }
}
