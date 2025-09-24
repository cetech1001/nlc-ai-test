import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { CoachReplicaService } from '../coach-replica/coach-replica.service';
import {
  AgentConversation,
  AgentConversationMessage, AgentType,
  ConversationArtifact, UserType
} from "@nlc-ai/types";

@Injectable()
export class AgentConversationService {
  private readonly logger = new Logger(AgentConversationService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly coachReplicaService: CoachReplicaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async startConversation(
    coachID: string,
    agentType: AgentType,
    initialMessage: string,
    title?: string
  ): Promise<{ conversation: AgentConversation; firstResponse: AgentConversationMessage }> {
    const conversation = await this.prisma.agentConversation.create({
      data: {
        coachID,
        agentType,
        title: title || `${agentType} conversation`,
        totalMessages: 0,
        isActive: true,
      }
    });

    await this.prisma.agentConversationMessage.create({
      data: {
        conversationID: conversation.id,
        senderType: UserType.COACH,
        content: initialMessage,
        messageType: 'text',
      }
    });

    const agentResponse = await this.generateAgentResponse(
      conversation.id,
      coachID,
      agentType,
      initialMessage
    );

    await this.prisma.agentConversation.update({
      where: { id: conversation.id },
      data: {
        totalMessages: 2,
        lastMessageAt: new Date(),
      }
    });

    return {
      conversation: this.mapConversation(conversation),
      firstResponse: agentResponse
    };
  }

  async sendMessage(
    conversationID: string,
    message: string,
    coachID: string
  ): Promise<AgentConversationMessage> {
    const conversation = await this.prisma.agentConversation.findFirst({
      where: { id: conversationID, coachID },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.agentConversationMessage.create({
      data: {
        conversationID,
        senderType: UserType.COACH,
        content: message,
        messageType: 'text',
      }
    });

    const context = conversation.messages.map(m =>
      `${m.senderType === UserType.COACH ? 'Coach' : 'Assistant'}: ${m.content}`
    ).reverse().join('\n');

    const agentResponse = await this.generateAgentResponse(
      conversationID,
      coachID,
      conversation.agentType,
      message,
      context
    );

    await this.prisma.agentConversation.update({
      where: { id: conversationID },
      data: {
        totalMessages: conversation.totalMessages + 2,
        lastMessageAt: new Date(),
      }
    });

    return agentResponse;
  }

  async createArtifact(
    conversationID: string,
    messageID: string,
    type: string,
    title: string,
    content: any,
    metadata: any = {}
  ): Promise<ConversationArtifact> {
    await this.prisma.conversationArtifact.updateMany({
      where: { conversationID, artifactType: type, isCurrent: true },
      data: { isCurrent: false }
    });

    const artifact = await this.prisma.conversationArtifact.create({
      data: {
        conversationID,
        messageID,
        artifactType: type,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        metadata,
        version: 1,
        isCurrent: true,
      }
    });

    return this.mapArtifact(artifact);
  }

  async getConversation(conversationID: string, coachID: string) {
    const conversation = await this.prisma.agentConversation.findFirst({
      where: { id: conversationID, coachID },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            artifacts: {
              where: { isCurrent: true }
            }
          }
        },
        artifacts: {
          where: { isCurrent: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      ...this.mapConversation(conversation),
      messages: conversation.messages.map(m => this.mapMessage(m)),
      artifacts: conversation.artifacts.map(a => this.mapArtifact(a))
    };
  }

  async getCoachConversations(coachID: string, agentType?: AgentType) {
    const conversations = await this.prisma.agentConversation.findMany({
      where: {
        coachID,
        ...(agentType && { agentType }),
        isActive: true
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 50
    });

    return conversations.map(c => this.mapConversation(c));
  }

  private async generateAgentResponse(
    conversationID: string,
    coachID: string,
    agentType: string,
    currentMessage: string,
    conversationContext?: string
  ): Promise<AgentConversationMessage> {
    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coachID);

    const systemPrompt = this.buildSystemPrompt(agentType, coachProfile);
    const userPrompt = conversationContext
      ? `${conversationContext}\n\nCoach: ${currentMessage}`
      : `Coach: ${currentMessage}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_completion_tokens: 1000,
      });

      const agentMessage = await this.prisma.agentConversationMessage.create({
        data: {
          conversationID,
          senderType: 'agent',
          content: completion.choices[0].message.content || '',
          messageType: 'text',
          metadata: { model: 'gpt-4o-mini' }
        }
      });

      return this.mapMessage(agentMessage);
    } catch (error) {
      this.logger.error('Error generating agent response:', error);

      const fallbackMessage = await this.prisma.agentConversationMessage.create({
        data: {
          conversationID,
          senderType: 'agent',
          content: 'I apologize, but I\'m having trouble generating a response right now. Please try again.',
          messageType: 'text',
          metadata: { error: true }
        }
      });

      return this.mapMessage(fallbackMessage);
    }
  }

  private buildSystemPrompt(agentType: string, coachProfile: any): string {
    const basePrompt = `You are an AI assistant specialized in ${agentType.replace('_', ' ')} for coaches.

COACH CONTEXT:
- Communication Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Industry: ${coachProfile?.businessContext?.industry || 'coaching'}
- Expertise: ${coachProfile?.businessContext?.expertise?.join(', ') || 'general coaching'}

You should:
- Maintain a conversational, helpful tone
- Ask clarifying questions when needed
- Provide actionable advice
- Match the coach's communication style
- Remember context from the conversation`;

    switch (agentType) {
      case 'content_creation':
        return `${basePrompt}

You help coaches create engaging content by:
- Brainstorming content ideas
- Writing scripts and captions
- Suggesting improvements
- Adapting content for different platforms
- Maintaining the coach's authentic voice`;

      default:
        return basePrompt;
    }
  }

  private mapConversation(conversation: any): AgentConversation {
    return {
      id: conversation.id,
      agentType: conversation.agentType,
      title: conversation.title,
      totalMessages: conversation.totalMessages,
      lastMessageAt: conversation.lastMessageAt,
      isActive: conversation.isActive,
      createdAt: conversation.createdAt,
    };
  }

  private mapMessage(message: any): AgentConversationMessage {
    return {
      id: message.id,
      senderType: message.senderType,
      content: message.content,
      messageType: message.messageType,
      metadata: message.metadata,
      createdAt: message.createdAt,
      artifacts: message.artifacts?.map((a: any) => this.mapArtifact(a)) || []
    };
  }

  private mapArtifact(artifact: any): ConversationArtifact {
    return {
      id: artifact.id,
      artifactType: artifact.artifactType,
      title: artifact.title,
      content: artifact.content,
      metadata: artifact.metadata,
      version: artifact.version,
      isCurrent: artifact.isCurrent,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    };
  }
}
