import {Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException} from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {
  AuthUser,
  CreateEmailSequenceRequest,
  EmailSequenceStatus,
  UpdateEmailSequenceRequest,
  EmailStatus,
  UserType, SequenceStep, EmailParticipantType,
} from "@nlc-ai/types";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class SequencesService {
  private readonly logger = new Logger(SequencesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createSequence(user: AuthUser, sequenceData: CreateEmailSequenceRequest) {
    this.validateSequenceSteps(sequenceData.steps);

    const sequence = await this.prisma.emailSequence.create({
      data: {
        name: sequenceData.name,
        description: sequenceData.description,
        triggerType: sequenceData.triggerType,
        userID: user.id,
        userType: user.type,
        sequence: sequenceData.steps ? JSON.stringify(sequenceData.steps) : [],
        status: EmailSequenceStatus.ACTIVE,
        isActive: true,
      },
    });

    this.logger.log(`Sequence created: ${sequence.id} by user ${user.id}`);

    return { sequence };
  }

  async getSequences(userID: string, filters?: {
    status?: EmailSequenceStatus;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = { userID };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (typeof filters?.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const sequences = await this.prisma.emailSequence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        emailMessages: true,
      },
    });

    return { sequences };
  }

  async getSequence(userID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: {
        id: sequenceID,
        userID
      },
      include: {
        emailMessages: {
          orderBy: { scheduledFor: 'asc' },
          take: 10,
        },
        _count: {
          select: {
            emailMessages: true,
          },
        },
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    return { sequence };
  }

  async updateSequence(
    userID: string,
    sequenceID: string,
    updateData: UpdateEmailSequenceRequest
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, userID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    if (updateData.steps) {
      this.validateSequenceSteps(updateData.steps);
    }

    const updatedSequence = await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: {
        ...updateData,
        sequence: updateData.steps ? JSON.stringify(updateData.steps) : sequence.sequence as any,
      },
    });

    this.logger.log(`Sequence updated: ${sequenceID}`);

    return { sequence: updatedSequence };
  }

  async deleteSequence(userID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, userID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: {
          in: [EmailStatus.PENDING, EmailStatus.SCHEDULED],
        },
      },
      data: {
        status: EmailStatus.CANCELLED,
      },
    });

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: {
        isActive: false,
        status: EmailSequenceStatus.CANCELLED,
      },
    });

    this.logger.log(`Sequence deleted: ${sequenceID}`);

    return { message: 'Sequence deleted successfully' };
  }

  async executeSequence(
    userID: string,
    sequenceID: string,
    targetID: string,
    targetType: EmailParticipantType,
    options?: {
      templateVariables?: Record<string, any>;
      startDate?: Date;
    }
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: {
        id: sequenceID,
        userID,
        isActive: true,
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found or inactive');
    }

    const targetEmail = await this.getEmailForTarget(targetID, targetType);
    if (!targetEmail) {
      throw new BadRequestException(`Target ${targetType} not found`);
    }

    const senderEmail = await this.getSenderEmail(userID, sequence.userType);

    const steps = sequence.sequence as unknown as SequenceStep[];
    const startDate = options?.startDate || new Date();
    const createdMessages: string[] = [];

    for (const step of steps.sort((a, b) => a.order - b.order)) {
      if (step.conditions && step.conditions.length > 0) {
        const conditionsMet = await this.evaluateConditions(
          step.conditions,
          targetID,
          targetType
        );

        if (!conditionsMet) {
          this.logger.log(`Skipping step ${step.order} - conditions not met`);
          continue;
        }
      }

      const scheduledFor = new Date(startDate);
      scheduledFor.setDate(scheduledFor.getDate() + step.delayDays);

      const message = await this.prisma.emailMessage.create({
        data: {
          userID: sequence.userID,
          userType: sequence.userType,
          emailSequenceID: sequenceID,
          emailTemplateID: step.templateID,
          from: senderEmail,
          to: targetEmail,
          subject: step.subject,
          status: EmailStatus.SCHEDULED,
          scheduledFor,
          metadata: {
            sequenceStep: step.order,
            sequenceName: sequence.name,
            templateVariables: options?.templateVariables || {},
          },
        },
      });

      createdMessages.push(message.id);

      this.logger.log(
        `Scheduled sequence step ${step.order} for ${targetEmail} at ${scheduledFor}`
      );
    }

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: {
        status: EmailSequenceStatus.ACTIVE,
      },
    });

    return {
      success: true,
      sequenceID,
      messagesCreated: createdMessages.length,
      messageIDs: createdMessages,
      targetEmail,
      startDate,
    };
  }

  async pauseSequenceForTarget(
    userID: string,
    sequenceID: string,
    targetID: string,
    targetType: UserType
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, userID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    const result = await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: {
          in: [EmailStatus.PENDING, EmailStatus.SCHEDULED],
        },
      },
      data: {
        status: EmailStatus.PAUSED,
      },
    });

    this.logger.log(
      `Paused ${result.count} emails for target ${targetID} in sequence ${sequenceID}`
    );

    return {
      success: true,
      pausedCount: result.count,
    };
  }

  async getEmailByID(userID: string, emailID: string) {
    const email = await this.prisma.emailMessage.findFirst({
      where: {
        id: emailID,
      },
      include: {
        emailSequence: {
          select: {
            id: true,
            name: true,
            userID: true,
          }
        },
      }
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    // Verify ownership through sequence
    if (email.emailSequence?.userID !== userID) {
      throw new ForbiddenException('You do not have permission to access this email');
    }

    // Parse metadata to get additional info
    const metadata = email.metadata as any || {};

    return {
      email: {
        ...email,
        sequenceOrder: metadata.sequenceStep || 1,
        timing: metadata.timing || '1-week',
        keyPoints: metadata.keyPoints || [],
        callToAction: metadata.callToAction || '',
        isEdited: metadata.isEdited || false,
      }
    };
  }

  async updateEmail(userID: string, emailID: string, updateData: {
    subject?: string;
    body?: string;
    scheduledFor?: string;
    timing?: string;
  }) {
    // First verify the email exists and user has permission
    const email = await this.prisma.emailMessage.findFirst({
      where: {
        id: emailID,
      },
      include: {
        emailSequence: {
          select: {
            id: true,
            userID: true,
          }
        }
      }
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (email.emailSequence?.userID !== userID) {
      throw new ForbiddenException('You do not have permission to update this email');
    }

    // Only allow updates to scheduled or pending emails
    if (email.status !== EmailStatus.SCHEDULED && email.status !== EmailStatus.PENDING) {
      throw new BadRequestException(`Cannot update email with status: ${email.status}`);
    }

    // Prepare update data
    const updatePayload: any = {};

    if (updateData.subject !== undefined) {
      updatePayload.subject = updateData.subject;
    }

    if (updateData.body !== undefined) {
      updatePayload.body = updateData.body;
    }

    if (updateData.scheduledFor !== undefined) {
      updatePayload.scheduledFor = new Date(updateData.scheduledFor);
    }

    // Update metadata if timing changes
    if (updateData.timing !== undefined) {
      const currentMetadata = (email.metadata as any) || {};
      updatePayload.metadata = {
        ...currentMetadata,
        timing: updateData.timing,
      };
    }

    // Mark as edited
    const currentMetadata = (email.metadata as any) || {};
    updatePayload.metadata = {
      ...currentMetadata,
      ...(updatePayload.metadata || {}),
      isEdited: true,
      lastEditedAt: new Date().toISOString(),
    };

    // Perform update
    const updatedEmail = await this.prisma.emailMessage.update({
      where: { id: emailID },
      data: updatePayload,
    });

    this.logger.log(`Email updated: ${emailID} by user ${userID}`);

    return {
      success: true,
      message: 'Email updated successfully',
      email: updatedEmail
    };
  }

  async resumeSequenceForTarget(
    userID: string,
    sequenceID: string,
    targetID: string,
    targetType: UserType
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, userID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    const result = await this.prisma.emailMessage.updateMany({
      where: {
        emailSequenceID: sequenceID,
        status: EmailStatus.PAUSED,
      },
      data: {
        status: EmailStatus.SCHEDULED,
      },
    });

    this.logger.log(
      `Resumed ${result.count} emails for target ${targetID} in sequence ${sequenceID}`
    );

    return {
      success: true,
      resumedCount: result.count,
    };
  }

  async getSequenceAnalytics(userID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, userID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    const messages = await this.prisma.emailMessage.findMany({
      where: { emailSequenceID: sequenceID },
      select: {
        status: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        clickedAt: true,
      },
    });

    const analytics = {
      totalEmails: messages.length,
      sent: messages.filter(m => m.status === EmailStatus.SENT).length,
      delivered: messages.filter(m => m.deliveredAt).length,
      opened: messages.filter(m => m.openedAt).length,
      clicked: messages.filter(m => m.clickedAt).length,
      failed: messages.filter(m => m.status === EmailStatus.FAILED).length,
      pending: messages.filter(m =>
        m.status === EmailStatus.PENDING || m.status === EmailStatus.SCHEDULED
      ).length,
      openRate: 0,
      clickRate: 0,
    };

    if (analytics.delivered > 0) {
      analytics.openRate = (analytics.opened / analytics.delivered) * 100;
      analytics.clickRate = (analytics.clicked / analytics.delivered) * 100;
    }

    return { analytics };
  }


  private validateSequenceSteps(steps: any[]) {
    if (!steps || steps.length === 0) {
      throw new BadRequestException('Sequence must have at least one step');
    }

    const orders = steps.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new BadRequestException('Sequence steps must have unique order numbers');
    }

    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i + 1) {
        throw new BadRequestException('Sequence steps must be ordered sequentially starting from 1');
      }
    }
  }

  private async getEmailForTarget(
    targetID: string,
    targetType: EmailParticipantType
  ): Promise<string | null> {
    try {
      switch (targetType) {
        case EmailParticipantType.COACH:
          const coach = await this.prisma.coach.findUnique({
            where: { id: targetID },
            select: { email: true },
          });
          return coach?.email || null;

        case EmailParticipantType.CLIENT:
          const client = await this.prisma.client.findUnique({
            where: { id: targetID },
            select: { email: true },
          });
          return client?.email || null;

        case EmailParticipantType.LEAD:
          const lead = await this.prisma.lead.findUnique({
            where: { id: targetID },
            select: { email: true },
          });
          return lead?.email || null;

        default:
          throw new Error(`Unknown target type: ${targetType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get email for target ${targetID}:`, error);
      return null;
    }
  }

  private async getSenderEmail(userID: string, userType: UserType): Promise<string> {
    if (userType === UserType.COACH) {
      const emailAccount = await this.prisma.emailAccount.findFirst({
        where: {
          userID,
          userType,
          isPrimary: true,
          isActive: true,
        },
        select: { emailAddress: true },
      });

      if (emailAccount) {
        return emailAccount.emailAddress;
      }
    }

    return this.config.get('email.mailgun.from')!;
  }

  private async evaluateConditions(
    conditions: any[],
    targetID: string,
    targetType: EmailParticipantType
  ): Promise<boolean> {
    // This is a placeholder for condition evaluation logic
    // You would implement actual condition checking based on your requirements
    // For example: checking if a lead has a certain status, if they've opened previous emails, etc.

    this.logger.log(`Evaluating ${conditions.length} conditions for target ${targetID} (${targetType})`);

    // For now, return true (all conditions met)
    // TODO: Implement actual condition evaluation
    return true;
  }
}
