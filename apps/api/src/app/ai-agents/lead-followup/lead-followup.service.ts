// apps/api/src/app/ai-agents/lead-followup/flexible-lead-followup.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoachReplicaService } from '../coach-replica/coach-replica.service';
import { EmailDeliverabilityService } from '../email-deliverability/email-deliverability.service';
import {
  CreateSequenceRequest,
  UpdateSequenceRequest,
  UpdateEmailRequest,
  EmailSequenceWithEmails,
  EmailInSequence,
  RegenerateEmailsRequest,
  CoachReplicaRequest
} from '@nlc-ai/types';

@Injectable()
export class LeadFollowupService {
  private readonly logger = new Logger(LeadFollowupService.name);

  constructor(
    private prisma: PrismaService,
    private coachReplicaService: CoachReplicaService,
    private emailDeliverabilityService: EmailDeliverabilityService,
  ) {}

  /**
   * Create a flexible email sequence based on coach preferences
   */
  async createSequence(request: CreateSequenceRequest): Promise<EmailSequenceWithEmails> {
    const { leadID, coachID, sequenceConfig } = request;

    // Validate email count
    if (sequenceConfig.emailCount < 1 || sequenceConfig.emailCount > 10) {
      throw new BadRequestException('Email count must be between 1 and 10');
    }

    // Get lead and coach data
    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } })
    ]);

    if (!lead || !coach) {
      throw new NotFoundException('Lead or coach not found');
    }

    // Cancel any existing active sequences for this lead
    await this.cancelExistingSequences(leadID);

    // Generate timings if not provided
    const timings = sequenceConfig.timings ||
      this.generateDefaultTimings(sequenceConfig.emailCount, sequenceConfig.sequenceType);

    // Create the email sequence record
    const emailSequence = await this.prisma.emailSequence.create({
      data: {
        leadID,
        coachID,
        status: lead.status,
        description: this.generateSequenceDescription(sequenceConfig),
        isActive: true,
        sequence: [], // We'll populate this with individual emails
      }
    });

    // Generate each email using Coach Replica
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

    // Return complete sequence with emails
    return {
      id: emailSequence.id,
      leadID: emailSequence.leadID,
      coachID: emailSequence.coachID,
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
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        status: lead.status,
      },
      emails
    };
  }

  /**
   * Update an existing sequence (add/remove emails, change timings)
   */
  async updateSequence(request: UpdateSequenceRequest): Promise<EmailSequenceWithEmails> {
    const { sequenceID, updates } = request;

    const sequence = await this.getSequenceWithEmails(sequenceID);

    // Update basic sequence info
    const updatedSequence = await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: {
        description: updates.description || sequence.description,
        isActive: updates.isActive ?? sequence.isActive,
        updatedAt: new Date(),
      }
    });

    // Handle email count changes
    if (updates.emailCount && updates.emailCount !== sequence.totalEmails) {
      await this.adjustEmailCount(sequence, updates.emailCount, updates.timings);
    }

    // Handle timing changes
    if (updates.timings && !updates.emailCount) {
      await this.updateEmailTimings(sequenceID, updates.timings);
    }

    return this.getSequenceWithEmails(sequenceID);
  }

  /**
   * Update a specific email in the sequence
   */
  async updateEmail(request: UpdateEmailRequest): Promise<EmailInSequence> {
    const { emailID, updates } = request;

    const existingEmail = await this.prisma.scheduledEmail.findUnique({
      where: { id: emailID }
    });

    if (!existingEmail) {
      throw new NotFoundException('Email not found');
    }

    // Don't allow editing sent emails
    if (existingEmail.status === 'sent') {
      throw new BadRequestException('Cannot edit emails that have already been sent');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.subject) {
      updateData.subject = updates.subject;
    }

    if (updates.body) {
      updateData.body = updates.body;
      // Store original AI version if this is the first edit
      if (!existingEmail.errorMessage) { // Using errorMessage field to store original
        updateData.errorMessage = JSON.stringify({
          originalSubject: existingEmail.subject,
          originalBody: existingEmail.body,
          editedAt: new Date(),
        });
      }
    }

    if (updates.scheduledFor) {
      updateData.scheduledFor = new Date(updates.scheduledFor);
    }

    const updatedEmail = await this.prisma.scheduledEmail.update({
      where: { id: emailID },
      data: updateData
    });

    // Check deliverability if content was changed
    let deliverabilityScore;
    if (updates.subject || updates.body) {
      const analysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(
        updatedEmail.subject,
        updatedEmail.body
      );
      deliverabilityScore = analysis.score;
    }

    return this.mapToEmailInSequence(updatedEmail, deliverabilityScore);
  }

  /**
   * Regenerate specific emails in a sequence
   */
  async regenerateEmails(request: RegenerateEmailsRequest): Promise<EmailInSequence[]> {
    const { sequenceID, emailOrders, customInstructions } = request;

    const sequence = await this.getSequenceWithEmails(sequenceID);
    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: sequence.leadID } }),
      this.prisma.coach.findUnique({ where: { id: sequence.coachID } })
    ]);

    if (!lead || !coach) {
      throw new NotFoundException('Lead or coach not found');
    }

    const regeneratedEmails: EmailInSequence[] = [];

    for (const order of emailOrders) {
      const existingEmail = sequence.emails.find(e => e.sequenceOrder === order);
      if (!existingEmail) {
        throw new NotFoundException(`Email at position ${order} not found`);
      }

      // Don't regenerate sent emails
      if (existingEmail.status === 'sent') {
        throw new BadRequestException(`Cannot regenerate email at position ${order} - already sent`);
      }

      // Generate new email content
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
        existingEmail.id // Update existing instead of creating new
      );

      regeneratedEmails.push(newEmail);
    }

    return regeneratedEmails;
  }

  /**
   * Get sequence with all emails
   */
  async getSequenceWithEmails(sequenceID: string): Promise<EmailSequenceWithEmails> {
    const sequence = await this.prisma.emailSequence.findUnique({
      where: { id: sequenceID },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          }
        },
        scheduledEmails: {
          orderBy: { sequenceOrder: 'asc' }
        }
      }
    });

    if (!sequence) {
      throw new NotFoundException('Email sequence not found');
    }

    const emails: EmailInSequence[] = await Promise.all(
      sequence.scheduledEmails.map(email => this.mapToEmailInSequence(email))
    );

    return {
      id: sequence.id,
      leadID: sequence.leadID,
      coachID: sequence.coachID,
      status: sequence.status,
      description: sequence.description,
      isActive: sequence.isActive,
      totalEmails: emails.length,
      emailsSent: emails.filter(e => e.status === 'sent').length,
      emailsPending: emails.filter(e => e.status === 'scheduled').length,
      createdAt: sequence.createdAt,
      updatedAt: sequence.updatedAt,
      lead: sequence.lead,
      emails
    };
  }

  /**
   * Cancel existing sequences for a lead
   */
  private async cancelExistingSequences(leadID: string): Promise<void> {
    await this.prisma.scheduledEmail.updateMany({
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

  /**
   * Generate default timings based on email count and sequence type
   */
  private generateDefaultTimings(emailCount: number, sequenceType: string = 'standard'): string[] {
    const timingTemplates = {
      aggressive: ['immediate', '1-day', '3-days', '5-days', '1-week', '10-days', '2-weeks'],
      standard: ['immediate', '3-days', '1-week', '2-weeks', '3-weeks', '1-month', '6-weeks'],
      nurturing: ['immediate', '5-days', '2-weeks', '3-weeks', '1-month', '6-weeks', '2-months'],
      minimal: ['immediate', '1-week', '1-month']
    };

    const template = timingTemplates[sequenceType] || timingTemplates.standard;
    return template.slice(0, emailCount);
  }

  /**
   * Generate sequence description based on config
   */
  private generateSequenceDescription(config: any): string {
    const type = config.sequenceType || 'standard';
    const count = config.emailCount;

    return `${count}-email ${type} follow-up sequence${config.customInstructions ? ' (customized)' : ''}`;
  }

  /**
   * Generate a single email in the sequence
   */
  private async generateSequenceEmail(
    lead: any,
    coach: any,
    emailNumber: number,
    timing: string,
    config: any,
    sequenceID: string,
    existingEmailID?: string
  ): Promise<EmailInSequence> {
    // Build context for this specific email
    const context = this.buildEmailContext(lead, coach, emailNumber, config.emailCount, timing, config);

    const request: CoachReplicaRequest = {
      coachID: coach.id,
      context,
      requestType: 'lead_follow_up',
      additionalData: {
        leadInfo: {
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email,
          status: lead.status,
          source: lead.source,
          notes: lead.notes
        },
        emailNumber,
        totalEmails: config.emailCount,
        timing,
        customInstructions: config.customInstructions,
        sequenceType: config.sequenceType
      }
    };

    // Generate content using Coach Replica
    const response = await this.coachReplicaService.generateCoachResponse(request);

    const subject = this.extractSubject(response.response) || `Follow-up #${emailNumber} from ${coach.firstName}`;
    const body = this.extractBody(response.response) || response.response;

    // Calculate send time
    const scheduledFor = this.calculateSendTime(timing);

    // Check deliverability
    const deliverabilityAnalysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(subject, body);

    // Create or update the scheduled email
    const emailData = {
      leadID: lead.id,
      coachID: coach.id,
      emailSequenceID: sequenceID,
      subject,
      body,
      sequenceOrder: emailNumber,
      scheduledFor,
      status: 'scheduled',
      providerMessageID: JSON.stringify({
        originalAI: response.response,
        confidence: response.confidence,
        deliverabilityScore: deliverabilityAnalysis.score
      })
    };

    let scheduledEmail;
    if (existingEmailID) {
      scheduledEmail = await this.prisma.scheduledEmail.update({
        where: { id: existingEmailID },
        data: emailData
      });
    } else {
      scheduledEmail = await this.prisma.scheduledEmail.create({
        data: emailData
      });
    }

    return this.mapToEmailInSequence(scheduledEmail, deliverabilityAnalysis.score);
  }

  /**
   * Build context for specific email in sequence
   */
  private buildEmailContext(lead: any, coach: any, emailNumber: number, totalEmails: number, timing: string, config: any): string {
    const baseContext = `
Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Status: ${lead.status}
- Source: ${lead.source || 'Website'}
- Notes: ${lead.notes || 'No additional notes'}

Email Sequence Context:
- This is email ${emailNumber} of ${totalEmails} in the sequence
- Timing: ${timing}
- Sequence Type: ${config.sequenceType || 'standard'}
- Custom Instructions: ${config.customInstructions || 'None'}
`;

    // Add specific instructions based on email position
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

    return baseContext + specificInstructions + `
Generate an email that matches the coach's authentic voice and provides genuine value to the lead.`;
  }

  /**
   * Adjust email count in existing sequence
   */
  private async adjustEmailCount(sequence: EmailSequenceWithEmails, newCount: number, newTimings?: string[]): Promise<void> {
    const currentCount = sequence.totalEmails;

    if (newCount > currentCount) {
      // Add new emails
      const [lead, coach] = await Promise.all([
        this.prisma.lead.findUnique({ where: { id: sequence.leadID } }),
        this.prisma.coach.findUnique({ where: { id: sequence.coachID } })
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
      // Remove emails (only remove unsent ones)
      const emailsToRemove = sequence.emails
        .filter(email => email.sequenceOrder > newCount && email.status !== 'sent')
        .map(email => email.id);

      if (emailsToRemove.length > 0) {
        await this.prisma.scheduledEmail.updateMany({
          where: { id: { in: emailsToRemove } },
          data: { status: 'cancelled' }
        });
      }
    }
  }

  /**
   * Update email timings for existing sequence
   */
  private async updateEmailTimings(sequenceID: string, newTimings: string[]): Promise<void> {
    const emails = await this.prisma.scheduledEmail.findMany({
      where: {
        emailSequenceID: sequenceID,
        status: { in: ['scheduled', 'paused'] }
      },
      orderBy: { sequenceOrder: 'asc' }
    });

    for (let i = 0; i < Math.min(emails.length, newTimings.length); i++) {
      const newScheduledFor = this.calculateSendTime(newTimings[i]);

      await this.prisma.scheduledEmail.update({
        where: { id: emails[i].id },
        data: { scheduledFor: newScheduledFor }
      });
    }
  }

  /**
   * Calculate send time based on timing string
   */
  private calculateSendTime(timing: string): Date {
    const now = new Date();

    switch (timing) {
      case 'immediate':
        return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
      case '1-hour':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '3-hours':
        return new Date(now.getTime() + 3 * 60 * 60 * 1000);
      case '1-day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '2-days':
        return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      case '3-days':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      case '5-days':
        return new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      case '1-week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '10-days':
        return new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      case '2-weeks':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case '3-weeks':
        return new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
      case '1-month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case '6-weeks':
        return new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000);
      case '2-months':
        return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      default:
        // Parse custom timing like "4-days", "2-hours", etc.
        const match = timing.match(/^(\d+)-(hour|day|week|month)s?$/);
        if (match) {
          const [, num, unit] = match;
          const multipliers = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
          };
          return new Date(now.getTime() + parseInt(num) * multipliers[unit]);
        }
        return now; // Fallback to immediate
    }
  }

  /**
   * Extract subject from AI response
   */
  private extractSubject(response: string): string | null {
    const subjectMatch = response.match(/Subject:\s*(.+)/i);
    if (subjectMatch) {
      return subjectMatch[1].trim();
    }
    return null;
  }

  /**
   * Extract body from AI response
   */
  private extractBody(response: string): string | null {
    let body = response.replace(/Subject:\s*.+\n*/i, '').trim();
    return body.length > 20 ? body : null;
  }

  /**
   * Map database email to EmailInSequence type
   */
  private async mapToEmailInSequence(email: any, deliverabilityScore?: number): Promise<EmailInSequence> {
    // Get deliverability score if not provided
    if (!deliverabilityScore) {
      try {
        const analysis = await this.emailDeliverabilityService.quickDeliverabilityCheck(
          email.subject,
          email.body
        );
        deliverabilityScore = analysis.score;
      } catch (error) {
        deliverabilityScore = 75; // Default score
      }
    }

    let originalAIVersion;
    try {
      const metadata = JSON.parse(email.providerMessageID || '{}');
      originalAIVersion = metadata.originalAI;
    } catch {
      originalAIVersion = undefined;
    }

    let isEdited = false;
    try {
      isEdited = !!JSON.parse(email.errorMessage || 'false');
    } catch {
      isEdited = false;
    }

    return {
      id: email.id,
      sequenceID: email.emailSequenceID,
      sequenceOrder: email.sequenceOrder,
      subject: email.subject,
      body: email.body,
      timing: this.inferTimingFromSchedule(email.scheduledFor),
      scheduledFor: email.scheduledFor,
      status: email.status,
      sentAt: email.sentAt,
      deliverabilityScore,
      isEdited,
      originalAIVersion,
    };
  }

  /**
   * Infer timing string from scheduled date
   */
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
}
