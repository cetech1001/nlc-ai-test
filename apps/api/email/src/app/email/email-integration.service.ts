import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './email-templates.service';

@Injectable()
export class EmailIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {}

  async sendLeadFollowupWithTemplate(data: {
    leadID: string;
    coachID: string;
    templateID?: string;
    subject?: string;
    content?: string;
    scheduledFor?: Date;
    sequenceOrder?: number;
    emailSequenceID?: string;
  }): Promise<{ scheduledEmailID: string; messageID?: string }> {
    const { leadID, coachID, templateID, subject, content, scheduledFor, sequenceOrder, emailSequenceID } = data;

    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!lead || !coach) {
      throw new Error('Lead or coach not found');
    }

    let finalSubject = subject;
    let finalContent = content;

    if (templateID) {
      const template = await this.emailTemplatesService.getTemplate(coachID, templateID);
      const templateVars = {
        leadName: lead.name,
        coachName: `${coach.firstName} ${coach.lastName}`,
        coachBusinessName: coach.businessName || '',
        firstName: lead.name.split(' ')[0],
        lastName: lead.name.split(' ').slice(1).join(' ') || '',
      };

      finalSubject = this.processTemplateVariables(template.template.subjectTemplate, templateVars);
      finalContent = this.processTemplateVariables(template.template.bodyTemplate, templateVars);

      await this.emailTemplatesService.incrementTemplateUsage(templateID);
    }

    const scheduledEmail = await this.prisma.scheduledEmail.create({
      data: {
        leadID,
        coachID,
        emailSequenceID,
        subject: finalSubject || 'Follow-up from your coach',
        body: finalContent || 'Thank you for your interest. I wanted to follow up with you.',
        sequenceOrder: sequenceOrder || 1,
        scheduledFor: scheduledFor || new Date(),
        status: 'scheduled',
        metadata: JSON.stringify({
          templateID,
          leadName: lead.name,
          coachName: `${coach.firstName} ${coach.lastName}`,
        }),
      },
    });

    if (!scheduledFor || scheduledFor <= new Date()) {
      try {
        const result = await this.emailService.sendLeadFollowupEmail(
          lead.email,
          finalSubject || 'Follow-up from your coach',
          finalContent || 'Thank you for your interest. I wanted to follow up with you.',
          `${coach.firstName} ${coach.lastName}`,
          lead.name,
          coach.businessName,
          sequenceOrder,
          undefined,
          this.generateUnsubscribeLink(leadID)
        );

        if (result.status === 200) {
          await this.prisma.scheduledEmail.update({
            where: { id: scheduledEmail.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              providerMessageID: result.messageID,
            },
          });

          return {
            scheduledEmailID: scheduledEmail.id,
            messageID: result.messageID,
          };
        }
      } catch (error) {
        console.error('Failed to send immediate email:', error);
      }
    }

    return { scheduledEmailID: scheduledEmail.id };
  }

  async sendClientResponseWithTemplate(data: {
    clientID: string;
    coachID: string;
    threadID?: string;
    templateID?: string;
    subject: string;
    content: string;
    scheduledFor?: Date;
    isReply?: boolean;
  }): Promise<{ scheduledEmailID: string; messageID?: string }> {
    const { clientID, coachID, threadID, templateID, subject, content, scheduledFor, isReply } = data;

    const [client, coach] = await Promise.all([
      this.prisma.client.findUnique({ where: { id: clientID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!client || !coach) {
      throw new Error('Client or coach not found');
    }

    let finalSubject = subject;
    let finalContent = content;

    if (templateID) {
      const template = await this.emailTemplatesService.getTemplate(coachID, templateID);
      const templateVars = {
        clientName: `${client.firstName} ${client.lastName}`,
        coachName: `${coach.firstName} ${coach.lastName}`,
        coachBusinessName: coach.businessName || '',
        firstName: client.firstName,
        lastName: client.lastName,
      };

      finalSubject = this.processTemplateVariables(template.template.subjectTemplate, templateVars);
      finalContent = this.processTemplateVariables(template.template.bodyTemplate, templateVars);

      await this.emailTemplatesService.incrementTemplateUsage(templateID);
    }

    const scheduledEmail = await this.prisma.scheduledEmail.create({
      data: {
        clientID,
        coachID,
        subject: finalSubject,
        body: finalContent,
        sequenceOrder: 1,
        scheduledFor: scheduledFor || new Date(),
        status: 'scheduled',
        metadata: JSON.stringify({
          templateID,
          threadID,
          clientName: `${client.firstName} ${client.lastName}`,
          coachName: `${coach.firstName} ${coach.lastName}`,
          isReply,
        }),
      },
    });

    if (!scheduledFor || scheduledFor <= new Date()) {
      try {
        const result = await this.emailService.sendClientResponseEmail(
          client.email,
          finalSubject,
          finalContent,
          `${coach.firstName} ${coach.lastName}`,
          `${client.firstName} ${client.lastName}`,
          coach.businessName,
          subject,
          isReply
        );

        if (result.status === 200) {
          await this.prisma.scheduledEmail.update({
            where: { id: scheduledEmail.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              providerMessageID: result.messageID,
            },
          });

          return {
            scheduledEmailID: scheduledEmail.id,
            messageID: result.messageID,
          };
        }
      } catch (error) {
        console.error('Failed to send immediate client email:', error);
      }
    }

    return { scheduledEmailID: scheduledEmail.id };
  }

  async handleSequenceCompletion(leadID: string, coachID: string): Promise<void> {
    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!lead || !coach) return;

    const totalSent = await this.prisma.scheduledEmail.count({
      where: { leadID, coachID, status: 'sent' },
    });

    try {
      await this.emailService.sendSequenceCompleteEmail(
        lead.email,
        lead.name,
        `${coach.firstName} ${coach.lastName}`,
        coach.businessName,
        totalSent,
        'Schedule a Call',
        `${process.env.FRONTEND_URL}/schedule/${coachID}`
      );

      await this.prisma.lead.update({
        where: { id: leadID },
        data: {
          status: 'sequence_completed',
          lastContactedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to send sequence completion email:', error);
    }
  }

  private processTemplateVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable] || match;
    });
  }

  private generateUnsubscribeLink(leadID: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://app.nextlevelcoach.ai';
    return `${baseUrl}/unsubscribe?leadId=${leadID}`;
  }
}
