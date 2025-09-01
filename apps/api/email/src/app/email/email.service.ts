import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {v4 as uuid} from "uuid";
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { getPasswordResetEmailTemplate, getVerificationEmailTemplate, getWelcomeEmailTemplate } from "./templates/auth";
import { getPaymentRequestEmailTemplate } from "./templates/payment";
import { getLeadFollowupEmailTemplate, getClientResponseEmailTemplate, getEmailSequenceCompleteTemplate } from "./templates/lead";
import {
  EMAIL_ROUTING_KEYS,
  EmailAnalytics,
  EmailBouncedEvent,
  EmailEvent,
  EmailOpenedEvent,
  SendEmailRequest
} from "@nlc-ai/api-types";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly mailgun: any;
  private readonly domain: string;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('email.mailgun.apiKey');
    this.domain = this.configService.get<string>('email.mailgun.domain', '');
    this.fromEmail = this.configService.get<string>('email.mailgun.fromEmail', '');

    if (apiKey && this.domain) {
      const mailgun = new Mailgun(FormData);
      this.mailgun = mailgun.client({
        username: 'api',
        key: apiKey,
        url: this.configService.get<string>('email.mailgun.url', 'https://api.mailgun.net'),
      });
    } else {
      this.logger.warn('Mailgun not configured - emails will be logged only');
    }
  }

  async sendEmail(request: SendEmailRequest): Promise<{ messageID: string; status: number; message: string }> {
    const { to, subject, html, text, from, templateID, /*metadata, */replyTo, cc, bcc } = request;

    // Store email record
    /*const emailRecord = await this.prisma.emailMessage.create({
      // @ts-ignore
      data: {
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        from: from || this.fromEmail,
        emailTemplateID: templateID,
        metadata: metadata || {},
        status: 'pending',
      },
    });*/

    const messageID = uuid();

    if (!this.mailgun) {
      this.logger.log(`📧 Email would be sent to ${to}`);
      this.logger.log(`Subject: ${subject}`);

      /*await this.prisma.emailMessage.update({
        where: { id: emailRecord.id },
        data: { status: 'simulated' },
      });*/

      return {
        messageID/*: emailRecord.id*/,
        status: 200,
        message: 'Email simulated (development mode)',
      };
    }

    try {
      const mailgunMessage: any = {
        from: from || `Next Level Coach AI <${this.fromEmail}>`,
        to: [to],
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html,
      };

      // Add optional fields
      if (replyTo) mailgunMessage['h:Reply-To'] = replyTo;
      if (cc && cc.length > 0) mailgunMessage.cc = cc;
      if (bcc && bcc.length > 0) mailgunMessage.bcc = bcc;

      // Add tracking
      mailgunMessage['o:tracking'] = true;
      mailgunMessage['o:tracking-clicks'] = true;
      mailgunMessage['o:tracking-opens'] = true;

      // Add custom variables for tracking
      if (/*emailRecord.id*/messageID) {
        mailgunMessage['v:email-record-id'] = /*emailRecord.id*/messageID;
      }

      const result = await this.mailgun.messages.create(this.domain, mailgunMessage);
      const sentAt = new Date();

      /*await this.prisma.emailMessage.update({
        where: { id: /!*emailRecord.id*!/messageID },
        data: {
          status: 'sent',
          sentAt,
          providerMessageID: result.id,
        },
      });*/

      // Emit email sent event
      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: EMAIL_ROUTING_KEYS.SENT,
          schemaVersion: 1,
          payload: {
            emailID: /*emailRecord.id*/messageID,
            to,
            subject,
            templateID,
            providerMessageID: result.id,
            sentAt: sentAt.toISOString(),
          },
        },
        EMAIL_ROUTING_KEYS.SENT
      );

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${result.id}`);

      return {
        messageID: result.id,
        status: 200,
        message: 'Email sent successfully',
      };
    } catch (error) {
      await this.prisma.emailMessage.update({
        where: { id: /*emailRecord.id*/messageID },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      // Emit email failed event
      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: EMAIL_ROUTING_KEYS.FAILED,
          schemaVersion: 1,
          payload: {
            emailID: /*emailRecord.id*/messageID,
            to,
            subject,
            error: error instanceof Error ? error.message : String(error),
            failedAt: new Date().toISOString(),
          },
        },
        EMAIL_ROUTING_KEYS.FAILED
      );

      this.logger.error(`Failed to send email to ${to}:`, error);

      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`📧 Development fallback - Email to ${to}:`);
        this.logger.log(`Subject: ${subject}`);
      }

      return {
        messageID: /*emailRecord.id*/messageID,
        status: 500,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const subject = 'Verify Your Next Level Coach AI Account';
    const html = getVerificationEmailTemplate(code);
    const text = `Your verification code is: ${code}. This code expires in 10 minutes.`;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
      templateID: 'verification'
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const subject = 'Reset Your Next Level Coach AI Password';
    const html = getPasswordResetEmailTemplate(code);
    const text = `Your password reset code is: ${code}. This code expires in 10 minutes.`;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
      templateID: 'password-reset'
    });
  }

  async sendWelcomeEmail(email: string, name: string, frontendURL: string): Promise<void> {
    const subject = 'Welcome to Next Level Coach AI!';
    const html = getWelcomeEmailTemplate(name, frontendURL);
    const text = `Welcome to Next Level Coach AI, ${name}! Your account has been successfully created.`;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
      templateID: 'welcome'
    });
  }

  async sendPaymentRequestEmail(data: {
    to: string;
    coachName: string;
    planName: string;
    planDescription?: string;
    amount: number;
    paymentLink: string;
    description?: string;
  }): Promise<void> {
    const subject = `Payment Request - ${data.planName} Plan Subscription`;
    const html = getPaymentRequestEmailTemplate(data);
    const text = `
    Hello ${data.coachName},

    You have received a payment request for the ${data.planName} plan subscription.

    Amount: $${data.amount}
    Plan: ${data.planName}
    ${data.description ? `Description: ${data.description}` : ''}

    To complete your payment, please click the link below:
    ${data.paymentLink}

    This secure payment link will take you to Stripe's payment page where you can safely enter your payment details.

    If you have any questions, please contact our support team.

    Best regards,
    The Next Level Coach AI Team
  `;

    await this.sendEmail({
      to: data.to,
      subject,
      html,
      text,
      templateID: 'payment-request'
    });
  }

  async sendLeadFollowupEmail(
    to: string,
    subject: string,
    content: string,
    coachName: string,
    leadName?: string,
    coachBusinessName?: string,
    emailNumber?: number,
    totalEmails?: number,
    unsubscribeLink?: string
  ): Promise<{ messageID: string; status: number; message: string }> {
    const html = getLeadFollowupEmailTemplate({
      leadName: leadName || 'there',
      coachName,
      coachBusinessName,
      emailContent: content,
      emailNumber,
      totalEmails,
      unsubscribeLink,
    });

    const text = content.replace(/<[^>]*>/g, '');

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      templateID: 'lead-followup',
      metadata: {
        leadName,
        coachName,
        emailNumber,
        totalEmails,
      }
    });
  }

  async sendClientResponseEmail(
    to: string,
    subject: string,
    content: string,
    coachName: string,
    clientName: string,
    coachBusinessName?: string,
    originalSubject?: string,
    isReply: boolean = false
  ): Promise<{ messageID: string; status: number; message: string }> {
    const html = getClientResponseEmailTemplate({
      clientName,
      coachName,
      coachBusinessName,
      emailContent: content,
      originalSubject,
      isReply,
    });

    const text = content.replace(/<[^>]*>/g, '');

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      templateID: 'client-response',
      metadata: {
        clientName,
        coachName,
        isReply,
        originalSubject,
      }
    });
  }

  async sendSequenceCompleteEmail(
    to: string,
    leadName: string,
    coachName: string,
    coachBusinessName?: string,
    totalEmailsSent: number = 0,
    ctaText?: string,
    ctaLink?: string
  ): Promise<{ messageID: string; status: number; message: string }> {
    const subject = `Thank you for your time, ${leadName}`;
    const html = getEmailSequenceCompleteTemplate({
      leadName,
      coachName,
      coachBusinessName,
      totalEmailsSent,
      ctaText,
      ctaLink,
    });

    const text = `
Hi ${leadName},

Thank you for your time over the past few weeks. I've shared ${totalEmailsSent} messages with valuable insights and strategies to help you on your journey.

I hope you've found them helpful and actionable.

While this email sequence has come to an end, my door is always open if you'd like to take the next step in your development.

${ctaText && ctaLink ? `${ctaText}: ${ctaLink}` : ''}

Thank you for allowing me to be part of your journey.

Best regards,
${coachName}
${coachBusinessName || ''}
    `.trim();

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      templateID: 'sequence-complete',
      metadata: {
        leadName,
        coachName,
        totalEmailsSent,
      }
    });
  }

  // Email Analytics and Tracking
  async trackEmailOpen(messageID: string, analytics: Partial<EmailAnalytics>): Promise<void> {
    try {
      const message = await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              opened: true,
              openedAt: new Date(),
              ...analytics,
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailOpenedEvent>(
        {
          eventType: EMAIL_ROUTING_KEYS.OPENED,
          schemaVersion: 1,
          payload: {
            messageID,
            recipientEmail: message.to,
            // @ts-ignore
            openedAt: new Date().toISOString(),
            ...analytics,
          },
        },
        EMAIL_ROUTING_KEYS.OPENED
      );
    } catch (error) {
      this.logger.error(`Failed to track email open for ${messageID}:`, error);
    }
  }

  async trackEmailClick(messageID: string, clickedUrl: string, analytics: Partial<EmailAnalytics>): Promise<void> {
    try {
      await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              clicked: true,
              clickedAt: new Date(),
              clickedUrl,
              ...analytics,
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.clicked',
          schemaVersion: 1,
          payload: {
            messageID,
            clickedUrl,
            // @ts-ignore
            clickedAt: new Date().toISOString(),
            ...analytics,
          },
        },
        'email.clicked'
      );
    } catch (error) {
      this.logger.error(`Failed to track email click for ${messageID}:`, error);
    }
  }

  async trackEmailBounce(messageID: string, reason: string): Promise<void> {
    try {
      const message = await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          status: 'bounced',
          metadata: {
            analytics: {
              bounced: true,
              bounceReason: reason,
              bouncedAt: new Date(),
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailBouncedEvent>(
        {
          eventType: 'email.bounced',
          schemaVersion: 1,
          payload: {
            messageID,
            reason,
            recipientEmail: message.to,
            bounceType: 'soft',
            bouncedAt: new Date().toISOString(),
          },
        },
        'email.bounced'
      );
    } catch (error) {
      this.logger.error(`Failed to track email bounce for ${messageID}:`, error);
    }
  }

  async trackEmailComplaint(messageID: string): Promise<void> {
    try {
      const message = await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              complained: true,
              complainedAt: new Date(),
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.complained',
          schemaVersion: 1,
          payload: {
            messageID,
            recipientEmail: message.to,
            complainedAt: new Date().toISOString(),
          },
        },
        'email.complained'
      );
    } catch (error) {
      this.logger.error(`Failed to track email complaint for ${messageID}:`, error);
    }
  }

  async trackEmailUnsubscribe(messageID: string, recipientEmail: string): Promise<void> {
    try {
      await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              unsubscribed: true,
              unsubscribedAt: new Date(),
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.unsubscribed',
          schemaVersion: 1,
          payload: {
            messageID,
            recipientEmail,
            unsubscribedAt: new Date().toISOString(),
          },
        },
        'email.unsubscribed'
      );
    } catch (error) {
      this.logger.error(`Failed to track email unsubscribe for ${messageID}:`, error);
    }
  }

  // Email Templates Management
  async createEmailTemplate(
    coachID: string,
    name: string,
    category: string,
    subject: string,
    body: string,
    isAiGenerated: boolean = false,
    generationPrompt?: string
  ): Promise<any> {
    return this.prisma.emailTemplate.create({
      data: {
        coachID,
        name,
        category,
        subjectTemplate: subject,
        bodyTemplate: body,
        isAiGenerated,
        generationPrompt,
        isActive: true,
      },
    });
  }

  async getEmailTemplates(coachID: string, category?: string): Promise<any[]> {
    return this.prisma.emailTemplate.findMany({
      where: {
        coachID,
        isActive: true,
        ...(category && { category }),
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async updateEmailTemplate(
    templateID: string,
    updates: {
      name?: string;
      category?: string;
      subjectTemplate?: string;
      bodyTemplate?: string;
      isActive?: boolean;
    }
  ): Promise<any> {
    return this.prisma.emailTemplate.update({
      where: { id: templateID },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  }

  async incrementTemplateUsage(templateID: string): Promise<void> {
    await this.prisma.emailTemplate.update({
      where: { id: templateID },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  // Email Statistics and Analytics
  async getEmailStats(
    coachID?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalComplaints: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    complaintRate: number;
  }> {
    const whereClause: any = {};

    if (coachID) {
      // For coach-specific stats, we need to join through scheduled emails or similar
      // This is a simplified version - you might need to adjust based on your data model
      whereClause.coachID = coachID;
    }

    if (dateRange) {
      whereClause.sentAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const [totalSent, analytics] = await Promise.all([
      this.prisma.emailMessage.count({
        where: {
          ...whereClause,
          status: 'sent',
        },
      }),
      this.prisma.emailMessage.findMany({
        where: {
          ...whereClause,
          status: 'sent',
        },
        select: {
          metadata: true,
        },
      }),
    ]);

    let totalOpened = 0;
    let totalClicked = 0;
    let totalBounced = 0;
    let totalComplaints = 0;

    analytics.forEach((email) => {
      const analyticsData = email.metadata as any;
      if (analyticsData?.analytics) {
        if (analyticsData.analytics.opened) totalOpened++;
        if (analyticsData.analytics.clicked) totalClicked++;
        if (analyticsData.analytics.bounced) totalBounced++;
        if (analyticsData.analytics.complained) totalComplaints++;
      }
    });

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    const complaintRate = totalSent > 0 ? (totalComplaints / totalSent) * 100 : 0;

    return {
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
      totalComplaints,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      complaintRate: Math.round(complaintRate * 100) / 100,
    };
  }

  // Email Health Check
  async checkEmailHealth(): Promise<{
    mailgunConfigured: boolean;
    domainVerified: boolean;
    recentSendRate: number;
    recentFailureRate: number;
    lastSuccessfulSend?: Date;
  }> {
    const mailgunConfigured = !!this.mailgun;
    let domainVerified = false;
    let recentSendRate = 0;
    let recentFailureRate = 0;
    let lastSuccessfulSend: Date | undefined;

    // Check domain verification with Mailgun
    if (this.mailgun) {
      try {
        const domainInfo = await this.mailgun.domains.get(this.domain);
        domainVerified = domainInfo.state === 'active';
      } catch (error) {
        this.logger.warn('Could not verify domain status:', error);
      }
    }

    // Calculate recent send and failure rates (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [recentEmails, recentFailures, lastSuccess] = await Promise.all([
      this.prisma.emailMessage.count({
        where: {
          createdAt: { gte: yesterday },
        },
      }),
      this.prisma.emailMessage.count({
        where: {
          createdAt: { gte: yesterday },
          status: 'failed',
        },
      }),
      this.prisma.emailMessage.findFirst({
        where: {
          status: 'sent',
        },
        orderBy: {
          sentAt: 'desc',
        },
        select: {
          sentAt: true,
        },
      }),
    ]);

    recentSendRate = recentEmails;
    recentFailureRate = recentEmails > 0 ? (recentFailures / recentEmails) * 100 : 0;
    lastSuccessfulSend = lastSuccess?.sentAt || undefined;

    return {
      mailgunConfigured,
      domainVerified,
      recentSendRate,
      recentFailureRate: Math.round(recentFailureRate * 100) / 100,
      lastSuccessfulSend,
    };
  }

  // Bulk Email Operations
  async sendBulkEmails(
    emails: Array<{
      to: string;
      subject: string;
      html: string;
      text?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<{
    successful: number;
    failed: number;
    results: Array<{ email: string; success: boolean; messageID?: string; error?: string }>;
  }> {
    const results: Array<{ email: string; success: boolean; messageID?: string; error?: string }> = [];
    let successful = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the email service
    const batchSize = this.configService.get<number>('email.performance.batchSize', 50);

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const batchPromises = batch.map(async (email) => {
        try {
          const result = await this.sendEmail(email);
          results.push({
            email: email.to,
            success: result.status === 200,
            messageID: result.messageID,
          });
          if (result.status === 200) successful++;
          else failed++;
        } catch (error) {
          results.push({
            email: email.to,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      });

      await Promise.all(batchPromises);

      // Small delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { successful, failed, results };
  }

  // Email Cleanup and Maintenance
  async cleanupOldEmails(retentionDays?: number): Promise<{ deletedCount: number }> {
    const days = retentionDays || this.configService.get<number>('email.performance.retentionDays', 90);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.emailMessage.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
        status: { in: ['sent', 'bounced', 'failed'] },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old email records`);
    return { deletedCount: result.count };
  }

  // Email Queue Management
  async getEmailQueueStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
    sent: number;
  }> {
    const [pending, processing, failed, sent] = await Promise.all([
      this.prisma.emailMessage.count({ where: { status: 'pending' } }),
      this.prisma.emailMessage.count({ where: { status: 'processing' } }),
      this.prisma.emailMessage.count({ where: { status: 'failed' } }),
      this.prisma.emailMessage.count({ where: { status: 'sent' } }),
    ]);

    return { pending, processing, failed, sent };
  }

  async retryFailedEmails(limit: number = 10): Promise<{ retriedCount: number }> {
    const failedEmails = await this.prisma.emailMessage.findMany({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Only retry emails from last 24 hours
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    let retriedCount = 0;

    for (const email of failedEmails) {
      try {
        await this.sendEmail({
          to: email.to,
          subject: email.subject || '',
          html: email.html || '',
          text: email.text || undefined,
          from: email.from || undefined,
          templateID: email.emailTemplateID || undefined,
          metadata: email.metadata as Record<string, any> || {},
        });
        retriedCount++;
      } catch (error) {
        this.logger.error(`Failed to retry email ${email.id}:`, error);
      }
    }

    return { retriedCount };
  }
}
