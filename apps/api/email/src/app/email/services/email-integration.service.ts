import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {EmailService} from "./email.service";
import {EmailSchedulerService} from "./email-scheduler.service";
import {EmailTemplatesService} from "./email-templates.service";

@Injectable()
export class EmailIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {}

  // Main method for sending lead follow-up emails with template support
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

    // Get lead and coach data
    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!lead || !coach) {
      throw new Error('Lead or coach not found');
    }

    let finalSubject = subject;
    let finalContent = content;

    // If template is specified, use it
    if (templateID) {
      const template = await this.emailTemplatesService.getTemplate(coachID, templateID);

      // Process template variables
      const templateVars = {
        leadName: lead.name,
        coachName: `${coach.firstName} ${coach.lastName}`,
        coachBusinessName: coach.businessName || '',
        firstName: lead.name.split(' ')[0],
        lastName: lead.name.split(' ').slice(1).join(' ') || '',
      };

      finalSubject = this.processTemplateVariables(template.template.subjectTemplate, templateVars);
      finalContent = this.processTemplateVariables(template.template.bodyTemplate, templateVars);

      // Increment template usage
      await this.emailTemplatesService.incrementTemplateUsage(templateID);
    }

    // Create scheduled email
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

    // If scheduled for immediate delivery, try to send now
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
        // If immediate send fails, leave it scheduled for retry
        console.error('Failed to send immediate email:', error);
      }
    }

    return {
      scheduledEmailID: scheduledEmail.id,
    };
  }

  // Helper method for processing template variables
  private processTemplateVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable] || match;
    });
  }

  private generateUnsubscribeLink(leadID: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://app.nextlevelcoach.ai';
    return `${baseUrl}/unsubscribe?leadId=${leadID}`;
  }

  // Method for sending client responses with template support
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

    // Get client and coach data
    const [client, coach] = await Promise.all([
      this.prisma.client.findUnique({ where: { id: clientID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!client || !coach) {
      throw new Error('Client or coach not found');
    }

    let finalSubject = subject;
    let finalContent = content;

    // If template is specified, use it
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

    // Create scheduled email
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

    // If scheduled for immediate delivery, try to send now
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

    return {
      scheduledEmailID: scheduledEmail.id,
    };
  }

  // Bulk email operations
  async sendBulkEmailsWithTemplate(data: {
    coachID: string;
    templateID: string;
    recipients: Array<{
      leadID?: string;
      clientID?: string;
      email: string;
      name: string;
      customVariables?: Record<string, string>;
    }>;
    scheduledFor?: Date;
    batchSize?: number;
  }): Promise<{
    totalScheduled: number;
    totalSent: number;
    errors: Array<{ recipient: string; error: string }>;
  }> {
    const { coachID, templateID, recipients, scheduledFor, batchSize = 50 } = data;

    const [template, coach] = await Promise.all([
      this.emailTemplatesService.getTemplate(coachID, templateID),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!template || !coach) {
      throw new Error('Template or coach not found');
    }

    const results = {
      totalScheduled: 0,
      totalSent: 0,
      errors: [] as Array<{ recipient: string; error: string }>,
    };

    // Process in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(async (recipient) => {
        try {
          const templateVars = {
            recipientName: recipient.name,
            coachName: `${coach.firstName} ${coach.lastName}`,
            coachBusinessName: coach.businessName || '',
            firstName: recipient.name.split(' ')[0],
            lastName: recipient.name.split(' ').slice(1).join(' ') || '',
            ...recipient.customVariables,
          };

          const finalSubject = this.processTemplateVariables(template.template.subjectTemplate, templateVars);
          const finalContent = this.processTemplateVariables(template.template.bodyTemplate, templateVars);

          if (recipient.leadID) {
            await this.sendLeadFollowupWithTemplate({
              leadID: recipient.leadID,
              coachID,
              subject: finalSubject,
              content: finalContent,
              scheduledFor,
            });
          } else if (recipient.clientID) {
            await this.sendClientResponseWithTemplate({
              clientID: recipient.clientID,
              coachID,
              subject: finalSubject,
              content: finalContent,
              scheduledFor,
            });
          }

          if (!scheduledFor || scheduledFor <= new Date()) {
            results.totalSent++;
          } else {
            results.totalScheduled++;
          }
        } catch (error) {
          results.errors.push({
            recipient: recipient.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      await Promise.allSettled(batchPromises);
    }

    // Update template usage count
    await this.emailTemplatesService.incrementTemplateUsage(templateID);

    return results;
  }

  // Email sequence completion handler
  async handleSequenceCompletion(leadID: string, coachID: string): Promise<void> {
    const [lead, coach] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadID } }),
      this.prisma.coach.findUnique({ where: { id: coachID } }),
    ]);

    if (!lead || !coach) {
      return;
    }

    // Count total emails sent in the sequence
    const totalSent = await this.prisma.scheduledEmail.count({
      where: {
        leadID,
        coachID,
        status: 'sent',
      },
    });

    // Send sequence completion email
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

      // Update lead status
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

  // Email analytics aggregation
  async getEmailAnalytics(coachID: string, period: { start: Date; end: Date }) {
    const [
      emailStats,
      topTemplates,
      recentActivity,
      deliverabilityTrends
    ] = await Promise.all([
      this.emailService.getEmailStats(coachID, period),
      this.getTopPerformingTemplates(coachID, period),
      this.getRecentEmailActivity(coachID, 10),
      this.getDeliverabilityTrends(coachID, period),
    ]);

    return {
      period,
      stats: emailStats,
      topTemplates,
      recentActivity,
      deliverabilityTrends,
      insights: this.generateEmailInsights(emailStats, topTemplates),
    };
  }

  private async getTopPerformingTemplates(coachID: string, period: { start: Date; end: Date }) {
    // This would require tracking template usage in scheduled emails
    // For now, return top templates by usage count
    return this.prisma.emailTemplate.findMany({
      where: {
        coachID,
        isActive: true,
        lastUsedAt: {
          gte: period.start,
          lte: period.end,
        },
      },
      orderBy: { usageCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        usageCount: true,
        lastUsedAt: true,
      },
    });
  }

  private async getRecentEmailActivity(coachID: string, limit: number) {
    return this.prisma.scheduledEmail.findMany({
      where: { coachID },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        subject: true,
        status: true,
        sentAt: true,
        scheduledFor: true,
        lead: {
          select: {
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  private async getDeliverabilityTrends(coachID: string, period: { start: Date; end: Date }) {
    // Group by day and calculate delivery rates
    const dailyStats = await this.prisma.scheduledEmail.groupBy({
      by: ['status'],
      where: {
        coachID,
        updatedAt: {
          gte: period.start,
          lte: period.end,
        },
      },
      _count: {
        status: true,
      },
    });

    const statusCounts = dailyStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const sent = statusCounts.sent || 0;
    const failed = statusCounts.failed || 0;

    return {
      deliveryRate: total > 0 ? (sent / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      totalEmails: total,
      statusBreakdown: statusCounts,
    };
  }

  private generateEmailInsights(emailStats: any, topTemplates: any[]) {
    const insights = [];

    // Delivery rate insights
    if (emailStats.bounceRate > 5) {
      insights.push({
        type: 'warning',
        category: 'deliverability',
        message: `High bounce rate detected (${emailStats.bounceRate}%). Consider cleaning your email list.`,
        actionable: true,
        suggestion: 'Review and remove invalid email addresses from your contacts.',
      });
    }

    // Engagement insights
    if (emailStats.openRate < 20) {
      insights.push({
        type: 'tip',
        category: 'engagement',
        message: `Open rate is below average (${emailStats.openRate}%). Consider improving subject lines.`,
        actionable: true,
        suggestion: 'Try A/B testing different subject line styles or adding personalization.',
      });
    }

    // Template usage insights
    if (topTemplates.length > 0) {
      const mostUsed = topTemplates[0];
      insights.push({
        type: 'info',
        category: 'templates',
        message: `Your most effective template is "${mostUsed.name}" with ${mostUsed.usageCount} uses.`,
        actionable: false,
        suggestion: 'Consider creating variations of your successful templates.',
      });
    }

    // Click-through insights
    if (emailStats.clickRate > 0 && emailStats.clickRate < 3) {
      insights.push({
        type: 'tip',
        category: 'engagement',
        message: `Click rate could be improved (${emailStats.clickRate}%). Consider stronger calls-to-action.`,
        actionable: true,
        suggestion: 'Make your CTAs more prominent and compelling.',
      });
    }

    return insights;
  }
}
