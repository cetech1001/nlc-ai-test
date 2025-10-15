import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AgentType, EmailParticipantType, EmailStatus } from '@nlc-ai/types';
import { JwtService } from "@nestjs/jwt";

export interface SequenceConfig {
  emailCount?: number;
  sequenceType?: 'aggressive' | 'standard' | 'nurturing' | 'minimal';
  customInstructions?: string;
  timings?: string[];
}

export interface EmailInSequence {
  id: string;
  sequenceOrder: number;
  subject: string;
  body: string;
  timing: string;
  scheduledFor: Date;
  status: string;
  deliverabilityScore?: number;
  isEdited: boolean;
  sentAt?: Date;
}

export interface EmailSequenceWithEmails {
  id: string;
  name: string;
  description: string;
  leadID: string;
  totalEmails: number;
  emailsSent: number;
  emailsPending: number;
  isActive: boolean;
  emails: EmailInSequence[];
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
      // Find email threads with this lead
      const threads = await this.prisma.emailThread.findMany({
        where: {
          userID: coachID,
          participantEmail: leadEmail,
          participantType: EmailParticipantType.LEAD,
        },
        select: {
          threadID: true,
        },
        take: 5, // Get up to 5 most recent threads
        orderBy: {
          lastMessageAt: 'desc',
        },
      });

      if (threads.length === 0) {
        return [];
      }

      // Fetch messages from each thread
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

      // Sort by date and return most recent 20
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
  ): Promise<EmailSequenceWithEmails> {
    const { replicaConfig } = await this.getCoachReplicaConfig(coachID);

    // Fetch lead details
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
        status: EmailStatus.SCHEDULED,
      },
    });

    if (existingSequence) {
      throw new BadRequestException('An active sequence already exists for this lead');
    }

    // Fetch email history
    const emailHistory = await this.fetchLeadEmailHistory(coachID, lead.email);

    // Generate sequence using AI
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

      // Parse AI response
      let emails: any[];
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

      // Create sequence in database
      const sequence = await this.prisma.emailSequence.create({
        data: {
          userID: coachID,
          userType: 'coach',
          targetID: leadID,
          targetType: EmailParticipantType.LEAD,
          name: `Follow-up: ${lead.name}`,
          description: `${template.name} sequence for ${lead.name}`,
          triggerType: 'manual',
          status: EmailStatus.SCHEDULED,
          isActive: true,
          sequence: emails,
        },
      });

      // Create individual email messages
      const now = new Date();
      const coach = await this.prisma.coach.findUnique({
        where: { id: coachID },
        select: { email: true },
      });

      const createdEmails: EmailInSequence[] = [];

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const timing = timings[i] || '1-week';
        const timingConfig = TIMING_CONFIGS[timing as keyof typeof TIMING_CONFIGS];

        const scheduledFor = new Date(now);
        scheduledFor.setDate(scheduledFor.getDate() + timingConfig.days);

        const emailMessage = await this.prisma.emailMessage.create({
          data: {
            emailSequenceID: sequence.id,
            userID: coachID,
            userType: 'coach',
            from: coach?.email || '',
            to: lead.email,
            subject: email.subject,
            html: email.body,
            text: email.body.replace(/<[^>]*>/g, ''),
            scheduledFor,
            status: EmailStatus.SCHEDULED,
            metadata: {
              sequenceOrder: email.sequenceOrder,
              timing,
              keyPoints: email.keyPoints,
              callToAction: email.callToAction,
              leadID,
              leadName: lead.name,
            },
          },
        });

        createdEmails.push({
          id: emailMessage.id,
          sequenceOrder: email.sequenceOrder,
          subject: email.subject,
          body: email.body,
          timing,
          scheduledFor,
          status: EmailStatus.SCHEDULED,
          isEdited: false,
        });
      }

      this.logger.log(`Created ${emailCount}-email sequence for lead ${leadID}`);

      return {
        id: sequence.id,
        name: sequence.name,
        description: sequence.description || '',
        leadID,
        totalEmails: emailCount,
        emailsSent: 0,
        emailsPending: emailCount,
        isActive: true,
        emails: createdEmails,
      };

    } catch (error: any) {
      this.logger.error('Failed to generate follow-up sequence:', error);
      throw new BadRequestException(`Failed to generate sequence: ${error.message}`);
    }
  }

  async getSequencesForLead(coachID: string, leadID: string) {
    const sequences = await this.prisma.emailSequence.findMany({
      where: {
        userID: coachID,
        targetID: leadID,
        targetType: EmailParticipantType.LEAD,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const enrichedSequences: EmailSequenceWithEmails[] = await Promise.all(
      sequences.map(async (seq) => {
        const emails = await this.prisma.emailMessage.findMany({
          where: {
            emailSequenceID: seq.id,
          },
          orderBy: {
            scheduledFor: 'asc',
          },
        });

        const emailsSent = emails.filter(e => e.status === EmailStatus.SENT).length;
        const emailsPending = emails.filter(e =>
          e.status === EmailStatus.SCHEDULED || e.status === EmailStatus.PENDING
        ).length;

        return {
          id: seq.id,
          name: seq.name,
          description: seq.description || '',
          leadID,
          totalEmails: emails.length,
          emailsSent,
          emailsPending,
          isActive: seq.isActive,
          emails: emails.map(e => ({
            id: e.id,
            sequenceOrder: (e.metadata as any)?.sequenceOrder || 0,
            subject: e.subject || '',
            body: e.html || e.text || '',
            timing: (e.metadata as any)?.timing || '1-week',
            scheduledFor: e.scheduledFor || new Date(),
            status: e.status,
            deliverabilityScore: undefined,
            isEdited: false,
            sentAt: e.sentAt || undefined,
          })),
        };
      })
    );

    return { sequences: enrichedSequences };
  }

  async pauseSequence(coachID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: {
        id: sequenceID,
        userID: coachID,
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: { isActive: false },
    });

    await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: EmailStatus.SCHEDULED,
      },
      data: {
        status: EmailStatus.PAUSED,
      },
    });

    return { success: true, message: 'Sequence paused' };
  }

  async resumeSequence(coachID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: {
        id: sequenceID,
        userID: coachID,
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: { isActive: true },
    });

    await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: EmailStatus.PAUSED,
      },
      data: {
        status: EmailStatus.SCHEDULED,
      },
    });

    return { success: true, message: 'Sequence resumed' };
  }

  async cancelSequence(coachID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: {
        id: sequenceID,
        userID: coachID,
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: {
        isActive: false,
        status: EmailStatus.CANCELLED,
      },
    });

    await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: {
          in: [EmailStatus.SCHEDULED, EmailStatus.PENDING, EmailStatus.PAUSED],
        },
      },
      data: {
        status: EmailStatus.CANCELLED,
      },
    });

    return { success: true, message: 'Sequence cancelled' };
  }

  async getEmailByID(coachID: string, emailID: string): Promise<{ email: EmailInSequence }> {
    const email = await this.prisma.emailMessage.findFirst({
      where: {
        id: emailID,
        userID: coachID,
      },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    return {
      email: {
        id: email.id,
        sequenceOrder: (email.metadata as any)?.sequenceOrder || 0,
        subject: email.subject || '',
        body: email.html || email.text || '',
        timing: (email.metadata as any)?.timing || '1-week',
        scheduledFor: email.scheduledFor || new Date(),
        status: email.status,
        deliverabilityScore: undefined,
        isEdited: false,
        sentAt: email.sentAt || undefined,
      },
    };
  }

  async updateEmail(
    coachID: string,
    emailID: string,
    updates: {
      subject?: string;
      body?: string;
      scheduledFor?: string;
      timing?: string;
    }
  ) {
    const email = await this.prisma.emailMessage.findFirst({
      where: {
        id: emailID,
        userID: coachID,
      },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    const metadata = email.metadata as any || {};

    await this.prisma.emailMessage.update({
      where: { id: emailID },
      data: {
        subject: updates.subject,
        html: updates.body,
        text: updates.body ? updates.body.replace(/<[^>]*>/g, '') : undefined,
        scheduledFor: updates.scheduledFor ? new Date(updates.scheduledFor) : undefined,
        metadata: {
          ...metadata,
          timing: updates.timing || metadata.timing,
          isEdited: true,
        },
      },
    });

    return { success: true, message: 'Email updated' };
  }

  async regenerateEmails(
    coachID: string,
    params: {
      sequenceID: string;
      emailOrders: number[];
      customInstructions?: string;
    }
  ) {
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
    // const emailHistory = await this.fetchLeadEmailHistory(coachID, lead.email);

    // Fetch existing emails in sequence
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

    // Update emails
    for (let i = 0; i < params.emailOrders.length; i++) {
      const order = params.emailOrders[i];
      const emailToUpdate = existingEmails[order - 1];
      const newEmail = newEmails[i];

      if (emailToUpdate && newEmail) {
        await this.prisma.emailMessage.update({
          where: { id: emailToUpdate.id },
          data: {
            subject: newEmail.subject,
            html: newEmail.body,
            text: newEmail.body.replace(/<[^>]*>/g, ''),
            metadata: {
              ...((emailToUpdate.metadata as any) || {}),
              keyPoints: newEmail.keyPoints,
              callToAction: newEmail.callToAction,
              isEdited: true,
              regeneratedAt: new Date().toISOString(),
            },
          },
        });
      }
    }

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
