import { Injectable, Logger } from "@nestjs/common";
import { EventBusService } from "@nlc-ai/api-messaging";
import { PrismaService } from "@nlc-ai/api-database";
import { SendService } from "../../send/send.service";
import { ConfigService } from "@nestjs/config";
import { EmailStatus, UserType } from "@nlc-ai/types";

@Injectable()
export class BillingHandler {
  private readonly logger = new Logger(BillingHandler.name);
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
      'email.billing-events',
      [
        'billing.payment.completed',
        'billing.payment.failed',
        'billing.subscription.activated',
        'billing.subscription.cancelled',
        'billing.invoice.issued'
      ],
      this.handleBillingEvents.bind(this)
    );
  }

  private async handleBillingEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'billing.payment.completed':
          await this.handlePaymentCompleted(payload);
          break;
        case 'billing.payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'billing.subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;
        case 'billing.subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'billing.invoice.issued':
          await this.handleInvoiceIssued(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle billing event:', error);
    }
  }

  private async handlePaymentCompleted(payload: any) {
    const { coachID, amount, planName, transactionID } = payload;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true },
    });

    if (!coach) return;

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: coachID,
        userType: UserType.COACH,
        from: this.systemFromEmail,
        to: coach.email,
        emailTemplateID: 'payment_confirmation',
        status: EmailStatus.PENDING,
        metadata: {
          type: 'billing',
          amount,
          planName,
          transactionID,
        },
      },
    });

    await this.sendService.sendSystemEmail(message.id);
    this.logger.log(`Payment confirmation queued for coach ${coachID}`);
  }

  private async handlePaymentFailed(payload: any) {
    const { coachID, amount, reason, retryUrl } = payload;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true },
    });

    if (!coach) return;

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: coachID,
        userType: UserType.COACH,
        from: this.systemFromEmail,
        to: coach.email,
        emailTemplateID: 'payment_failure',
        status: EmailStatus.PENDING,
        metadata: {
          type: 'billing',
          amount,
          reason,
          retryUrl,
        },
      },
    });

    await this.sendService.sendSystemEmail(message.id);
    this.logger.log(`Payment failure notification queued for coach ${coachID}`);
  }

  private async handleSubscriptionActivated(payload: any) {
    const { coachID, planName, billingCycle } = payload;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true },
    });

    if (!coach) return;

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: coachID,
        userType: UserType.COACH,
        from: this.systemFromEmail,
        to: coach.email,
        emailTemplateID: 'subscription_activation',
        status: EmailStatus.PENDING,
        metadata: {
          type: 'billing',
          planName,
          billingCycle,
        },
      },
    });

    await this.sendService.sendSystemEmail(message.id);
    this.logger.log(`Subscription activation queued for coach ${coachID}`);
  }

  private async handleSubscriptionCancelled(payload: any) {
    const { coachID, planName, cancelReason } = payload;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true },
    });

    if (!coach) return;

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: coachID,
        userType: UserType.COACH,
        from: this.systemFromEmail,
        to: coach.email,
        emailTemplateID: 'subscription_cancellation',
        status: EmailStatus.PENDING,
        metadata: {
          type: 'billing',
          planName,
          cancelReason,
        },
      },
    });

    await this.sendService.sendSystemEmail(message.id);
    this.logger.log(`Subscription cancellation queued for coach ${coachID}`);
  }

  private async handleInvoiceIssued(payload: any) {
    const { coachID, invoiceNumber, amount, dueDate } = payload;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true },
    });

    if (!coach) return;

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: coachID,
        userType: UserType.COACH,
        from: this.systemFromEmail,
        to: coach.email,
        emailTemplateID: 'invoice',
        status: EmailStatus.PENDING,
        metadata: {
          type: 'billing',
          invoiceNumber,
          amount,
          dueDate,
        },
      },
    });

    await this.sendService.sendSystemEmail(message.id);
    this.logger.log(`Invoice email queued for coach ${coachID}`);
  }
}
