import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { CoachReplicaService } from '../coach-replica/coach-replica.service';
import {
  AgentConversation,
  AgentConversationMessage,
  AgentType,
  ConversationArtifact,
  UserType
} from "@nlc-ai/types";

@Injectable()
export class ContentSuggestionConversationService {
  private readonly logger = new Logger(ContentSuggestionConversationService.name);
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

  async startContentConversation(
    coachID: string,
    initialMessage: string,
    title?: string
  ): Promise<{ conversation: AgentConversation; firstResponse: AgentConversationMessage }> {
    const conversation = await this.prisma.agentConversation.create({
      data: {
        coachID,
        agentType: AgentType.CONTENT_CREATION,
        title: title || 'Content Creation Session',
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

  async generateContentArtifact(
    conversationID: string,
    coachID: string,
    type: 'content_script' | 'social_post' | 'blog_outline',
    title: string,
    requirements: any
  ): Promise<{ artifact: ConversationArtifact; message: string }> {
    const conversation = await this.prisma.agentConversation.findFirst({
      where: { id: conversationID, coachID },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const context = conversation.messages.map(m =>
      `${m.senderType === UserType.COACH ? 'Coach' : 'Assistant'}: ${m.content}`
    ).reverse().join('\n');

    const artifactContent = await this.generateArtifactContent(
      coachID,
      type,
      title,
      requirements,
      context
    );

    const messageID = await this.createArtifactMessage(conversationID, type, title);

    const artifact = await this.createArtifact(
      conversationID,
      messageID,
      type,
      title,
      artifactContent
    );

    return {
      artifact,
      message: `I've created a ${this.getArtifactTypeLabel(type)} for you. You can view and copy the content from the sidebar, or click on it to see the full formatted version.`
    };
  }

  async refineArtifact(
    conversationID: string,
    artifactID: string,
    coachID: string,
    refinements: string,
    changes?: any
  ): Promise<{ artifact: ConversationArtifact; message: string }> {
    const existingArtifact = await this.prisma.conversationArtifact.findFirst({
      where: { id: artifactID, conversationID }
    });

    if (!existingArtifact) {
      throw new NotFoundException('Artifact not found');
    }

    const conversation = await this.prisma.agentConversation.findFirst({
      where: { id: conversationID, coachID },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const context = conversation.messages.map(m =>
      `${m.senderType === UserType.COACH ? 'Coach' : 'Assistant'}: ${m.content}`
    ).reverse().join('\n');

    const refinedContent = await this.refineArtifactContent(
      coachID,
      existingArtifact.artifactType,
      existingArtifact.content,
      refinements,
      changes,
      context
    );

    // Mark current artifact as not current
    await this.prisma.conversationArtifact.updateMany({
      where: { conversationID, artifactType: existingArtifact.artifactType, isCurrent: true },
      data: { isCurrent: false }
    });

    const messageID = await this.createArtifactMessage(conversationID, existingArtifact.artifactType, 'Refined ' + existingArtifact.title);

    const newArtifact = await this.prisma.conversationArtifact.create({
      data: {
        conversationID,
        messageID,
        artifactType: existingArtifact.artifactType,
        title: existingArtifact.title,
        content: typeof refinedContent === 'string' ? refinedContent : JSON.stringify(refinedContent),
        metadata: existingArtifact.metadata as any,
        version: existingArtifact.version + 1,
        isCurrent: true,
      }
    });

    return {
      artifact: this.mapArtifact(newArtifact),
      message: `I've refined your ${this.getArtifactTypeLabel(existingArtifact.artifactType)} based on your feedback. The updated version is now available.`
    };
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

  async getConversations(coachID: string) {
    const conversations = await this.prisma.agentConversation.findMany({
      where: {
        coachID,
        agentType: AgentType.CONTENT_CREATION,
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
    currentMessage: string,
    conversationContext?: string
  ): Promise<AgentConversationMessage> {
    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coachID);

    // Check if message should generate an artifact
    const artifactType = this.detectArtifactType(currentMessage);

    if (artifactType) {
      // Generate artifact content instead of regular response
      const requirements = this.extractRequirements(currentMessage);
      const title = this.generateArtifactTitle(currentMessage, artifactType);

      const artifactContent = await this.generateArtifactContent(
        coachID,
        artifactType,
        title,
        requirements,
        conversationContext
      );

      const messageID = await this.createArtifactMessage(conversationID, artifactType, title);

      await this.createArtifact(
        conversationID,
        messageID,
        artifactType,
        title,
        artifactContent
      );

      const agentMessage = await this.prisma.agentConversationMessage.findUnique({
        where: { id: messageID },
        include: { artifacts: true }
      });

      return this.mapMessage(agentMessage);
    }

    // Regular conversation response
    const systemPrompt = this.buildSystemPrompt(coachProfile);
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

  private detectArtifactType(message: string): 'content_script' | 'social_post' | 'blog_outline' | null {
    const lowerMessage = message.toLowerCase();

    // Script detection
    if (lowerMessage.includes('script') ||
      lowerMessage.includes('video script') ||
      (lowerMessage.includes('write') && (lowerMessage.includes('video') || lowerMessage.includes('content'))) ||
      lowerMessage.includes('hook') ||
      lowerMessage.includes('call to action') ||
      lowerMessage.includes('cta')) {
      return 'content_script';
    }

    // Social post detection
    if (lowerMessage.includes('social') ||
      lowerMessage.includes('post') ||
      lowerMessage.includes('instagram') ||
      lowerMessage.includes('linkedin') ||
      lowerMessage.includes('facebook') ||
      lowerMessage.includes('twitter') ||
      lowerMessage.includes('hashtag') ||
      (lowerMessage.includes('write') && lowerMessage.includes('caption'))) {
      return 'social_post';
    }

    // Blog outline detection
    if (lowerMessage.includes('blog') ||
      lowerMessage.includes('outline') ||
      lowerMessage.includes('article') ||
      (lowerMessage.includes('structure') && lowerMessage.includes('content')) ||
      lowerMessage.includes('blog post')) {
      return 'blog_outline';
    }

    return null;
  }

  private extractRequirements(message: string): any {
    const requirements: any = {
      tone: 'professional',
      length: 'medium'
    };

    const lowerMessage = message.toLowerCase();

    // Extract platform
    if (lowerMessage.includes('instagram')) requirements.platform = ['Instagram'];
    if (lowerMessage.includes('linkedin')) requirements.platform = ['LinkedIn'];
    if (lowerMessage.includes('facebook')) requirements.platform = ['Facebook'];
    if (lowerMessage.includes('twitter')) requirements.platform = ['Twitter'];

    // Extract tone
    if (lowerMessage.includes('casual')) requirements.tone = 'casual';
    if (lowerMessage.includes('formal')) requirements.tone = 'formal';
    if (lowerMessage.includes('friendly')) requirements.tone = 'friendly';
    if (lowerMessage.includes('professional')) requirements.tone = 'professional';

    // Extract length
    if (lowerMessage.includes('short')) requirements.length = 'short';
    if (lowerMessage.includes('long')) requirements.length = 'long';
    if (lowerMessage.includes('brief')) requirements.length = 'short';

    return requirements;
  }

  private generateArtifactTitle(message: string, type: string): string {
    const lowerMessage = message.toLowerCase();

    if (type === 'content_script') {
      if (lowerMessage.includes('video')) return 'Video Script';
      return 'Content Script';
    }

    if (type === 'social_post') {
      if (lowerMessage.includes('instagram')) return 'Instagram Post';
      if (lowerMessage.includes('linkedin')) return 'LinkedIn Post';
      return 'Social Media Post';
    }

    if (type === 'blog_outline') {
      return 'Blog Outline';
    }

    return 'Content Piece';
  }

  private async generateArtifactContent(
    coachID: string,
    type: string,
    title: string,
    requirements: any,
    context?: string
  ): Promise<any> {
    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coachID);

    const systemPrompt = `You are a content creation assistant for a ${coachProfile?.businessContext?.industry || 'coaching'} professional.

COACH PROFILE:
- Communication Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Industry: ${coachProfile?.businessContext?.industry || 'coaching'}
- Target Audience: ${coachProfile?.businessContext?.targetAudience?.join(', ') || 'professionals'}
- Expertise: ${coachProfile?.businessContext?.expertise?.join(', ') || 'general coaching'}

Create ${type === 'content_script' ? 'a content script' : type === 'social_post' ? 'a social media post' : 'a blog outline'} with the following requirements:
${JSON.stringify(requirements, null, 2)}

${context ? `CONVERSATION CONTEXT:\n${context}` : ''}

Respond in JSON format based on the content type requested.`;

    let userPrompt = '';

    if (type === 'content_script') {
      userPrompt = `Create a content script with:
- Hook: Engaging opening that grabs attention
- Main Content: Valuable, actionable content (3-4 paragraphs)
- Call to Action: Clear next step for the audience

Format as JSON:
{
  "hook": "attention-grabbing opening",
  "mainContent": "main valuable content",
  "callToAction": "clear call to action",
  "estimatedDuration": "estimated reading/viewing time"
}`;
    } else if (type === 'social_post') {
      userPrompt = `Create a social media post with:
- Engaging content that provides value
- Relevant hashtags
- Clear call to action

Format as JSON:
{
  "content": "main post content with proper formatting",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "callToAction": "engagement prompt",
  "platform": "recommended platform"
}`;
    } else if (type === 'blog_outline') {
      userPrompt = `Create a blog outline with:
- Compelling title
- Introduction
- 3-5 main sections with subsections
- Conclusion

Format as JSON:
{
  "title": "blog post title",
  "introduction": "intro paragraph",
  "sections": [
    {
      "title": "section title",
      "subsections": ["subsection 1", "subsection 2"],
      "keyPoints": ["key point 1", "key point 2"]
    }
  ],
  "conclusion": "conclusion paragraph"
}`;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error generating artifact content:', error);
      throw new Error('Failed to generate artifact content');
    }
  }

  private async refineArtifactContent(
    coachID: string,
    type: string,
    currentContent: any,
    refinements: string,
    changes?: any,
    context?: string
  ): Promise<any> {
    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coachID);

    const systemPrompt = `You are refining existing content for a ${coachProfile?.businessContext?.industry || 'coaching'} professional.

CURRENT CONTENT:
${typeof currentContent === 'string' ? currentContent : JSON.stringify(currentContent, null, 2)}

REFINEMENT REQUESTS:
${refinements}

${changes ? `SPECIFIC CHANGES:\n${JSON.stringify(changes, null, 2)}` : ''}

${context ? `CONVERSATION CONTEXT:\n${context}` : ''}

Refine the content maintaining the same JSON structure but improving based on the feedback provided.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please refine the content based on the requests above.' },
        ],
        temperature: 0.7,
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error refining artifact content:', error);
      throw new Error('Failed to refine artifact content');
    }
  }

  private async createArtifactMessage(conversationID: string, type: string, title: string): Promise<string> {
    const message = await this.prisma.agentConversationMessage.create({
      data: {
        conversationID,
        senderType: 'agent',
        content: `I've created a ${this.getArtifactTypeLabel(type)} for you: "${title}". You can view and edit it in the sidebar, or click on it to see the full formatted version.`,
        messageType: 'artifact_response',
        metadata: { artifactType: type, artifactTitle: title }
      }
    });

    return message.id;
  }

  private async createArtifact(
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

  private buildSystemPrompt(coachProfile: any): string {
    return `You are an AI assistant specialized in content creation for coaches.

COACH CONTEXT:
- Communication Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Industry: ${coachProfile?.businessContext?.industry || 'coaching'}
- Expertise: ${coachProfile?.businessContext?.expertise?.join(', ') || 'general coaching'}

You should:
- Maintain a conversational, helpful tone
- Ask clarifying questions when needed
- Provide actionable advice
- Match the coach's communication style
- Remember context from the conversation
- When asked to create specific content types (scripts, posts, outlines), create them as artifacts automatically

If the user asks for content creation like "write a script" or "create a social post", you should generate the content as a structured artifact rather than just providing text in the conversation.`;
  }

  private getArtifactTypeLabel(type: string): string {
    switch (type) {
      case 'content_script': return 'content script';
      case 'social_post': return 'social media post';
      case 'blog_outline': return 'blog outline';
      default: return 'content piece';
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
