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
import {CoachReplicaService} from "../coach-replica/coach-replica.service";
import {UserType} from "@nlc-ai/types";

@Injectable()
export class ClientEmailService {
  private readonly logger = new Logger(ClientEmailService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly configService: ConfigService,
    private readonly coachReplicaService: CoachReplicaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async generateResponse(userID: string, userType: UserType, threadID: string, customInstructions?: string) {
    this.logger.log(`Generating response for thread ${threadID}`);

    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
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
        userID,
        userType,
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
      // Get coach knowledge profile for context
      const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(userID);

      console.log("Thread: ", thread);

      const context = this.buildResponseContext(thread, latestClientMessage, coachProfile);
      const aiResponse = await this.generateWithOpenAI(context, thread.client, customInstructions, coachProfile);

      const generatedResponse = await this.prisma.generatedEmailResponse.create({
        data: {
          userID,
          userType,
          threadID,
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
            userID,
            userType,
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

  async regenerateResponse(userID: string, userType: UserType, responseID: string, customInstructions?: string) {
    const existingResponse = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, userID },
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
    return this.generateResponse(userID, userType, existingResponse.threadID, customInstructions);
  }

  async getResponsesForThread(userID: string, threadID: string) {
    return this.prisma.generatedEmailResponse.findMany({
      where: {
        userID,
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

  async getAllResponses(userID: string) {
    return this.prisma.generatedEmailResponse.findMany({
      where: {
        userID,
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

  async updateResponse(userID: string, responseID: string, updates: { subject?: string; body?: string }) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, userID }
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

  /*async analyzeResponseDeliverability(userID: string, responseID: string) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, userID }
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    // Call email deliverability service (external service call)
    const deliverabilityRequest: AnalyzeEmailRequest = {
      subject: response.subject,
      body: response.body,
      userID,
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
      where: { name: 'Client Email Agent' },
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

  private buildResponseContext(thread: any, latestMessage: any, coachProfile: any): string {
    return `
CLIENT INFORMATION:
- Name: ${thread.client.firstName} ${thread.client.lastName}
- Email: ${thread.client.email}
- Status: ${thread.client.status}

COACH PROFILE CONTEXT:
- Communication Style: ${coachProfile.personality.communicationStyle}
- Response Length: ${coachProfile.personality.responseLength}
- Business Industry: ${coachProfile.businessContext.industry}
- Key Services: ${coachProfile.businessContext.services.join(', ')}
- Expertise Areas: ${coachProfile.businessContext.expertise.join(', ')}
- Common Phrases: ${coachProfile.personality.commonPhrases.join(', ')}
- Preferred Greetings: ${coachProfile.personality.preferredGreetings.join(', ')}
- Preferred Closings: ${coachProfile.personality.preferredClosings.join(', ')}

EMAIL THREAD CONTEXT:
- Subject: ${thread.subject}
- Latest Message from Client:
  Subject: ${latestMessage.subject}
  Content: ${latestMessage.bodyText}
  Sent: ${new Date(latestMessage.sentAt).toLocaleString()}

RECENT CONVERSATION:
${thread.emailMessages.slice(0, 3).map((msg: any) => `
- From: ${msg.from}
- Date: ${new Date(msg.sentAt).toLocaleDateString()}
- Content: ${msg.text?.substring(0, 200)}...
`).join('')}

Please generate a response that:
1. Matches the coach's authentic communication style and personality
2. Uses their preferred greetings/closings and common phrases naturally
3. Reflects their expertise and business context
4. Addresses the client's specific question or concern
5. Maintains the established coaching relationship tone
6. Provides value aligned with the coach's service offerings
`;
  }

  private async generateWithOpenAI(context: string, client: any, customInstructions?: string, coachProfile?: any) {
    const systemPrompt = `You are an AI assistant helping a ${coachProfile?.businessContext?.industry || 'professional'} coach respond to client emails.
You must maintain the coach's authentic voice and communication style.

COACH COMMUNICATION STYLE:
- Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Formality Level: ${coachProfile?.writingStyle?.formalityLevel || 7}/10
- Response Length: ${coachProfile?.personality?.responseLength || 'moderate'}
- Use of Emojis: ${coachProfile?.writingStyle?.useOfEmojis || 'minimal'}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Respond in JSON format with:
{
  "response": "The complete email response including subject and body",
  "confidence": 0.0-1.0,
  "reasoning": "Why this response matches the coach's style and addresses the client's needs"
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
