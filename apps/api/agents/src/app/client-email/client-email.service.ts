import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import {
  ClientEmailResponseGeneratedEvent,
  // AnalyzeEmailRequest,
  // CoachReplicaRequest,
} from '@nlc-ai/api-types';

@Injectable()
export class ClientEmailService {
  private readonly logger = new Logger(ClientEmailService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async generateResponse(coachID: string, threadID: string, customInstructions?: string) {
    this.logger.log(`Generating response for thread ${threadID}`);

    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, coachID },
      include: {
        client: true,
        emailMessages: {
          orderBy: { sentAt: 'desc' },
          take: 5
        }
      }
    });

    if (!thread) {
      throw new NotFoundException('Email thread not found');
    }

    const latestClientMessage = thread.emailMessages.find(msg =>
      msg.from === thread.client?.email
    );

    if (!latestClientMessage) {
      throw new BadRequestException('No client messages found in thread');
    }

    const interaction = await this.prisma.aiInteraction.create({
      data: {
        coachID,
        agentID: await this.getOrCreateClientEmailAgent(),
        interactionType: 'client_email_response',
        inputData: {
          threadID,
          clientEmail: thread.client?.email,
          subject: latestClientMessage.subject,
          messageBody: latestClientMessage.text,
          customInstructions,
        },
        outputData: {},
        status: 'processing',
      },
    });

    try {
      const context = this.buildResponseContext(thread, latestClientMessage);
      const aiResponse = await this.generateWithOpenAI(context, thread.client, customInstructions);

      const generatedResponse = await this.prisma.generatedEmailResponse.create({
        data: {
          coachID,
          threadID,
          clientID: thread.client?.id!,
          interactionID: interaction.id,
          subject: this.extractSubject(aiResponse.response, latestClientMessage.subject || ''),
          body: this.extractBody(aiResponse.response),
          confidence: aiResponse.confidence || 0.8,
          status: 'generated',
          metadata: JSON.stringify({
            originalMessageID: latestClientMessage.providerMessageID,
            customInstructions,
            aiReasoning: aiResponse.reasoning,
          }),
        },
      });

      await this.prisma.aiInteraction.update({
        where: { id: interaction.id },
        data: {
          status: 'completed',
          outputData: JSON.stringify(aiResponse),
          processingTimeMs: Date.now() - (interaction.createdAt?.getTime() || Date.now()),
          confidenceScore: aiResponse.confidence || 0.8,
        },
      });

      await this.outbox.saveAndPublishEvent<ClientEmailResponseGeneratedEvent>(
        {
          eventType: 'client.email.response.generated',
          schemaVersion: 1,
          payload: {
            responseID: generatedResponse.id,
            coachID,
            clientID: thread.client?.id!,
            threadID,
            confidence: aiResponse.confidence || 0.8,
            generatedAt: new Date().toISOString(),
          },
        },
        'client.email.response.generated'
      );

      return {
        id: generatedResponse.id,
        subject: generatedResponse.subject,
        body: generatedResponse.body,
        confidence: generatedResponse.confidence,
        status: 'generated',
        createdAt: generatedResponse.createdAt,
        thread: {
          id: thread.id,
          subject: thread.subject,
          client: {
            id: thread.client?.id,
            name: `${thread.client?.firstName} ${thread.client?.lastName}`,
            email: thread.client?.email,
          }
        }
      };

    } catch (error: any) {
      await this.prisma.aiInteraction.update({
        where: { id: interaction.id },
        data: {
          status: 'failed',
          outputData: JSON.stringify({ error: error.message }),
        },
      });

      throw new BadRequestException(`Failed to generate response: ${error.message}`);
    }
  }

  async regenerateResponse(coachID: string, responseID: string, customInstructions?: string) {
    const existingResponse = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, coachID },
      include: { emailThread: { include: { client: true } } }
    });

    if (!existingResponse) {
      throw new NotFoundException('Response not found');
    }

    // Mark existing response as superseded
    await this.prisma.generatedEmailResponse.update({
      where: { id: responseID },
      data: { status: 'superseded' }
    });

    // Generate new response
    return this.generateResponse(coachID, existingResponse.threadID, customInstructions);
  }

  async getResponsesForThread(coachID: string, threadID: string) {
    return this.prisma.generatedEmailResponse.findMany({
      where: {
        coachID,
        threadID,
        status: { in: ['generated', 'updated'] }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        emailThread: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });
  }

  async getAllResponses(coachID: string) {
    return this.prisma.generatedEmailResponse.findMany({
      where: {
        coachID,
        status: { in: ['generated', 'updated'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        emailThread: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });
  }

  async updateResponse(coachID: string, responseID: string, updates: { subject?: string; body?: string }) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, coachID }
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    return this.prisma.generatedEmailResponse.update({
      where: { id: responseID },
      data: {
        ...updates,
        status: 'updated',
        updatedAt: new Date(),
      }
    });
  }

  /*async analyzeResponseDeliverability(coachID: string, responseID: string) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, coachID }
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    // Call email deliverability service (external service call)
    const deliverabilityRequest: AnalyzeEmailRequest = {
      subject: response.subject,
      body: response.body,
      coachID,
      recipientType: 'client',
    };

    // This would be an HTTP call to the email deliverability service
    // For now, returning a placeholder - implement actual service call
    return {
      responseID,
      overallScore: 85,
      primaryInboxProbability: 75,
      recommendations: [
        {
          category: 'subject',
          priority: 'medium',
          issue: 'Subject could be more specific',
          suggestion: 'Add client name or reference to previous conversation',
          impact: 'Improves personalization and inbox placement'
        }
      ],
      analyzedAt: new Date(),
    };
  }*/

  private async getOrCreateClientEmailAgent(): Promise<string> {
    let agent = await this.prisma.aiAgent.findFirst({
      where: { name: 'Client Email Agent§' },
    });

    if (!agent) {
      agent = await this.prisma.aiAgent.create({
        data: {
          name: 'Client Email Agent',
          type: 'client_email_response',
          description: 'AI agent for generating personalized responses to client emails',
          defaultConfig: {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 1000,
          },
          isActive: true,
        },
      });
    }

    return agent.id;
  }

  private buildResponseContext(thread: any, latestMessage: any): string {
    return `
CLIENT INFORMATION:
- Name: ${thread.client.firstName} ${thread.client.lastName}
- Email: ${thread.client.email}
- Status: ${thread.client.status}

EMAIL THREAD CONTEXT:
- Subject: ${thread.subject}
- Latest Message from Client:
  Subject: ${latestMessage.subject}
  Content: ${latestMessage.bodyText}
  Sent: ${new Date(latestMessage.sentAt).toLocaleString()}

RECENT CONVERSATION:
${thread.emailMessages.slice(0, 3).map((msg: any) => `
- From: ${msg.senderEmail}
- Date: ${new Date(msg.sentAt).toLocaleDateString()}
- Content: ${msg.bodyText?.substring(0, 200)}...
`).join('')}

Please generate a professional, helpful response that:
1. Addresses the client's specific question or concern
2. Maintains a coaching relationship tone
3. Provides value and actionable insights
4. Keeps the conversation moving forward
5. Reflects authentic coaching communication style
`;
  }

  private async generateWithOpenAI(context: string, client: any, customInstructions?: string) {
    const systemPrompt = `You are an AI assistant helping a professional coach respond to client emails.
Generate authentic, helpful responses that maintain the coaching relationship and provide value.

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Respond in JSON format with:
{
  "response": "The complete email response including subject and body",
  "confidence": 0.0-1.0,
  "reasoning": "Why this response is appropriate"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
        temperature: 0.7,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new Error('Failed to generate response with AI');
    }
  }

  private extractSubject(response: string, originalSubject: string): string {
    const subjectMatch = response.match(/Subject:\s*(.+)/i);
    if (subjectMatch) {
      return subjectMatch[1].trim();
    }

    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  private extractBody(response: string): string {
    const body = response.replace(/Subject:\s*.+\n*/i, '').trim();
    return body.length < 50 ? response : body;
  }
}
