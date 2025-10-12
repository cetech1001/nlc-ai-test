import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import {UserType, type AuthUser} from '@nlc-ai/types';
import { PrismaService } from '@nlc-ai/api-database';
import { SendEmailDto } from './dto';
import { SendService } from './send.service';

@ApiTags('Email')
@Controller('send')
@UseGuards(UserTypesGuard)
@ApiBearerAuth()
export class SendController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryService: SendService,
  ) {}

  @Post()
  @UserTypes(UserType.COACH, UserType.ADMIN)
  @ApiOperation({ summary: 'Send a custom email' })
  @ApiResponse({ status: 200, description: 'Email queued successfully' })
  async sendEmail(
    @Body() dto: SendEmailDto,
    @CurrentUser() user: AuthUser,
  ) {
    const message = await this.prisma.emailMessage.create({
      data: {
        userID: user.id,
        userType: user.type,
        from: user.email,
        to: Array.isArray(dto.to) ? dto.to.join(',') : dto.to,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
        status: 'pending',
        sentAt: new Date(),
        metadata: dto.metadata || {},
      },
    });

    if (user.type === UserType.COACH) {
      await this.deliveryService.sendCoachEmail(message.id);
    } else if (user.type === UserType.ADMIN) {
      await this.deliveryService.sendAdminEmail(message.id);
    }

    return {
      success: true,
      messageID: message.id,
      message: 'Email queued for delivery',
    };
  }

  @Post('coach-to-client')
  @UserTypes(UserType.COACH)
  @ApiOperation({ summary: 'Coach sends email to specific client' })
  @ApiResponse({ status: 200, description: 'Email queued successfully' })
  async sendToClient(
    @Body() dto: SendEmailDto & { clientID: string },
    @CurrentUser() user: AuthUser,
  ) {
    const clientCoach = await this.prisma.clientCoach.findFirst({
      where: {
        coachID: user.id,
        clientID: dto.clientID,
        status: 'active',
      },
    });

    if (!clientCoach) {
      throw new BadRequestException('Client not found or not associated with your account');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientID },
      select: { email: true },
    });

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: user.id,
        userType: user.type,
        from: user.email,
        to: client.email,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
        status: 'pending',
        sentAt: new Date(),
        metadata: dto.metadata || {},
      },
    });

    await this.deliveryService.sendCoachEmail(message.id);

    return {
      success: true,
      messageID: message.id,
      message: 'Email queued for delivery',
    };
  }

  @Post('admin-broadcast')
  @UserTypes(UserType.ADMIN)
  @ApiOperation({ summary: 'Admin sends broadcast email to multiple users' })
  @ApiResponse({ status: 200, description: 'Emails queued successfully' })
  async sendBroadcast(
    @Body() dto: SendEmailDto & {
      recipientType: 'all-coaches' | 'all-clients' | 'all-leads' | 'custom';
      recipientIDs?: string[];
    },
    @CurrentUser() user: AuthUser,
  ) {
    let recipients: { id: string; email: string }[] = [];

    if (dto.recipientType === 'all-coaches') {
      recipients = await this.prisma.coach.findMany({
        where: { isActive: true },
        select: { id: true, email: true },
      });
    } else if (dto.recipientType === 'all-clients') {
      recipients = await this.prisma.client.findMany({
        where: { isActive: true },
        select: { id: true, email: true },
      });
    } else if (dto.recipientType === 'all-leads') {
      recipients = await this.prisma.lead.findMany({
        where: { marketingOptIn: true },
        select: { id: true, email: true },
      });
    } else if (dto.recipientType === 'custom' && dto.recipientIDs?.length) {
      const coaches = await this.prisma.coach.findMany({
        where: { id: { in: dto.recipientIDs } },
        select: { id: true, email: true },
      });
      const clients = await this.prisma.client.findMany({
        where: { id: { in: dto.recipientIDs } },
        select: { id: true, email: true },
      });
      const leads = await this.prisma.lead.findMany({
        where: { id: { in: dto.recipientIDs }, marketingOptIn: true },
        select: { id: true, email: true },
      });
      recipients = [...coaches, ...clients, ...leads];
    }

    if (recipients.length === 0) {
      throw new BadRequestException('No recipients found');
    }

    const messagePromises = recipients.map(recipient =>
      this.prisma.emailMessage.create({
        data: {
          userID: user.id,
          userType: user.type,
          from: user.email,
          to: recipient.email,
          subject: dto.subject,
          text: dto.text,
          html: dto.html,
          status: 'pending',
          sentAt: new Date(),
          emailTemplateID: dto.templateID,
          metadata: {
            ...dto.metadata,
            sentByAdmin: user.id,
            broadcast: true,
            recipientType: dto.recipientType,
          },
        },
      })
    );

    const messages = await Promise.all(messagePromises);

    await Promise.all(
      messages.map(msg => this.deliveryService.sendAdminEmail(msg.id))
    );

    return {
      success: true,
      messageCount: messages.length,
      message: `${messages.length} emails queued for delivery`,
    };
  }
}
