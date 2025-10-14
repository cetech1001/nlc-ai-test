import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AgentType } from '@nlc-ai/types';

interface ThreadMessage {
  messageID: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  sentAt: string;
  isFromCoach: boolean;
}

@Injectable()
export class EmailAgentService {
  private readonly logger = new Logger(EmailAgentService.name);
  private openai: OpenAI;
  private readonly emailServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
    this.emailServiceUrl = this.configService.get<string>('agents.services.email.url')!;
  }

  private async fetchThreadMessages(coachID: string, threadID: string): Promise<ThreadMessage[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ messages: ThreadMessage[] }>(
          `${this.emailServiceUrl}/internal/threads/${threadID}/messages`,
          {
            headers: {
              'X-Internal-Service': 'agents',
              'X-Coach-ID': coachID,
            },
          }
        )
      );

      return response.data.messages;
    } catch (error: any) {
      this.logger.error(`Failed to fetch thread messages: ${error.message}`, error);
      throw new BadRequestException('Failed to fetch email thread from email service');
    }
  }

  async generateEmailResponse(
    coachID: string,
    threadID: string,
    messageContext?: string
  ): Promise<{ subject: string; body: string }> {
    const replicaAgent = await this.prisma.aiAgent.findUnique({
      where: { type: AgentType.COACH_REPLICA }
    });

    if (!replicaAgent) {
      throw new NotFoundException('Coach replica agent not found');
    }

    const replicaConfig = await this.prisma.coachAiAgent.findUnique({
      where: {
        coachID_agentID: {
          coachID,
          agentID: replicaAgent.id,
        }
      },
    });

    if (!replicaConfig) {
      throw new NotFoundException('Coach replica not initialized');
    }

    const emailThread = await this.prisma.emailThread.findFirst({
      where: {
        id: threadID,
        userID: coachID,
      },
    });

    if (!emailThread) {
      throw new NotFoundException('Email thread not found');
    }

    const threadHistory = await this.fetchThreadMessages(coachID, emailThread.threadID);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: replicaConfig.instructions || this.getDefaultInstructions(),
      },
      ...threadHistory.slice(-10).map(msg => ({
        role: (msg.isFromCoach ? 'assistant' : 'user') as 'system' | 'user' | 'assistant',
        content: `Subject: ${msg.subject}\n\n${msg.text}`,
      })),
    ];

    if (messageContext) {
      messages.push({
        role: 'user',
        content: `Generate a response to the above thread. Additional context: ${messageContext}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: 'Generate a professional response to the last message in this thread.',
      });
    }

    const model = replicaConfig.fineTunedModelID || 'gpt-4o';

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const generatedContent = response.choices[0]?.message?.content || '';

      const { subject, body } = this.parseEmailContent(generatedContent, emailThread.subject);

      return { subject, body };
    } catch (error: any) {
      this.logger.error('Failed to generate email response:', error);
      throw new BadRequestException(`Failed to generate response: ${error.message}`);
    }
  }

  async streamEmailResponse(
    coachID: string,
    threadID: string,
    messageContext?: string
  ) {
    const replicaAgent = await this.prisma.aiAgent.findUnique({
      where: { type: AgentType.COACH_REPLICA }
    });

    if (!replicaAgent) {
      throw new NotFoundException('Coach replica agent not found');
    }

    const replicaConfig = await this.prisma.coachAiAgent.findUnique({
      where: {
        coachID_agentID: {
          coachID,
          agentID: replicaAgent.id,
        }
      },
    });

    if (!replicaConfig) {
      throw new NotFoundException('Coach replica not initialized');
    }

    const emailThread = await this.prisma.emailThread.findFirst({
      where: {
        id: threadID,
        userID: coachID,
      },
    });

    if (!emailThread) {
      throw new NotFoundException('Email thread not found');
    }

    const threadHistory = await this.fetchThreadMessages(coachID, emailThread.threadID);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: replicaConfig.instructions || this.getDefaultInstructions(),
      },
      ...threadHistory.slice(-10).map(msg => ({
        role: (msg.isFromCoach ? 'assistant' : 'user') as 'system' | 'user' | 'assistant',
        content: `Subject: ${msg.subject}\n\n${msg.text}`,
      })),
    ];

    if (messageContext) {
      messages.push({
        role: 'user',
        content: `Generate a response to the above thread. Additional context: ${messageContext}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: 'Generate a professional response to the last message in this thread.',
      });
    }

    const model = replicaConfig.fineTunedModelID || 'gpt-4o';

    try {
      return await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });
    } catch (error: any) {
      this.logger.error('Failed to stream email response:', error);
      throw new BadRequestException(`Failed to stream response: ${error.message}`);
    }
  }

  private parseEmailContent(content: string, originalSubject?: string | null): { subject: string; body: string } {
    const subjectMatch = content.match(/^Subject:\s*(.+?)$/im);

    if (subjectMatch) {
      const subject = subjectMatch[1].trim();
      const body = content.replace(/^Subject:.*$/im, '').trim();
      return { subject, body };
    }

    const subject = originalSubject ? `Re: ${originalSubject}` : 'Re: Your message';
    return { subject, body: content.trim() };
  }

  async getCoachEmailAgentInfo(coachID: string) {
    const replicaAgent = await this.prisma.aiAgent.findUnique({
      where: { type: AgentType.COACH_REPLICA }
    });

    if (!replicaAgent) {
      return {
        hasEmailAgent: false,
        hasFineTunedModel: false,
        message: 'Email agent not configured',
      };
    }

    const replicaConfig = await this.prisma.coachAiAgent.findUnique({
      where: {
        coachID_agentID: {
          coachID,
          agentID: replicaAgent.id,
        }
      },
    });

    if (!replicaConfig) {
      return {
        hasEmailAgent: false,
        hasFineTunedModel: false,
        message: 'Coach replica not initialized',
      };
    }

    return {
      hasEmailAgent: true,
      hasFineTunedModel: !!replicaConfig.fineTunedModelID,
      modelID: replicaConfig.fineTunedModelID,
      lastFineTuningAt: replicaConfig.lastFineTuningAt,
      fineTuningEmailCount: replicaConfig.fineTuningEmailCount,
      baseModel: replicaConfig.model,
    };
  }

  /**
   * Save generated response
   */
  async saveGeneratedResponse(
    threadID: string,
    subject: string,
    body: string,
    confidence?: number
  ) {
    return this.prisma.generatedEmailResponse.create({
      data: {
        threadID,
        subject,
        body,
        confidence,
        status: 'generated',
      },
    });
  }

  /**
   * Update generated response (when coach edits)
   */
  async updateGeneratedResponse(
    responseID: string,
    actualSubject: string,
    actualBody: string
  ) {
    return this.prisma.generatedEmailResponse.update({
      where: { id: responseID },
      data: {
        actualSubject,
        actualBody,
        status: 'updated',
      },
    });
  }

  private getDefaultInstructions(): string {
    return `You are an AI assistant helping to draft email responses for a professional coach.

    When generating email responses:
    1. Match the coach's communication style and tone
    2. Be professional, empathetic, and helpful
    3. Keep responses concise and actionable
    4. Address the client's specific questions or concerns
    5. Maintain the coach's authentic voice

    Format your response with:
    Subject: [Your subject line]

    [Your email body]`;
  }
}
