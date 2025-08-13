import {Injectable, BadRequestException, NotFoundException, Logger} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import Stripe from 'stripe';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  PaymentMethodType,
  ProcessPaymentRequest, SendPaymentRequest
} from "@nlc-ai/types";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecretKey);
  }

  async createPaymentLink(data: CreatePaymentIntentRequest): Promise<{ paymentLink: string; linkID: string }> {
    const { coachID, planID, amount, currency = 'USD', description } = data;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planID },
      select: { id: true, name: true }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    try {
      const price = await this.stripe.prices.create({
        unit_amount: amount,
        currency: currency.toLowerCase(),
        product_data: {
          name: `${plan.name} Plan Payment`,
        },
        metadata: {
          coachID,
          planID,
          planName: plan.name,
          coachName: `${coach.firstName} ${coach.lastName}`,
          description: description || `Payment for ${plan.name} plan for ${coach.firstName} ${coach.lastName}`,
        },
      });

      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          coachID,
          planID,
          planName: plan.name,
          coachName: `${coach.firstName} ${coach.lastName}`,
          coachEmail: coach.email,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${this.configService.get('COACH_PLATFORM_URL')}/payments/completed?coachID=${coachID}&payment=success`,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL'],
        },
        phone_number_collection: {
          enabled: true,
        },
        custom_fields: [
          {
            key: 'coach_reference',
            label: {
              type: 'custom',
              custom: 'Coach Reference',
            },
            type: 'text',
            optional: true,
          },
        ],
      });

      await this.prisma.paymentLink.create({
        data: {
          coachID,
          planID,
          stripePaymentLinkID: paymentLink.id,
          paymentLinkUrl: paymentLink.url,
          amount,
          currency: currency.toUpperCase(),
          description,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        paymentLink: paymentLink.url,
        linkID: paymentLink.id,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to create payment link: ${error.message}`);
    }
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    const { coachID, planID, amount, currency = 'USD', description } = data;

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { id: true, email: true, firstName: true, lastName: true, stripeCustomerID: true }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planID },
      select: { id: true, name: true }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    let customerID = coach.stripeCustomerID;
    if (!customerID) {
      const customer = await this.stripe.customers.create({
        email: coach.email,
        name: `${coach.firstName} ${coach.lastName}`,
        metadata: {
          coachID: coach.id,
        },
      });

      customerID = customer.id;

      await this.prisma.coach.update({
        where: { id: coachID },
        data: { stripeCustomerID: customerID },
      });
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customerID,
      description: description || `Payment for ${plan.name} plan`,
      metadata: {
        coachID,
        planID,
        planName: plan.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentID: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  async processPayment(data: ProcessPaymentRequest): Promise<any> {
    const { coachID, planID, amount, paymentMethodID, description } = data;

    const paymentIntentData = await this.createPaymentIntent({
      coachID: coachID,
      planID,
      amount,
      description,
    });

    try {
      const confirmedPayment = await this.stripe.paymentIntents.confirm(
        paymentIntentData.paymentIntentID,
        {
          payment_method: paymentMethodID,
          return_url: `${this.configService.get('ADMIN_PLATFORM_URL')}/coaches/make-payment`,
        }
      );

      const transaction = await this.createTransactionRecord({
        coachID: coachID,
        planID,
        amount,
        stripePaymentID: confirmedPayment.id,
        status: confirmedPayment.status,
        description,
      });

      return {
        transaction,
        paymentIntent: confirmedPayment,
        success: confirmedPayment.status === 'succeeded',
      };
    } catch (error: any) {
      await this.createTransactionRecord({
        coachID: coachID,
        planID,
        amount,
        stripePaymentID: paymentIntentData.paymentIntentID,
        status: 'failed',
        description,
        failureReason: error.message,
      });

      throw new BadRequestException(`Payment failed: ${error.message}`);
    }
  }

  async handleWebhook(signature: string, payload: Buffer | any): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    // Ensure we have a Buffer for Stripe verification
    const rawPayload: Buffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload));

    try {
      event = this.stripe.webhooks.constructEvent(rawPayload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleSuccessfulPayment(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handleFailedPayment(event.data.object as Stripe.PaymentIntent);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        default:
          break;
      }
    } catch (error: any) {
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { coachID, planID } = session.metadata || {};

    if (!coachID || !planID) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    await this.createTransactionRecord({
      coachID: coachID,
      planID,
      amount: session.amount_total || 0,
      stripePaymentID: session.payment_intent as string,
      status: 'completed',
      description: `Payment via payment link - Session: ${session.id}`,
    });

    await this.createOrUpdateSubscription(coachID, planID);
  }

  private async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { coachID, planID } = paymentIntent.metadata as any;

    if (!coachID || !planID) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    try {
      await this.prisma.transaction.updateMany({
        where: {
          stripePaymentID: paymentIntent.id,
        },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      });

      await this.createOrUpdateSubscription(coachID, planID);
    } catch (error: any) {
      throw error;
    }
  }

  private async handleFailedPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.transaction.updateMany({
      where: {
        stripePaymentID: paymentIntent.id,
      },
      data: {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });
  }

  private async createTransactionRecord(data: {
    coachID: string;
    planID: string;
    amount: number;
    stripePaymentID: string;
    status: string;
    description?: string;
    failureReason?: string;
  }) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return this.prisma.transaction.create({
      data: {
        coachID: data.coachID,
        planID: data.planID,
        amount: data.amount,
        currency: 'USD',
        status: data.status as any,
        paymentMethod: PaymentMethodType.STRIPE,
        stripePaymentID: data.stripePaymentID,
        invoiceNumber,
        invoiceDate: new Date(),
        description: data.description,
        failureReason: data.failureReason,
      },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  private async createOrUpdateSubscription(coachID: string, planID: string): Promise<void> {
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        coachID,
        status: 'active',
      },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planID,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          coachID,
          planID,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  async getPaymentMethods(customerID: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerID,
      type: 'card',
    });

    return paymentMethods.data;
  }

  async sendPaymentRequest(data: SendPaymentRequest): Promise<{ paymentLink: string; linkID: string; emailSent: boolean }> {
    let paymentLink = data.paymentLink;
    let linkID = data.linkID;
    if (!paymentLink || !linkID) {
      const result = await this.createPaymentLink(data);
      paymentLink = result.paymentLink;
      linkID = result.linkID;
    }

    const [coach, plan] = await Promise.all([
      this.prisma.coach.findUnique({
        where: { id: data.coachID },
        select: { email: true, firstName: true, lastName: true }
      }),
      this.prisma.plan.findUnique({
        where: { id: data.planID },
        select: { name: true, description: true }
      })
    ]);

    if (!coach || !plan) {
      throw new NotFoundException('Coach or plan not found');
    }

    let emailSent = false;
    try {
      await this.emailService.sendPaymentRequestEmail({
        to: coach.email,
        coachName: `${coach.firstName} ${coach.lastName}`,
        planName: plan.name,
        planDescription: plan.description || undefined,
        amount: Math.floor(data.amount / 100),
        paymentLink,
        description: data.description,
      });
      emailSent = true;
    } catch (error: any) {
      this.logger.error('Failed to send payment request email:', error);
    }

    return {
      paymentLink,
      linkID,
      emailSent,
    };
  }

  async getPaymentLinkStatus(linkID: string): Promise<{
    status: string;
    paymentsCount: number;
    totalAmount: number;
  }> {
    try {
      const paymentLink = await this.stripe.paymentLinks.retrieve(linkID);

      return {
        status: paymentLink.active ? 'active' : 'inactive',
        paymentsCount: 0,
        totalAmount: 0,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to retrieve payment link status: ${error.message}`);
    }
  }

  async createSetupIntent(customerID: string): Promise<{ client_secret: string }> {
    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerID,
      payment_method_types: ['card'],
    });

    return { client_secret: setupIntent.client_secret! };
  }

  async deactivatePaymentLink(linkID: string): Promise<void> {
    try {
      await this.stripe.paymentLinks.update(linkID, {
        active: false,
      });

      await this.prisma.paymentLink.updateMany({
        where: { stripePaymentLinkID: linkID },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to deactivate payment link: ${error.message}`);
    }
  }
}
