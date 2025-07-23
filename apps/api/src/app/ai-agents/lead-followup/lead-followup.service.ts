// apps/api/src/app/ai-agents/lead-followup/lead-followup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import {EmailService} from "../../email/email.service";

export interface EmailTemplate {
  subject: string;
  body: string;
  timing: string; // e.g., "immediate", "3-days", "1-week"
}

export interface LeadFollowupSequence {
  status: string;
  sequence: EmailTemplate[];
  description: string;
}

@Injectable()
export class LeadFollowupService {
  private readonly logger = new Logger(LeadFollowupService.name);
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateFollowupSequence(
    lead: any,
    coach: any,
  ): Promise<LeadFollowupSequence> {
    const prompt = this.buildPrompt(lead, coach);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // More cost-effective for development
        messages: [
          {
            role: 'system',
            content: `You are an expert email marketing AI that creates personalized follow-up sequences for coaches. Generate JSON responses with email templates based on lead status and coach information.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content);
      return this.formatSequence(response, lead.status);
    } catch (error) {
      this.logger.error('Error generating AI sequence:', error);
      return this.getFallbackSequence(lead.status);
    }
  }

  private buildPrompt(lead: any, coach: any): string {
    return `
Create a personalized email follow-up sequence for:

LEAD DETAILS:
- Name: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Status: ${lead.status}
- Source: ${lead.source || 'unknown'}
- Meeting Date: ${lead.meetingDate ? new Date(lead.meetingDate).toLocaleDateString() : 'Not scheduled'}
- Notes: ${lead.notes || 'No additional notes'}

COACH DETAILS:
- Name: ${coach.firstName} ${coach.lastName}
- Business: ${coach.businessName || 'Coaching Business'}
- Bio: ${coach.bio || 'Professional coach helping clients achieve their goals'}

REQUIREMENTS:
1. Create 4 emails for the sequence based on lead status
2. Make emails personal, valuable, and non-pushy
3. Include coach's personality and business context
4. Vary email lengths and approaches
5. Include clear but soft calls-to-action

STATUS-SPECIFIC GUIDANCE:
- "contacted": Welcome sequence with value content and trust building
- "scheduled": Meeting preparation, value delivery, and gentle reminders
- "converted": Onboarding, success tips, and relationship building
- "unresponsive": Re-engagement with different angles and final attempts

Return JSON format:
{
  "sequence": [
    {
      "subject": "Email subject line",
      "body": "Full email body with personalization",
      "timing": "immediate|3-days|1-week|2-weeks"
    }
  ],
  "description": "Brief description of the sequence strategy"
}
`;
  }

  private formatSequence(response: any, status: string): LeadFollowupSequence {
    return {
      status,
      sequence: response.sequence || [],
      description: response.description || 'AI-generated follow-up sequence',
    };
  }

  private getFallbackSequence(status: string): LeadFollowupSequence {
    const sequences = {
      contacted: {
        description: 'Welcome & Nurture Sequence',
        sequence: [
          {
            subject: 'Welcome! Let\'s start your journey',
            body: 'Thank you for your interest in working together. I\'m excited to help you achieve your goals.',
            timing: 'immediate',
          },
          {
            subject: 'Quick question about your goals',
            body: 'I\'d love to learn more about what you\'re hoping to accomplish. What\'s your biggest challenge right now?',
            timing: '3-days',
          },
          {
            subject: 'Success story that might inspire you',
            body: 'I wanted to share a quick success story from a client who had similar goals to yours.',
            timing: '1-week',
          },
          {
            subject: 'Still here if you need me',
            body: 'I know life gets busy. I\'m still here when you\'re ready to take the next step.',
            timing: '2-weeks',
          },
        ],
      },
      scheduled: {
        description: 'Meeting Preparation Sequence',
        sequence: [
          {
            subject: 'Your meeting is confirmed!',
            body: 'Looking forward to our conversation. Here\'s what to expect and how to prepare.',
            timing: 'immediate',
          },
          {
            subject: 'Quick prep for tomorrow\'s call',
            body: 'Just a friendly reminder about our call tomorrow. Here are a few questions to think about beforehand.',
            timing: '1-day',
          },
          {
            subject: 'See you in an hour!',
            body: 'Quick reminder about our call starting in one hour. Here\'s the meeting link again.',
            timing: '1-hour',
          },
          {
            subject: 'Thanks for a great conversation',
            body: 'I enjoyed our chat today. Here are the next steps we discussed.',
            timing: 'after-meeting',
          },
        ],
      },
      converted: {
        description: 'Onboarding & Success Sequence',
        sequence: [
          {
            subject: 'Welcome to the team! 🎉',
            body: 'I\'m thrilled to officially welcome you! Here\'s everything you need to get started.',
            timing: 'immediate',
          },
          {
            subject: 'Your first week roadmap',
            body: 'Here\'s your personalized roadmap for the first week. Let\'s hit the ground running!',
            timing: '1-day',
          },
          {
            subject: 'How are things going?',
            body: 'Just checking in on your first week. Any questions or challenges I can help with?',
            timing: '1-week',
          },
          {
            subject: 'Celebrating your progress',
            body: 'I wanted to acknowledge the progress you\'ve made already. Here\'s what I\'m seeing.',
            timing: '2-weeks',
          },
        ],
      },
      unresponsive: {
        description: 'Re-engagement & Recovery Sequence',
        sequence: [
          {
            subject: 'Checking in - how can I help?',
            body: 'I haven\'t heard from you in a while. Is there anything I can help clarify or address?',
            timing: 'immediate',
          },
          {
            subject: 'Different approach - maybe this resonates?',
            body: 'I realize my previous messages might not have hit the mark. Let me try a different angle.',
            timing: '5-days',
          },
          {
            subject: 'One resource before I go',
            body: 'I don\'t want to overwhelm your inbox, but I have one resource that might be valuable.',
            timing: '1-week',
          },
          {
            subject: 'Keeping the door open',
            body: 'I\'ll stop sending regular emails, but know that I\'m here if you ever want to reconnect.',
            timing: '2-weeks',
          },
        ],
      },
    };

    return sequences[status] || sequences.contacted;
  }

  async scheduleFollowupEmails(leadID: string, coachID: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadID },
    });

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
    });

    if (!lead || !coach) {
      throw new Error('Lead or coach not found');
    }

    const sequence = await this.generateFollowupSequence(lead, coach);

    // Store the sequence in the database for tracking
    await this.prisma.emailSequence.create({
      data: {
        leadID,
        coachID,
        status: lead.status,
        sequence: sequence.sequence,
        description: sequence.description,
        isActive: true,
      },
    });

    // Schedule each email in the sequence
    for (const [index, email] of sequence.sequence.entries()) {
      await this.scheduleEmail(leadID, coachID, email, index);
    }

    return sequence;
  }

  private async scheduleEmail(
    leadID: string,
    coachID: string,
    emailTemplate: EmailTemplate,
    sequenceOrder: number,
  ) {
    const sendAt = this.calculateSendTime(emailTemplate.timing);

    await this.prisma.scheduledEmail.create({
      data: {
        leadID,
        coachID,
        subject: emailTemplate.subject,
        body: emailTemplate.body,
        sequenceOrder,
        scheduledFor: sendAt,
        status: 'scheduled',
      },
    });
  }

  private calculateSendTime(timing: string): Date {
    const now = new Date();

    switch (timing) {
      case 'immediate':
        return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
      case '3-days':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      case '1-week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '2-weeks':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case '1-day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1-hour':
        return new Date(now.getTime() + 60 * 60 * 1000);
      default:
        return now;
    }
  }

  async sendScheduledEmails() {
    const emailsToSend = await this.prisma.scheduledEmail.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        lead: true,
        coach: true,
      },
    });

    for (const email of emailsToSend) {
      try {
        await this.sendLeadFollowupEmail(email);
        await this.prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(`Failed to send email ${email.id}:`, error);
        await this.prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
          },
        });
      }
    }
  }

  private async sendLeadFollowupEmail(
    leadEmail: string,
    leadName: string,
    coachName: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; messageID?: string; error?: string }> {
    try {
      // Use your existing email service method
      await this.emailService.sendLeadFollowupEmail(leadEmail, subject, body, body);
      return { success: true, messageID: `lead_${Date.now()}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateLeadStatus(leadID: string, newStatus: string, coachID: string) {
    // Cancel existing sequence
    await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: { in: ['scheduled', 'paused'] },
      },
      data: { status: 'cancelled' },
    });

    // Generate new sequence for the updated status
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadID },
    });

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
    });

    if (lead && coach) {
      // Update lead status
      await this.prisma.lead.update({
        where: { id: leadID },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      // Generate new sequence
      const updatedLead = { ...lead, status: newStatus };
      return await this.scheduleFollowupEmails(leadID, coachID);
    }
  }

  async getLeadEmailHistory(leadID: string) {
    return this.prisma.scheduledEmail.findMany({
      where: { leadID },
      orderBy: { scheduledFor: 'asc' },
      include: {
        emailSequence: true,
      },
    });
  }

  async getActiveSequences(coachID: string) {
    return this.prisma.emailSequence.findMany({
      where: {
        coachID,
        isActive: true,
      },
      include: {
        lead: true,
        scheduledEmails: {
          where: {
            status: { in: ['scheduled', 'sent'] },
          },
          orderBy: { scheduledFor: 'asc' },
        },
      },
    });
  }
}
