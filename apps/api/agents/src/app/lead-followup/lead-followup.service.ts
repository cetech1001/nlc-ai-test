import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { CoachReplicaService } from '../coach-replica/coach-replica.service';
import { EmailDeliverabilityService } from '../email-deliverability/email-deliverability.service';
import {
  CreateSequenceRequest,
  UpdateSequenceRequest,
  UpdateEmailRequest,
  EmailSequenceWithEmails,
  EmailInSequence,
  RegenerateEmailsRequest, EmailMessageStatus, UserType
} from '@nlc-ai/types';

@Injectable()
export class LeadFollowupService {
  private readonly logger = new Logger(LeadFollowupService.name);
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private coachReplicaService: CoachReplicaService,
    private emailDeliverabilityService: EmailDeliverabilityService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async createSequence(request: CreateSequenceRequest): Promise<EmailSequenceWithEmails> {
    const { leadID, coachID, sequenceConfig } = request;

    if (sequenceConfig.emailCount < 1 || sequenceConfig.emailCount > 10) {
      throw new BadRequestException('Email count must be between 1 and 10');
    }

    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } })
    ]);

    if (!lead || !coach) {
      throw new NotFoundException('Lead or coach not found');
    }

    // Cancel existing active sequences
    await this.cancelExistingSequences(leadID);

    const timings = sequenceConfig.timings ||
      this.generateDefaultTimings(sequenceConfig.emailCount, sequenceConfig.sequenceType);

    const emailSequence = await this.prisma.emailSequence.create({
      data: {
        leadID,
        userID: coachID!,
        userType: UserType.COACH,
        status: lead.status,
        name: this.generateSequenceDescription(sequenceConfig),
        triggerType: 'manual',
        description: this.generateSequenceDescription(sequenceConfig),
        isActive: true,
        sequence: [],
      }
    });

    const emails: EmailInSequence[] = [];
    for (let i = 0; i < sequenceConfig.emailCount; i++) {
      const email = await this.generateSequenceEmail(
        lead,
        coach,
        i + 1,
        timings[i] || 'immediate',
        sequenceConfig,
        emailSequence.id
      );
      emails.push(email);
    }

    return {
      id: emailSequence.id,
      leadID: emailSequence.leadID!,
      coachID: emailSequence.coachID!,
      status: emailSequence.status,
      description: emailSequence.description || '',
      isActive: emailSequence.isActive,
      totalEmails: emails.length,
      emailsSent: 0,
      emailsPending: emails.length,
      createdAt: emailSequence.createdAt,
      updatedAt: emailSequence.updatedAt,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        status: lead.status,
      },
      emails
    };
  }

  async updateSequence(request: UpdateSequenceRequest): Promise<EmailSequenceWithEmails> {
    const { sequenceID, updates } = request;

    const sequence = await this.getSequenceWithEmails(sequenceID);

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: {
        description: updates.description || sequence.description,
        isActive: updates.isActive ?? sequence.isActive,
        updatedAt: new Date(),
      }
    });

    if (updates.emailCount && updates.emailCount !== sequence.totalEmails) {
      await this.adjustEmailCount(sequence, updates.emailCount, updates.timings);
    }

    if (updates.timings && !updates.emailCount) {
      await this.updateEmailTimings(sequenceID, updates.timings);
    }

    return this.getSequenceWithEmails(sequenceID);
  }

  async updateEmail(request: UpdateEmailRequest): Promise<EmailInSequence> {
    const { emailID, updates } = request;

    const existingEmail = await this.prisma.emailMessage.findUnique({
      where: { id: emailID }
    });

    if (!existingEmail) {
      throw new NotFoundException('Email not found');
    }

    if (existingEmail.status === 'sent') {
      throw new BadRequestException('Cannot edit emails that have already been sent');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.subject) updateData.subject = updates.subject;
    if (updates.body) updateData.text = updates.body;
    if (updates.scheduledFor) updateData.scheduledFor = new Date(updates.scheduledFor);

    const updatedEmail = await this.prisma.emailMessage.update({
      where: { id: emailID },
      data: updateData
    });

    let deliverabilityScore;
    if (updates.subject || updates.body) {
      const analysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(
        updatedEmail.subject || '',
        updatedEmail.text || ''
      );
      deliverabilityScore = analysis.score;
    }

    return this.mapToEmailInSequence(updatedEmail, deliverabilityScore);
  }

  async regenerateEmails(request: RegenerateEmailsRequest): Promise<EmailInSequence[]> {
    const { sequenceID, emailOrders, customInstructions } = request;

    const sequence = await this.getSequenceWithEmails(sequenceID);
    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: sequence.leadID } }),
      sequence.coachID ? this.prisma.coach.findUnique({ where: { id: sequence.coachID } }) : null,
    ]);

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const regeneratedEmails: EmailInSequence[] = [];

    for (const order of emailOrders) {
      const existingEmail = sequence.emails.find(e => e.sequenceOrder === order);
      if (!existingEmail) {
        throw new NotFoundException(`Email at position ${order} not found`);
      }

      if (existingEmail.status === 'sent') {
        throw new BadRequestException(`Cannot regenerate email at position ${order} - already sent`);
      }

      const newEmail = await this.generateSequenceEmail(
        lead,
        coach,
        order,
        existingEmail.timing,
        {
          emailCount: sequence.totalEmails,
          customInstructions,
          sequenceType: 'standard'
        },
        sequenceID,
        existingEmail.id
      );

      regeneratedEmails.push(newEmail);
    }

    return regeneratedEmails;
  }

  async getSequenceWithEmails(sequenceID: string): Promise<EmailSequenceWithEmails> {
    const sequence = await this.prisma.emailSequence.findUnique({
      where: { id: sequenceID },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          }
        },
        emailMessages: {
          orderBy: { sequenceOrder: 'asc' }
        }
      }
    });

    if (!sequence) {
      throw new NotFoundException('Email sequence not found');
    }

    const emails: EmailInSequence[] = await Promise.all(
      sequence.emailMessages.map(email => this.mapToEmailInSequence(email))
    );

    return {
      id: sequence.id,
      leadID: sequence.leadID!,
      coachID: sequence.coachID!,
      status: sequence.status,
      description: sequence.description,
      isActive: sequence.isActive,
      totalEmails: emails.length,
      emailsSent: emails.filter(e => e.status === 'sent').length,
      emailsPending: emails.filter(e => e.status === 'scheduled').length,
      createdAt: sequence.createdAt,
      updatedAt: sequence.updatedAt,
      lead: sequence.lead!,
      emails
    };
  }

  async getSequencesForCoach(coachID: string) {
    const sequences = await this.prisma.emailSequence.findMany({
      where: { coachID },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          }
        },
        emailMessages: {
          orderBy: { sequenceOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sequencesWithEmails = await Promise.all(
      sequences.map(async (sequence) => {
        const emails = await Promise.all(
          sequence.emailMessages.map(email => this.mapToEmailInSequence(email))
        );

        return {
          id: sequence.id,
          leadID: sequence.leadID!,
          coachID: sequence.coachID!,
          status: sequence.status,
          description: sequence.description,
          isActive: sequence.isActive,
          totalEmails: emails.length,
          emailsSent: emails.filter(e => e.status === 'sent').length,
          emailsPending: emails.filter(e => e.status === 'scheduled').length,
          createdAt: sequence.createdAt,
          updatedAt: sequence.updatedAt,
          lead: sequence.lead!,
          emails
        };
      })
    );

    return {
      sequences: sequencesWithEmails,
      totalCount: sequences.length,
      activeCount: sequences.filter(s => s.isActive).length,
      completedCount: sequences.filter(s =>
        s.emailMessages.every(email => email.status === 'sent' || email.status === 'cancelled')
      ).length
    };
  }

  async getSequencesForLead(leadID: string) {
    const sequences = await this.prisma.emailSequence.findMany({
      where: { leadID },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          }
        },
        emailMessages: {
          orderBy: { sequenceOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sequencesWithEmails = await Promise.all(
      sequences.map(async (sequence) => {
        const emails = await Promise.all(
          sequence.emailMessages.map(email => this.mapToEmailInSequence(email))
        );

        return {
          id: sequence.id,
          leadID: sequence.leadID!,
          coachID: sequence.coachID!,
          status: sequence.status,
          description: sequence.description,
          isActive: sequence.isActive,
          totalEmails: emails.length,
          emailsSent: emails.filter(e => e.status === 'sent').length,
          emailsPending: emails.filter(e => e.status === 'scheduled').length,
          createdAt: sequence.createdAt,
          updatedAt: sequence.updatedAt,
          lead: sequence.lead!,
          emails
        };
      })
    );

    const currentSequence = sequencesWithEmails.find(s => s.isActive) || null;
    const sequenceHistory = sequencesWithEmails.filter(s => !s.isActive);

    return {
      sequences: sequencesWithEmails,
      currentSequence,
      sequenceHistory
    };
  }

  async pauseSequenceEmails(sequenceID: string): Promise<void> {
    await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: 'scheduled'
      },
      data: {
        status: 'paused',
        updatedAt: new Date()
      }
    });

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: { isActive: false, updatedAt: new Date() }
    });

    this.logger.log(`Paused sequence ${sequenceID}`);
  }

  async resumeSequenceEmails(sequenceID: string): Promise<void> {
    const pausedEmails = await this.prisma.emailMessage.findMany({
      where: {
        emailSequenceID: sequenceID,
        status: 'paused'
      }
    });

    for (const email of pausedEmails) {
      const timing = this.inferTimingFromSchedule(email.scheduledFor!);
      const newScheduledFor = this.calculateSendTime(timing);

      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: 'scheduled',
          scheduledFor: newScheduledFor,
          updatedAt: new Date()
        }
      });
    }

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: { isActive: true, updatedAt: new Date() }
    });

    this.logger.log(`Resumed sequence ${sequenceID} with ${pausedEmails.length} emails`);
  }

  async cancelSequenceEmails(sequenceID: string): Promise<void> {
    await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: { in: ['scheduled', 'paused'] }
      },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: { isActive: false, updatedAt: new Date() }
    });

    this.logger.log(`Cancelled sequence ${sequenceID}`);
  }

  async getEmailPreview(emailID: string) {
    const emailMessage = await this.prisma.emailMessage.findUnique({
      where: { id: emailID },
      include: {
        lead: { select: { name: true, email: true } },
        coach: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            businessName: true
          }
        }
      }
    });

    if (!emailMessage) {
      throw new NotFoundException('Email not found');
    }

    const deliverabilityAnalysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(
      emailMessage.subject || '',
      emailMessage.text || ''
    );

    const email = await this.mapToEmailInSequence(emailMessage, deliverabilityAnalysis.score);
    const suggestions = this.generateImprovementSuggestions(emailMessage, deliverabilityAnalysis);

    return {
      email,
      deliverabilityAnalysis,
      suggestions
    };
  }

  // Private helper methods

  private async cancelExistingSequences(leadID: string): Promise<void> {
    await this.prisma.emailMessage.updateMany({
      where: {
        leadID,
        status: { in: ['scheduled', 'paused'] }
      },
      data: { status: 'cancelled' }
    });

    await this.prisma.emailSequence.updateMany({
      where: { leadID, isActive: true },
      data: { isActive: false }
    });
  }

  private generateDefaultTimings(emailCount: number, sequenceType: string = 'standard'): string[] {
    const timingTemplates = {
      aggressive: ['immediate', '1-day', '3-days', '5-days', '1-week', '10-days', '2-weeks'],
      standard: ['immediate', '3-days', '1-week', '2-weeks', '3-weeks', '1-month', '6-weeks'],
      nurturing: ['immediate', '5-days', '2-weeks', '3-weeks', '1-month', '6-weeks', '2-months'],
      minimal: ['immediate', '1-week', '1-month']
    };

    const template = timingTemplates[sequenceType as keyof typeof timingTemplates] || timingTemplates.standard;
    return template.slice(0, emailCount);
  }

  private generateSequenceDescription(config: any): string {
    const type = config.sequenceType || 'standard';
    const count = config.emailCount;
    return `${count}-email ${type} follow-up sequence${config.customInstructions ? ' (customized)' : ''}`;
  }

  private async generateSequenceEmail(
    lead: any,
    coach: any,
    emailNumber: number,
    timing: string,
    config: any,
    sequenceID: string,
    existingEmailID?: string
  ): Promise<EmailInSequence> {
    // Get coach profile for context
    const coachProfile = await this.coachReplicaService.getCoachKnowledgeProfile(coach?.id);

    const context = this.buildEmailContext(lead, coach, emailNumber, config.emailCount, timing, config);
    const response = await this.generateAIResponse(context, coachProfile);

    const subject = this.extractSubject(response.response) || `Follow-up #${emailNumber} from ${coach.firstName}`;
    const body = this.extractBody(response.response) || response.response;
    const scheduledFor = this.calculateSendTime(timing);

    const deliverabilityAnalysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(subject, body);

    const emailData = {
      leadID: lead.id,
      coachID: coach.id,
      emailSequenceID: sequenceID,
      subject,
      text: body,
      sequenceOrder: emailNumber,
      scheduledFor,
      to: lead.email,
      from: coach.email,
      status: EmailMessageStatus.SCHEDULED,
      metadata: JSON.stringify({
        originalAI: response.response,
        confidence: response.confidence,
        deliverabilityScore: deliverabilityAnalysis.score
      })
    };

    let emailMessage;
    if (existingEmailID) {
      emailMessage = await this.prisma.emailMessage.update({
        where: { id: existingEmailID },
        data: emailData
      });
    } else {
      emailMessage = await this.prisma.emailMessage.create({
        data: emailData
      });
    }

    return this.mapToEmailInSequence(emailMessage, deliverabilityAnalysis.score);
  }

  private async generateAIResponse(context: string, coachProfile: any) {
    const systemPrompt = `You are an AI assistant generating follow-up emails for a ${coachProfile?.businessContext?.industry || 'professional'} coach.

COACH COMMUNICATION STYLE:
- Style: ${coachProfile?.personality?.communicationStyle || 'professional'}
- Response Length: ${coachProfile?.personality?.responseLength || 'moderate'}
- Formality Level: ${coachProfile?.writingStyle?.formalityLevel || 7}/10
- Common Phrases: ${coachProfile?.personality?.commonPhrases?.join(', ') || 'N/A'}
- Preferred Greetings: ${coachProfile?.personality?.preferredGreetings?.join(', ') || 'Hi, Hello'}
- Preferred Closings: ${coachProfile?.personality?.preferredClosings?.join(', ') || 'Best regards'}

BUSINESS CONTEXT:
- Services: ${coachProfile?.businessContext?.services?.join(', ') || 'Coaching services'}
- Expertise: ${coachProfile?.businessContext?.expertise?.join(', ') || 'General coaching'}

Generate an email that matches this coach's authentic voice and provides genuine value.

Respond in JSON format:
{
  "response": "The complete email with subject and body",
  "confidence": 0.0-1.0,
  "reasoning": "Why this matches the coach's style"
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

  private buildEmailContext(lead: any, coach: any, emailNumber: number, totalEmails: number, timing: string, config: any): string {
    let specificInstructions = '';

    if (emailNumber === 1) {
      specificInstructions = `
This is the FIRST email in the sequence. Focus on:
1. Warm introduction and thank them for their interest
2. Set expectations for what's coming
3. Provide immediate value
4. Build rapport and trust
`;
    } else if (emailNumber === totalEmails) {
      specificInstructions = `
This is the FINAL email in the sequence. Focus on:
1. Graceful conclusion while leaving door open
2. Summarize key value provided
3. Clear next steps if they want to engage
4. Professional and respectful tone
`;
    } else {
      specificInstructions = `
This is email ${emailNumber} of ${totalEmails}. Focus on:
1. Build on previous emails in the sequence
2. Provide valuable insights or tips
3. Maintain relationship momentum
4. Include soft call-to-action appropriate for sequence position
`;
    }

    return `
LEAD INFORMATION:
- Name: ${lead.name}
- Email: ${lead.email}
- Status: ${lead.status}
- Source: ${lead.source || 'Website'}
- Notes: ${lead.notes || 'No additional notes'}

EMAIL SEQUENCE CONTEXT:
- This is email ${emailNumber} of ${totalEmails} in the sequence
- Timing: ${timing}
- Sequence Type: ${config.sequenceType || 'standard'}
- Custom Instructions: ${config.customInstructions || 'None'}

${specificInstructions}

Generate an email that matches the coach's authentic voice and provides genuine value to the lead.
`;
  }

  private async adjustEmailCount(sequence: EmailSequenceWithEmails, newCount: number, newTimings?: string[]): Promise<void> {
    const currentCount = sequence.totalEmails;

    if (newCount > currentCount) {
      const [lead, coach] = await Promise.all([
        this.prisma.lead.findUnique({ where: { id: sequence.leadID } }),
        sequence.coachID ? this.prisma.coach.findUnique({ where: { id: sequence.coachID } }) : null,
      ]);

      const timings = newTimings || this.generateDefaultTimings(newCount);

      for (let i = currentCount; i < newCount; i++) {
        await this.generateSequenceEmail(
          lead,
          coach,
          i + 1,
          timings[i] || `${i + 1}-days`,
          { emailCount: newCount, sequenceType: 'standard' },
          sequence.id
        );
      }
    } else if (newCount < currentCount) {
      const emailsToRemove = sequence.emails
        .filter(email => email.sequenceOrder > newCount && email.status !== 'sent')
        .map(email => email.id);

      if (emailsToRemove.length > 0) {
        await this.prisma.emailMessage.updateMany({
          where: { id: { in: emailsToRemove } },
          data: { status: 'cancelled' }
        });
      }
    }
  }

  private async updateEmailTimings(sequenceID: string, newTimings: string[]): Promise<void> {
    const emails = await this.prisma.emailMessage.findMany({
      where: {
        emailSequenceID: sequenceID,
        status: { in: ['scheduled', 'paused'] }
      },
      orderBy: { sequenceOrder: 'asc' }
    });

    for (let i = 0; i < Math.min(emails.length, newTimings.length); i++) {
      const newScheduledFor = this.calculateSendTime(newTimings[i]);

      await this.prisma.emailMessage.update({
        where: { id: emails[i].id },
        data: { scheduledFor: newScheduledFor }
      });
    }
  }

  private calculateSendTime(timing: string): Date {
    const now = new Date();

    const timingMap: { [key: string]: number } = {
      'immediate': 5 * 60 * 1000,
      '1-hour': 60 * 60 * 1000,
      '3-hours': 3 * 60 * 60 * 1000,
      '1-day': 24 * 60 * 60 * 1000,
      '2-days': 2 * 24 * 60 * 60 * 1000,
      '3-days': 3 * 24 * 60 * 60 * 1000,
      '5-days': 5 * 24 * 60 * 60 * 1000,
      '1-week': 7 * 24 * 60 * 60 * 1000,
      '10-days': 10 * 24 * 60 * 60 * 1000,
      '2-weeks': 14 * 24 * 60 * 60 * 1000,
      '3-weeks': 21 * 24 * 60 * 60 * 1000,
      '1-month': 30 * 24 * 60 * 60 * 1000,
      '6-weeks': 42 * 24 * 60 * 60 * 1000,
      '2-months': 60 * 24 * 60 * 60 * 1000
    };

    if (timingMap[timing]) {
      return new Date(now.getTime() + timingMap[timing]);
    }

    // Parse custom timing
    const match = timing.match(/^(\d+)-(hour|day|week|month)s?$/);
    if (match) {
      const [, num, unit] = match;
      const multipliers = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      return new Date(now.getTime() + parseInt(num) * multipliers[unit as keyof typeof multipliers]);
    }

    return now;
  }

  private extractSubject(response: string): string | null {
    const subjectMatch = response.match(/Subject:\s*(.+)/i);
    return subjectMatch ? subjectMatch[1].trim() : null;
  }

  private extractBody(response: string): string | null {
    let body = response.replace(/Subject:\s*.+\n*/i, '').trim();
    return body.length > 20 ? body : null;
  }

  private async mapToEmailInSequence(email: any, deliverabilityScore?: number): Promise<EmailInSequence> {
    if (!deliverabilityScore) {
      try {
        const analysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(
          email.subject || '',
          email.text || ''
        );
        deliverabilityScore = analysis.score;
      } catch (error) {
        deliverabilityScore = 75;
      }
    }

    return {
      id: email.id,
      sequenceID: email.emailSequenceID,
      sequenceOrder: email.sequenceOrder || 1,
      subject: email.subject || '',
      body: email.text || '',
      timing: this.inferTimingFromSchedule(email.scheduledFor || new Date()),
      scheduledFor: email.scheduledFor || new Date(),
      status: email.status,
      sentAt: email.sentAt,
      deliverabilityScore,
      isEdited: false,
      originalAIVersion: undefined,
    };
  }

  private inferTimingFromSchedule(scheduledFor: Date): string {
    const now = new Date();
    const diffMs = scheduledFor.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes <= 10) return 'immediate';
    if (diffHours <= 2) return `${diffHours}-hour${diffHours > 1 ? 's' : ''}`;
    if (diffDays <= 1) return '1-day';
    if (diffDays <= 30) return `${diffDays}-days`;

    const diffWeeks = Math.round(diffDays / 7);
    if (diffWeeks <= 8) return `${diffWeeks}-week${diffWeeks > 1 ? 's' : ''}`;

    const diffMonths = Math.round(diffDays / 30);
    return `${diffMonths}-month${diffMonths > 1 ? 's' : ''}`;
  }

  private generateImprovementSuggestions(email: any, analysis: any): string[] {
    const suggestions: string[] = [];

    if (email.subject && email.subject.length > 50) {
      suggestions.push('Consider shortening the subject line to under 50 characters for better mobile display');
    }

    if (email.subject && email.subject.includes('!')) {
      suggestions.push('Avoid exclamation marks in subject lines as they may trigger spam filters');
    }

    if (email.text && email.text.length > 2000) {
      suggestions.push('Consider shortening the email body for better engagement');
    }

    if (analysis.score < 70) {
      suggestions.push('Low deliverability score detected. Review content for spam triggers');
    }

    const ctaWords = ['click', 'call', 'schedule', 'book', 'download', 'register'];
    const hasCTA = ctaWords.some(word => email.text?.toLowerCase().includes(word));

    if (!hasCTA) {
      suggestions.push('Consider adding a clear call-to-action to guide the recipient');
    }

    const linkCount = (email.text?.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 3) {
      suggestions.push('Reduce the number of links to improve deliverability');
    }

    return suggestions;
  }
}
