import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { EmailIntegrationService } from '../email/email-integration.service';

@Injectable()
export class ClientEmailSendService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailIntegrationService: EmailIntegrationService,
  ) {}

  async sendResponse(
    coachID: string,
    responseID: string,
    modifications?: { subject?: string; body?: string }
  ) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, coachID },
      include: {
        thread: {
          include: { client: true }
        }
      }
    });

    if (!response) {
      throw new NotFoundException('Generated response not found');
    }

    if (response.status === 'sent') {
      throw new BadRequestException('Response has already been sent');
    }

    const finalSubject = modifications?.subject || response.subject;
    const finalBody = modifications?.body || response.body;

    try {
      const result = await this.emailIntegrationService.sendClientResponseWithTemplate({
        clientID: response.clientID,
        coachID,
        subject: finalSubject,
        content: finalBody,
        isReply: true,
        threadID: response.thread.threadID,
      });

      if (result.messageID) {
        await this.prisma.generatedEmailResponse.update({
          where: { id: responseID },
          data: {
            status: 'sent',
            sentAt: new Date(),
            actualSubject: finalSubject,
            actualBody: finalBody,
          }
        });

        await this.prisma.emailThread.update({
          where: { id: response.threadID },
          data: {
            lastMessageAt: new Date(),
            messageCount: { increment: 1 },
          }
        });

        await this.prisma.client.update({
          where: { id: response.clientID },
          data: {
            lastInteractionAt: new Date(),
            totalInteractions: { increment: 1 },
          }
        });

        return {
          success: true,
          message: `Email sent to ${response.thread.client?.email}`,
          messageID: result.messageID,
          sentAt: new Date(),
        };
      } else {
        throw new Error('Failed to send email - no message ID returned');
      }

    } catch (error: any) {
      await this.prisma.generatedEmailResponse.update({
        where: { id: responseID },
        data: {
          status: 'failed',
          metadata: JSON.stringify({
            ...JSON.parse(response.metadata as any || '{}'),
            sendError: error.message,
            failedAt: new Date(),
          }),
        }
      });

      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async scheduleResponse(
    coachID: string,
    responseID: string,
    scheduledFor: Date,
    modifications?: { subject?: string; body?: string }
  ) {
    const response = await this.prisma.generatedEmailResponse.findFirst({
      where: { id: responseID, coachID },
      include: {
        thread: { include: { client: true } }
      }
    });

    if (!response) {
      throw new NotFoundException('Generated response not found');
    }

    if (scheduledFor <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    const finalSubject = modifications?.subject || response.subject;
    const finalBody = modifications?.body || response.body;

    try {
      const result = await this.emailIntegrationService.sendClientResponseWithTemplate({
        clientID: response.clientID,
        coachID,
        subject: finalSubject,
        content: finalBody,
        scheduledFor,
        isReply: true,
        threadID: response.thread.threadID,
      });

      await this.prisma.generatedEmailResponse.update({
        where: { id: responseID },
        data: {
          status: 'scheduled',
          scheduledFor,
          actualSubject: finalSubject,
          actualBody: finalBody,
        }
      });

      return {
        success: true,
        message: `Email scheduled for ${scheduledFor.toLocaleString()}`,
        scheduledEmailID: result.scheduledEmailID,
        scheduledFor,
      };

    } catch (error: any) {
      throw new BadRequestException(`Failed to schedule email: ${error.message}`);
    }
  }

  async sendCustomEmail(coachID: string, emailData: {
    clientID: string;
    threadID?: string;
    subject: string;
    body: string;
    scheduledFor?: string;
  }) {
    const client = await this.prisma.client.findFirst({
      where: { id: emailData.clientID, clientCoaches: { some: { coachID } } }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const scheduledFor = emailData.scheduledFor ? new Date(emailData.scheduledFor) : undefined;

    try {
      const result = await this.emailIntegrationService.sendClientResponseWithTemplate({
        clientID: emailData.clientID,
        coachID,
        subject: emailData.subject,
        content: emailData.body,
        scheduledFor,
        threadID: emailData.threadID,
      });

      if (emailData.threadID) {
        await this.prisma.emailThread.update({
          where: { id: emailData.threadID },
          data: {
            lastMessageAt: new Date(),
            messageCount: { increment: 1 },
          }
        });
      }

      await this.prisma.client.update({
        where: { id: emailData.clientID },
        data: {
          lastInteractionAt: new Date(),
          totalInteractions: { increment: 1 },
        }
      });

      return {
        success: true,
        message: scheduledFor
          ? `Email scheduled for ${scheduledFor.toLocaleString()}`
          : `Email sent to ${client.email}`,
        messageID: result.messageID,
        scheduledEmailID: result.scheduledEmailID,
      };

    } catch (error: any) {
      throw new BadRequestException(`Failed to send custom email: ${error.message}`);
    }
  }

  async cancelScheduledEmail(coachID: string, scheduledEmailID: string) {
    const scheduledEmail = await this.prisma.scheduledEmail.findFirst({
      where: {
        id: scheduledEmailID,
        coachID,
        status: 'scheduled',
      }
    });

    if (!scheduledEmail) {
      throw new NotFoundException('Scheduled email not found or already processed');
    }

    await this.prisma.scheduledEmail.update({
      where: { id: scheduledEmailID },
      data: { status: 'cancelled' }
    });

    const generatedResponse = await this.prisma.generatedEmailResponse.findFirst({
      where: {
        coachID,
        status: 'scheduled',
        scheduledFor: scheduledEmail.scheduledFor,
      }
    });

    if (generatedResponse) {
      await this.prisma.generatedEmailResponse.update({
        where: { id: generatedResponse.id },
        data: { status: 'cancelled' }
      });
    }

    return {
      success: true,
      message: 'Scheduled email cancelled successfully',
    };
  }
}
