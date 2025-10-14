import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AgentType } from '@nlc-ai/types';
import {JwtService} from "@nestjs/jwt";

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
export class ClientEmailService {
  private readonly logger = new Logger(ClientEmailService.name);
  private openai: OpenAI;
  private readonly emailServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwt: JwtService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
    this.emailServiceUrl = this.configService.get<string>('agents.services.email.url')!;
  }

  private async fetchThreadMessages(coachID: string, threadID: string): Promise<ThreadMessage[]> {
    try {
      const serviceToken = this.jwt.sign({
        origin: 'agents',
        destination: 'email',
        coachID,
      });
      const response = await firstValueFrom(
        this.httpService.get<{ messages: ThreadMessage[] }>(
          `${this.emailServiceUrl}/api/email/internal/threads/${threadID}/messages`,
          {
            headers: {
              'x-service-token': serviceToken,
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

  private async getCoachReplicaConfig(coachID: string) {
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

    if (!replicaConfig || !replicaConfig.assistantID) {
      throw new NotFoundException('Coach replica not initialized. Please initialize the coach replica assistant first.');
    }

    return { replicaAgent, replicaConfig };
  }

  private buildEmailResponseInstructions(
    baseInstructions: string,
    threadHistory: ThreadMessage[],
    messageContext?: string
  ): string {
    const latestMessage = threadHistory[threadHistory.length - 1];

    return `${baseInstructions}

CURRENT TASK: Generate Email Response

You are now being asked to draft an email response to a message in an ongoing email thread.

THREAD CONTEXT:
- Latest message from: ${latestMessage.from}
- Subject: ${latestMessage.subject}
- Your role: Respond as the coach in their authentic voice

EMAIL RESPONSE REQUIREMENTS:
1. Format your response with "Subject: [subject line]" on the first line
2. Leave a blank line after the subject
3. Then write the email body
4. Match the coach's email communication style
5. Be professional but maintain the coach's personality
6. Address the specific points raised in the latest message
7. Keep the response concise and actionable

${messageContext ? `ADDITIONAL CONTEXT FROM COACH:\n${messageContext}\n` : ''}

EXAMPLE FORMAT:
Subject: Re: Your question about coaching

Hi [Name],

[Your response here matching the coach's voice and style...]

Best regards,
[Coach name]`;
  }

  async streamEmailResponse(
    coachID: string,
    threadID: string,
    messageContext?: string
  ) {
    const { replicaConfig } = await this.getCoachReplicaConfig(coachID);

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

    if (threadHistory.length === 0) {
      throw new BadRequestException('No messages found in thread');
    }

    const emailInstructions = this.buildEmailResponseInstructions(
      replicaConfig.instructions || this.getDefaultInstructions(),
      threadHistory,
      messageContext
    );

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: emailInstructions,
      },
      ...threadHistory.slice(-10).map(msg => ({
        role: (msg.isFromCoach ? 'assistant' : 'user') as 'system' | 'user' | 'assistant',
        content: `From: ${msg.from}\nTo: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}`,
      })),
      {
        role: 'user',
        content: 'Please generate a response to the latest message in this thread.',
      }
    ];

    const model = replicaConfig.fineTunedModelID || replicaConfig.model || 'gpt-4o';

    try {
      await this.updateUsageStats(coachID, replicaConfig.agentID);

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

  private async updateUsageStats(coachID: string, agentID: string) {
    await this.prisma.coachAiAgent.update({
      where: {
        coachID_agentID: {
          coachID,
          agentID,
        }
      },
      data: {
        totalRequests: { increment: 1 },
        lastUsedAt: new Date(),
      }
    });
  }

  async getCoachEmailAgentInfo(coachID: string) {
    try {
      const { replicaConfig } = await this.getCoachReplicaConfig(coachID);

      return {
        hasEmailAgent: true,
        hasFineTunedModel: !!replicaConfig.fineTunedModelID,
        modelID: replicaConfig.fineTunedModelID,
        lastFineTuningAt: replicaConfig.lastFineTuningAt,
        fineTuningEmailCount: replicaConfig.fineTuningEmailCount,
        baseModel: replicaConfig.model,
        assistantID: replicaConfig.assistantID,
        totalRequests: replicaConfig.totalRequests,
        lastUsedAt: replicaConfig.lastUsedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          hasEmailAgent: false,
          hasFineTunedModel: false,
          message: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Save generated response for feedback/training
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
   * Update generated response with what was actually sent (for training data)
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
        status: 'sent',
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
6. Sign off appropriately for email communication

Always maintain professionalism while staying true to the coach's personality.`;
  }
}
