import { Injectable, Logger } from "@nestjs/common";
import { EventBusService } from "@nlc-ai/api-messaging";
import { PrismaService } from "@nlc-ai/api-database";
import { SendService } from "../../send/send.service";
import { ConfigService } from "@nestjs/config";
import { EmailStatus, UserType } from "@nlc-ai/types";

@Injectable()
export class AuthHandler {
  private readonly logger = new Logger(AuthHandler.name);
  private readonly systemFromEmail: string;

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
    private readonly sendService: SendService,
    private readonly configService: ConfigService,
  ) {
    this.systemFromEmail = this.configService.get<string>(
      'email.mailgun.fromEmail',
      'support@nextlevelcoach.ai'
    );
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email.auth-verification',
      ['auth.verification.requested'],
      this.handleVerificationRequested.bind(this)
    );

    await this.eventBus.subscribe(
      'email.coach-registration',
      ['auth.coach.registered'],
      this.handleCoachRegistered.bind(this)
    );

    await this.eventBus.subscribe(
      'email.coach-verification',
      ['auth.coach.verified'],
      this.handleCoachVerified.bind(this)
    );

    await this.eventBus.subscribe(
      'email.password-reset',
      ['auth.password.reset'],
      this.handlePasswordReset.bind(this)
    );

    await this.eventBus.subscribe(
      'email.client-invitations',
      ['auth.client.invited'],
      this.handleClientInvited.bind(this)
    );
  }

  private async handleVerificationRequested(event: any) {
    try {
      const { email, type, code } = event.payload;

      const templateID = type === 'email_verification'
        ? 'email_verification'
        : 'password_reset';

      const message = await this.prisma.emailMessage.create({
        data: {
          userID: 'system',
          userType: UserType.ADMIN,
          from: this.systemFromEmail,
          to: email,
          emailTemplateID: templateID,
          status: EmailStatus.PENDING,
          metadata: {
            type: 'transactional',
            verificationCode: code,
            email: email,
          },
        },
      });

      await this.sendService.sendSystemEmail(message.id);
      this.logger.log(`Verification email queued for ${email}`);
    } catch (error) {
      this.logger.error('Failed to handle verification request:', error);
    }
  }

  private async handleCoachRegistered(event: any) {
    try {
      const { email, firstName, lastName } = event.payload;

      const message = await this.prisma.emailMessage.create({
        data: {
          userID: 'system',
          userType: UserType.ADMIN,
          from: this.systemFromEmail,
          to: email,
          emailTemplateID: 'welcome_coach',
          status: EmailStatus.PENDING,
          metadata: {
            type: 'transactional',
            name: `${firstName} ${lastName}`,
          },
        },
      });

      await this.sendService.sendSystemEmail(message.id);
      this.logger.log(`Welcome email queued for ${email}`);
    } catch (error) {
      this.logger.error('Failed to send welcome email:', error);
    }
  }

  private async handleCoachVerified(event: any) {
    try {
      const { email } = event.payload;

      // In the future, trigger onboarding sequence here
      // await this.sequencesService.executeSequence(...)

      this.logger.log(`Coach verified: ${email}. Onboarding sequence would trigger here.`);
    } catch (error) {
      this.logger.error('Failed to handle coach verification:', error);
    }
  }

  private async handlePasswordReset(event: any) {
    try {
      const { email } = event.payload;

      const message = await this.prisma.emailMessage.create({
        data: {
          userID: 'system',
          userType: UserType.ADMIN,
          from: this.systemFromEmail,
          to: email,
          emailTemplateID: 'password_reset_success',
          status: EmailStatus.PENDING,
          metadata: {
            type: 'transactional',
          },
        },
      });

      await this.sendService.sendSystemEmail(message.id);
      this.logger.log(`Password reset confirmation queued for ${email}`);
    } catch (error) {
      this.logger.error('Failed to send password reset confirmation:', error);
    }
  }

  private async handleClientInvited(event: any) {
    try {
      const { email, coachName, token, expiresAt, businessName, message: inviteMessage } = event.payload;
      const baseUrl = this.configService.get<string>('email.platforms.client', '');
      const inviteUrl = `${baseUrl}/login?token=${token}`;

      const message = await this.prisma.emailMessage.create({
        data: {
          userID: 'system',
          userType: UserType.ADMIN,
          from: this.systemFromEmail,
          to: email,
          emailTemplateID: 'client_invite',
          status: EmailStatus.PENDING,
          metadata: {
            type: 'transactional',
            inviteUrl,
            coachName,
            businessName: businessName || `${coachName}'s coaching program`,
            message: inviteMessage || 'N/A',
            expiryText: expiresAt
              ? `This invitation expires on ${new Date(expiresAt).toLocaleDateString()}.`
              : 'This invitation will expire in 7 days.',
          },
        },
      });

      await this.sendService.sendSystemEmail(message.id);
      this.logger.log(`Client invitation queued for ${email}`);
    } catch (error) {
      this.logger.error('Failed to send client invitation:', error);
    }
  }
}
