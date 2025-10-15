import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AgentType, EmailParticipantType } from '@nlc-ai/types';
import { JwtService } from "@nestjs/jwt";

export interface SequenceConfig {
  emailCount?: number;
  sequenceType?: 'aggressive' | 'standard' | 'nurturing' | 'minimal';
  customInstructions?: string;
  timings?: string[];
}

export interface GeneratedEmail {
  sequenceOrder: number;
  subject: string;
  body: string;
  keyPoints: string[];
  callToAction: string;
}

export interface ThreadMessage {
  messageID: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  sentAt: string;
  isFromCoach: boolean;
}

const TIMING_CONFIGS = {
  immediate: { days: 0, label: 'Immediately' },
  '1-day': { days: 1, label: '1 day later' },
  '2-days': { days: 2, label: '2 days later' },
  '3-days': { days: 3, label: '3 days later' },
  '1-week': { days: 7, label: '1 week later' },
  '2-weeks': { days: 14, label: '2 weeks later' },
  '1-month': { days: 30, label: '1 month later' },
};

const SEQUENCE_TEMPLATES = {
  aggressive: {
    name: 'Aggressive Follow-up',
    defaultTimings: ['immediate', '1-day', '3-days', '1-week', '2-weeks'],
    recommendedEmailCount: 5,
    tone: 'urgent and action-oriented',
  },
  standard: {
    name: 'Standard Follow-up',
    defaultTimings: ['immediate', '2-days', '1-week', '2-weeks'],
    recommendedEmailCount: 4,
    tone: 'professional and encouraging',
  },
  nurturing: {
    name: 'Nurturing Follow-up',
    defaultTimings: ['immediate', '3-days', '1-week', '2-weeks', '1-month'],
    recommendedEmailCount: 5,
    tone: 'warm and supportive',
  },
  minimal: {
    name: 'Minimal Follow-up',
    defaultTimings: ['immediate', '1-week', '2-weeks'],
    recommendedEmailCount: 3,
    tone: 'concise and respectful',
  },
};

@Injectable()
export class LeadFollowupService {
  private readonly logger = new Logger(LeadFollowupService.name);
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

  private async fetchLeadEmailHistory(coachID: string, leadEmail: string): Promise<ThreadMessage[]> {
    try {
      const threads = await this.prisma.emailThread.findMany({
        where: {
          userID: coachID,
          participantEmail: leadEmail,
          participantType: EmailParticipantType.LEAD,
        },
        select: {
          threadID: true,
        },
        take: 5,
        orderBy: {
          lastMessageAt: 'desc',
        },
      });

      if (threads.length === 0) {
        return [];
      }

      const allMessages: ThreadMessage[] = [];
      const serviceToken = this.jwt.sign({
        origin: 'agents',
        destination: 'email',
        coachID,
      });

      for (const thread of threads) {
        try {
          const response = await firstValueFrom(
            this.httpService.get<{ messages: ThreadMessage[] }>(
              `${this.emailServiceUrl}/api/email/internal/threads/${thread.threadID}/messages`,
              {
                headers: {
                  'x-service-token': serviceToken,
                },
              }
            )
          );

          allMessages.push(...response.data.messages);
        } catch (error) {
          this.logger.warn(`Failed to fetch messages for thread ${thread.threadID}`, error);
        }
      }

      return allMessages
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        .slice(0, 20);
    } catch (error: any) {
      this.logger.error(`Failed to fetch lead email history: ${error.message}`, error);
      return [];
    }
  }

  private buildSequencePrompt(
    baseInstructions: string,
    lead: any,
    config: SequenceConfig,
    emailHistory: ThreadMessage[]
  ): string {
    const template = SEQUENCE_TEMPLATES[config.sequenceType || 'standard'];
    const emailCount = config.emailCount || template.recommendedEmailCount;

    const historyContext = emailHistory.length > 0
      ? `\n\nPREVIOUS EMAIL HISTORY WITH THIS LEAD:\n${emailHistory.slice(0, 10).map((msg, idx) =>
        `Email ${idx + 1} (${new Date(msg.sentAt).toLocaleDateString()}):\nFrom: ${msg.from}\nSubject: ${msg.subject}\n${msg.text.substring(0, 300)}...`
      ).join('\n\n')}`
      : '\n\nNO PREVIOUS EMAIL HISTORY: This is a new lead with no prior communication.';

    return `${baseInstructions}

CURRENT TASK: Generate Lead Follow-up Email Sequence

You are creating a ${emailCount}-email follow-up sequence for a lead using the "${template.name}" strategy.

LEAD INFORMATION:
- Name: ${lead.name}
- Email: ${lead.email}
- Status: ${lead.status}
- Source: ${lead.source || 'Unknown'}
- Initial Contact: ${lead.submittedAt ? new Date(lead.submittedAt).toLocaleDateString() : 'Unknown'}
- Last Contacted: ${lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : 'Never'}
${lead.notes ? `- Notes: ${lead.notes}` : ''}
${historyContext}

SEQUENCE STRATEGY: ${template.name}
- Tone: ${template.tone}
- Email Count: ${emailCount}
- Purpose: Move the lead toward booking a consultation/meeting

${config.customInstructions ? `\nCUSTOM INSTRUCTIONS:\n${config.customInstructions}\n` : ''}

EMAIL GENERATION REQUIREMENTS:
1. Generate EXACTLY ${emailCount} emails as a JSON array
2. Each email should build on the previous one in the sequence
3. Match the coach's authentic voice and communication style
4. Reference previous emails in the sequence naturally
5. Each email should have a clear call-to-action
6. Avoid being too pushy - maintain the coach's authentic approach
7. Consider the lead's status and previous interactions
8. Make each email valuable - provide insights, not just "checking in"

OUTPUT FORMAT:
Return a JSON array with EXACTLY ${emailCount} email objects. Each object must have:
{
  "sequenceOrder": number (1 to ${emailCount}),
  "subject": "Email subject line",
  "body": "Full email body in HTML format with proper formatting",
  "keyPoints": ["point 1", "point 2"],
  "callToAction": "The specific action you want the lead to take"
}

EXAMPLE EMAIL PROGRESSION:
Email 1: Introduction/value proposition, reference initial contact
Email 2: Share relevant insight or resource, soft CTA
Email 3: Address potential objections, social proof
Email 4: Create urgency, strong CTA to book meeting
Email 5: Final value-add, last chance CTA

Generate the complete ${emailCount}-email sequence now as a JSON array:`;
  }

  async generateFollowupSequence(
    coachID: string,
    leadID: string,
    config: SequenceConfig = {}
  ): Promise<{
    sequenceID: string;
    emails: GeneratedEmail[];
    sequenceConfig: {
      emailCount: number;
      sequenceType: string;
      timings: string[];
    };
  }> {
    const { replicaConfig } = await this.getCoachReplicaConfig(coachID);

    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadID,
        coachID,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Check if sequence already exists
    const existingSequence = await this.prisma.emailSequence.findFirst({
      where: {
        userID: coachID,
        targetID: leadID,
        targetType: EmailParticipantType.LEAD,
        isActive: true,
      },
    });

    if (existingSequence) {
      throw new BadRequestException('An active sequence already exists for this lead');
    }

    const emailHistory = await this.fetchLeadEmailHistory(coachID, lead.email);

    const template = SEQUENCE_TEMPLATES[config.sequenceType || 'standard'];
    const emailCount = config.emailCount || template.recommendedEmailCount;
    const timings = config.timings || template.defaultTimings.slice(0, emailCount);

    const prompt = this.buildSequencePrompt(
      replicaConfig.instructions || this.getDefaultInstructions(),
      lead,
      config,
      emailHistory
    );

    const model = replicaConfig.fineTunedModelID || replicaConfig.model || 'gpt-4o';

    try {
      await this.updateUsageStats(coachID, replicaConfig.agentID);

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Generate the ${emailCount}-email follow-up sequence for ${lead.name} as a JSON array.`,
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from AI');
      }

      let emails: GeneratedEmail[];
      try {
        const parsed = JSON.parse(responseContent);
        emails = Array.isArray(parsed) ? parsed : parsed.emails || [];
      } catch (parseError) {
        this.logger.error('Failed to parse AI response:', parseError);
        throw new BadRequestException('Failed to parse AI-generated sequence');
      }

      if (emails.length !== emailCount) {
        throw new BadRequestException(`Expected ${emailCount} emails, got ${emails.length}`);
      }

      // Create the sequence immediately
      const sequenceID = await this.createSequenceInEmailService(
        coachID,
        leadID,
        lead.name,
        emails,
        timings,
        template.name
      );

      this.logger.log(`Generated and created ${emailCount}-email sequence for lead ${leadID}`);

      return {
        sequenceID,
        emails,
        sequenceConfig: {
          emailCount,
          sequenceType: config.sequenceType || 'standard',
          timings,
        },
      };

    } catch (error: any) {
      this.logger.error('Failed to generate follow-up sequence:', error);
      throw new BadRequestException(`Failed to generate sequence: ${error.message}`);
    }
  }

  private async createSequenceInEmailService(
    coachID: string,
    leadID: string,
    leadName: string,
    emails: GeneratedEmail[],
    timings: string[],
    templateName: string
  ): Promise<string> {
    const now = new Date();

    // Create sequence
    const sequence = await this.prisma.emailSequence.create({
      data: {
        userID: coachID,
        userType: 'coach',
        targetID: leadID,
        targetType: EmailParticipantType.LEAD,
        name: `Follow-up: ${leadName}`,
        description: `${templateName} sequence for ${leadName}`,
        triggerType: 'manual',
        status: 'active',
        isActive: true,
        sequence: JSON.stringify(emails),
      },
    });

    // Get coach email
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true },
    });

    // Get lead email
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadID },
      select: { email: true },
    });

    // Create and schedule individual email messages
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const timing = timings[i] || '1-week';
      const timingConfig = TIMING_CONFIGS[timing as keyof typeof TIMING_CONFIGS];

      const scheduledFor = new Date(now);
      scheduledFor.setDate(scheduledFor.getDate() + timingConfig.days);

      await this.prisma.emailMessage.create({
        data: {
          emailSequenceID: sequence.id,
          userID: coachID,
          userType: 'coach',
          from: coach?.email || '',
          to: lead?.email || '',
          subject: email.subject,
          html: email.body,
          text: email.body.replace(/<[^>]*>/g, ''),
          scheduledFor,
          status: 'scheduled',
          metadata: {
            sequenceOrder: email.sequenceOrder,
            timing,
            keyPoints: email.keyPoints,
            callToAction: email.callToAction,
            leadID,
            leadName,
          },
        },
      });
    }

    this.logger.log(`Created sequence ${sequence.id} with ${emails.length} scheduled emails`);

    return sequence.id;
  }

  async regenerateEmails(
    coachID: string,
    params: {
      sequenceID: string;
      emailOrders: number[];
      customInstructions?: string;
    }
  ): Promise<GeneratedEmail[]> {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: {
        id: params.sequenceID,
        userID: coachID,
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    const lead = await this.prisma.lead.findUnique({
      where: { id: sequence.targetID || '' },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const { replicaConfig } = await this.getCoachReplicaConfig(coachID);

    const existingEmails = await this.prisma.emailMessage.findMany({
      where: { emailSequenceID: params.sequenceID },
      orderBy: { scheduledFor: 'asc' },
    });

    const regeneratePrompt = `${replicaConfig.instructions || this.getDefaultInstructions()}

TASK: Regenerate specific emails in an existing follow-up sequence

LEAD: ${lead.name} (${lead.email})
${params.customInstructions ? `\nCUSTOM INSTRUCTIONS: ${params.customInstructions}` : ''}

REGENERATE EMAILS AT POSITIONS: ${params.emailOrders.join(', ')}

EXISTING SEQUENCE CONTEXT:
${existingEmails.map((e, idx) => `Email ${idx + 1}: ${e.subject}`).join('\n')}

Generate ${params.emailOrders.length} replacement emails that fit naturally into this sequence.
Return as JSON array with sequenceOrder, subject, body, keyPoints, and callToAction fields.`;

    const completion = await this.openai.chat.completions.create({
      model: replicaConfig.fineTunedModelID || 'gpt-4o',
      messages: [
        { role: 'system', content: regeneratePrompt },
        { role: 'user', content: 'Generate the replacement emails as JSON array.' }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(responseContent);
    const newEmails = Array.isArray(parsed) ? parsed : parsed.emails || [];

    return newEmails;
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

  private getDefaultInstructions(): string {
    return `You are an AI assistant helping to create follow-up email sequences for leads.

When generating follow-up sequences:
1. Match the coach's communication style and tone
2. Be professional, helpful, and non-pushy
3. Provide value in each email, not just "checking in"
4. Build trust progressively through the sequence
5. Include clear calls-to-action
6. Reference previous emails naturally
7. Maintain the coach's authentic voice

Always create engaging, personalized emails that move leads toward booking a consultation.`;
  }
}
