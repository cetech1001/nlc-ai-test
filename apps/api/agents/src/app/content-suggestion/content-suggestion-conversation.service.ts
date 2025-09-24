import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {ConfigService} from '@nestjs/config';
import {OpenAI} from 'openai';
import {AgentConversationService} from '../agent-conversation/agent-conversation.service';
import {CoachReplicaService} from '../coach-replica/coach-replica.service';
import {AgentType} from "@nlc-ai/types";

interface ContentRequirements {
  platform?: string[];
  contentType?: string;
  targetAudience?: string;
  tone?: string;
  length?: string;
}

interface ContentScript {
  hook: string;
  mainContent: string;
  callToAction: string;
  hashtags?: string[];
  estimatedEngagement?: {
    min: number;
    max: number;
  };
}

@Injectable()
export class ContentSuggestionConversationService {
  private readonly logger = new Logger(ContentSuggestionConversationService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly agentConversationService: AgentConversationService,
    private readonly coachReplicaService: CoachReplicaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async startContentConversation(coachID: string, initialMessage: string, title?: string) {
    return this.agentConversationService.startConversation(
      coachID,
      AgentType.CONTENT_CREATION,
      initialMessage,
      title || 'Content Creation Session'
    );
  }

  async sendMessage(conversationID: string, message: string, coachID: string) {
    return this.agentConversationService.sendMessage(conversationID, message, coachID);
  }

  async getConversation(conversationID: string, coachID: string) {
    return this.agentConversationService.getConversation(conversationID, coachID);
  }

  async getConversations(coachID: string) {
    return this.agentConversationService.getCoachConversations(coachID, AgentType.CONTENT_CREATION);
  }

  async generateContentArtifact(
    conversationID: string,
    coachID: string,
    type: string,
    title: string,
    requirements: ContentRequirements
  ) {
    // Get conversation context
    const conversation = await this.getConversation(conversationID, coachID);
    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coachID);

    // Generate content based on type
    let content: any;
    let messageID: string;

    switch (type) {
      case 'content_script':
        const script = await this.generateContentScript(conversation, coachProfile, requirements);
        content = script;

        // Create agent message about the artifact
        const agentMessage = await this.prisma.agentConversationMessage.create({
          data: {
            conversationID,
            senderType: 'agent',
            content: `I've created a content script for "${title}". Here's your complete script with hook, main content, and call-to-action tailored to your style.`,
            messageType: 'artifact_response',
            metadata: { artifactType: type, artifactTitle: title }
          }
        });
        messageID = agentMessage.id;
        break;

      case 'social_post':
        content = await this.generateSocialPost(conversation, coachProfile, requirements);
        const postMessage = await this.prisma.agentConversationMessage.create({
          data: {
            conversationID,
            senderType: 'agent',
            content: `Here's your social media post for ${requirements.platform?.join(', ') || 'social media'}.`,
            messageType: 'artifact_response',
          }
        });
        messageID = postMessage.id;
        break;

      case 'blog_outline':
        content = await this.generateBlogOutline(conversation, coachProfile, requirements);
        const outlineMessage = await this.prisma.agentConversationMessage.create({
          data: {
            conversationID,
            senderType: 'agent',
            content: `I've created a comprehensive blog outline for "${title}" that aligns with your expertise and audience.`,
            messageType: 'artifact_response',
          }
        });
        messageID = outlineMessage.id;
        break;

      default:
        throw new Error(`Unsupported artifact type: ${type}`);
    }

    // Create the artifact
    const artifact = await this.agentConversationService.createArtifact(
      conversationID,
      messageID,
      type,
      title,
      content,
      { requirements, generatedAt: new Date().toISOString() }
    );

    // Update conversation message count
    await this.prisma.agentConversation.update({
      where: { id: conversationID },
      data: {
        totalMessages: { increment: 1 },
        lastMessageAt: new Date(),
      }
    });

    return {
      artifact,
      message: `Created ${type.replace('_', ' ')} artifact: ${title}`
    };
  }

  async refineArtifact(
    conversationID: string,
    artifactID: string,
    coachID: string,
    refinements: string,
    changes?: any
  ) {
    const currentArtifact = await this.prisma.conversationArtifact.findFirst({
      where: { id: artifactID, conversationID }
    });

    if (!currentArtifact) {
      throw new NotFoundException('Artifact not found');
    }

    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coachID);

    const currentContent = typeof currentArtifact.content === 'string'
      ? JSON.parse(currentArtifact.content)
      : currentArtifact.content;

    const refinedContent = await this.refineContent(
      currentContent,
      refinements,
      changes,
      coachProfile,
      currentArtifact.artifactType
    );

    await this.prisma.conversationArtifact.updateMany({
      where: {
        conversationID,
        artifactType: currentArtifact.artifactType,
        isCurrent: true
      },
      data: { isCurrent: false }
    });

    const newArtifact = await this.prisma.conversationArtifact.create({
      data: {
        conversationID,
        artifactType: currentArtifact.artifactType,
        title: currentArtifact.title,
        content: JSON.stringify(refinedContent),
        metadata: {
          ...(currentArtifact.metadata as any),
          refinements,
          changes,
          previousVersion: currentArtifact.id
        },
        version: currentArtifact.version + 1,
        isCurrent: true,
      }
    });

    await this.prisma.agentConversationMessage.create({
      data: {
        conversationID,
        senderType: 'agent',
        content: `I've refined your ${currentArtifact.artifactType.replace('_', ' ')} based on your feedback: "${refinements}"`,
        messageType: 'artifact_response',
      }
    });

    return {
      artifact: newArtifact,
      message: 'Artifact refined successfully'
    };
  }

  private async generateContentScript(
    conversation: any,
    coachProfile: any,
    requirements: ContentRequirements
  ): Promise<ContentScript> {
    const context = this.buildContentContext(conversation, requirements);

    const systemPrompt = `You are a content creation expert helping a ${coachProfile?.businessContext?.industry || 'coaching'} professional create engaging content.

COACH PROFILE:
- Communication Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Expertise: ${coachProfile?.businessContext?.expertise?.join(', ') || 'general coaching'}
- Target Audience: ${coachProfile?.businessContext?.targetAudience?.join(', ') || 'professionals'}

Create a content script with:
1. Hook: Attention-grabbing opening (1-2 sentences)
2. Main Content: Valuable, actionable content (3-5 paragraphs)
3. Call to Action: Clear next step for audience

Respond in JSON format:
{
  "hook": "attention-grabbing opening",
  "mainContent": "valuable content paragraphs",
  "callToAction": "clear next step",
  "hashtags": ["relevant", "hashtags"],
  "estimatedEngagement": {"min": 50, "max": 200}
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
        temperature: 0.8,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error generating content script:', error);
      throw new Error('Failed to generate content script');
    }
  }

  private async generateSocialPost(
    conversation: any,
    coachProfile: any,
    requirements: ContentRequirements
  ) {
    const platform = requirements.platform?.[0] || 'LinkedIn';
    const context = this.buildContentContext(conversation, requirements);

    const systemPrompt = `Create a ${platform} post for a ${coachProfile?.businessContext?.industry || 'coaching'} professional.

REQUIREMENTS:
- Platform: ${platform}
- Tone: ${requirements.tone || coachProfile?.personality?.communicationStyle || 'professional'}
- Length: ${requirements.length || 'medium'}
- Target: ${requirements.targetAudience || 'professionals'}

Create engaging ${platform} content with appropriate formatting, hashtags, and call-to-action.

Respond in JSON format:
{
  "content": "the post content with proper formatting",
  "hashtags": ["relevant", "hashtags"],
  "engagement_tips": ["tip1", "tip2"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
        temperature: 0.7,
        max_completion_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error generating social post:', error);
      throw new Error('Failed to generate social post');
    }
  }

  private async generateBlogOutline(
    conversation: any,
    coachProfile: any,
    requirements: ContentRequirements
  ) {
    const context = this.buildContentContext(conversation, requirements);

    const systemPrompt = `Create a comprehensive blog outline for a ${coachProfile?.businessContext?.industry || 'coaching'} professional.

COACH EXPERTISE: ${coachProfile?.businessContext?.expertise?.join(', ') || 'general coaching'}
TARGET AUDIENCE: ${requirements.targetAudience || 'professionals seeking growth'}

Create a detailed blog outline with:
- Compelling headline
- Introduction hook
- 3-5 main sections with subpoints
- Conclusion with key takeaways
- Suggested call-to-action

Respond in JSON format:
{
  "headline": "compelling blog title",
  "introduction": "hook and setup",
  "sections": [
    {
      "title": "section title",
      "points": ["point 1", "point 2"]
    }
  ],
  "conclusion": "key takeaways",
  "callToAction": "suggested CTA",
  "seoKeywords": ["keyword1", "keyword2"]
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
      this.logger.error('Error generating blog outline:', error);
      throw new Error('Failed to generate blog outline');
    }
  }

  private async refineContent(
    currentContent: any,
    refinements: string,
    changes: any,
    coachProfile: any,
    artifactType: string
  ) {
    const systemPrompt = `Refine the existing ${artifactType.replace('_', ' ')} based on the feedback.

ORIGINAL CONTENT: ${JSON.stringify(currentContent)}

REFINEMENT REQUEST: ${refinements}
SPECIFIC CHANGES: ${JSON.stringify(changes || {})}

COACH STYLE: ${coachProfile?.personality?.communicationStyle || 'professional'}

Improve the content while maintaining the coach's authentic voice and style.
Return the refined version in the same JSON format as the original.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please refine this content based on the feedback provided.' },
        ],
        temperature: 0.6,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Error refining content:', error);
      throw new Error('Failed to refine content');
    }
  }

  private buildContentContext(conversation: any, requirements: ContentRequirements): string {
    const recentMessages = conversation.messages?.slice(-5) || [];
    const context = recentMessages
      .map((m: any) => `${m.senderType === 'coach' ? 'Coach' : 'Assistant'}: ${m.content}`)
      .join('\n');

    return `
CONVERSATION CONTEXT:
${context}

CONTENT REQUIREMENTS:
- Platform: ${requirements.platform?.join(', ') || 'General'}
- Content Type: ${requirements.contentType || 'Educational'}
- Target Audience: ${requirements.targetAudience || 'Professionals'}
- Tone: ${requirements.tone || 'Professional'}
- Length: ${requirements.length || 'Medium'}

Please create content that addresses the coach's request while matching their style and audience needs.`;
  }
}
