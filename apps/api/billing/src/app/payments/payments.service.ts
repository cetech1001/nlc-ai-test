import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EmailService} from '../email/email.service';
import Stripe from 'stripe';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  ProcessPaymentRequest,
  SendPaymentRequest,
  UserType
} from "@nlc-ai/api-types";
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
    // Validate payer
    await this.validateAndGetUser(data.payerID, data.payerType);

    // Get payment context details
    const context = await this.getPaymentContext(data);

    try {
      const price = await this.stripe.prices.create({
        unit_amount: data.amount,
        currency: (data.currency || 'USD').toLowerCase(),
        product_data: {
          name: context.name,
        },
        metadata: {
          payerID: data.payerID,
          payerType: data.payerType,
          planID: data.planID || '',
          courseID: data.courseID || '',
          communityID: data.communityID || '',
          contextType: context.type,
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
          payerID: data.payerID,
          payerType: data.payerType,
          contextType: context.type,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${this.configService.get('PLATFORM_URL')}/payments/success?payerType=${data.payerType}`,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      });

      // Save payment link to database - this would go in PaymentRequest table now
      // Keeping for backward compatibility
      // await this.prisma.paymentLink.create({ ... });

      return {
        paymentLink: paymentLink.url,
        linkID: paymentLink.id,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to create payment link: ${error.message}`);
    }
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    // Validate payer
    const payer = await this.validateAndGetUser(data.payerID, data.payerType);

    // Get payment context
    const context = await this.getPaymentContext(data);

    // Get or create Stripe customer
    let customerID = await this.getStripeCustomerID(payer, data.payerType);
    if (!customerID) {
      const customer = await this.stripe.customers.create({
        email: payer.email,
        name: `${payer.firstName} ${payer.lastName}`,
        metadata: {
          userID: data.payerID,
          userType: data.payerType,
        },
      });

      customerID = customer.id;

      // Update user record with Stripe customer ID
      await this.updateUserStripeCustomerID(data.payerID, data.payerType, customerID);
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: (data.currency || 'USD').toLowerCase(),
      customer: customerID,
      description: data.description || `Payment for ${context.name}`,
      metadata: {
        payerID: data.payerID,
        payerType: data.payerType,
        planID: data.planID || '',
        courseID: data.courseID || '',
        communityID: data.communityID || '',
        contextType: context.type,
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
    const paymentIntentData = await this.createPaymentIntent(data);

    try {
      const confirmedPayment = await this.stripe.paymentIntents.confirm(
        paymentIntentData.paymentIntentID,
        {
          payment_method: data.paymentMethodID,
          return_url: `${this.configService.get('PLATFORM_URL')}/payments/completed`,
        }
      );

      // Create transaction record
      const transaction = await this.createTransactionRecord({
        payerID: data.payerID,
        payerType: data.payerType,
        planID: data.planID,
        courseID: data.courseID,
        communityID: data.communityID,
        amount: data.amount,
        stripePaymentID: confirmedPayment.id,
        status: confirmedPayment.status,
        description: data.description,
      });

      return {
        transaction,
        paymentIntent: confirmedPayment,
        success: confirmedPayment.status === 'succeeded',
      };
    } catch (error: any) {
      // Create failed transaction record
      await this.createTransactionRecord({
        payerID: data.payerID,
        payerType: data.payerType,
        planID: data.planID,
        courseID: data.courseID,
        communityID: data.communityID,
        amount: data.amount,
        stripePaymentID: paymentIntentData.paymentIntentID,
        status: 'failed',
        description: data.description,
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

  async sendPaymentRequest(data: SendPaymentRequest): Promise<{ paymentLink: string; linkID: string; emailSent: boolean }> {
    let paymentLink = data.paymentLink;
    let linkID = data.linkID;

    if (!paymentLink || !linkID) {
      const result = await this.createPaymentLink(data);
      paymentLink = result.paymentLink;
      linkID = result.linkID;
    }

    const payer = await this.validateAndGetUser(data.payerID, data.payerType);
    const context = await this.getPaymentContext(data);

    let emailSent = false;
    try {
      await this.emailService.sendPaymentRequestEmail({
        to: payer.email,
        payerName: `${payer.firstName} ${payer.lastName}`,
        itemName: context.name,
        itemDescription: context.description,
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

  async getPaymentMethods(customerID: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerID,
      type: 'card',
    });

    return paymentMethods.data;
  }

  async createSetupIntent(payerID: string, payerType: UserType): Promise<{ client_secret: string }> {
    const payer = await this.validateAndGetUser(payerID, payerType);

    let customerID = await this.getStripeCustomerID(payer, payerType);
    if (!customerID) {
      const customer = await this.stripe.customers.create({
        email: payer.email,
        name: `${payer.firstName} ${payer.lastName}`,
        metadata: {
          userID: payerID,
          userType: payerType,
        },
      });

      customerID = customer.id;

      await this.updateUserStripeCustomerID(payerID, payerType, customerID);
    }

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

      // Update database record if it exists
      // await this.prisma.paymentLink.updateMany({ ... });
    } catch (error: any) {
      throw new BadRequestException(`Failed to deactivate payment link: ${error.message}`);
    }
  }

  private async validateAndGetUser(userID: string, userType: UserType): Promise<any> {
    let user;

    if (userType === UserType.coach) {
      user = await this.prisma.coach.findUnique({
        where: { id: userID },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          stripeCustomerID: true
        }
      });
    } else {
      user = await this.prisma.client.findUnique({
        where: { id: userID },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          stripeCustomerID: true
        }
      });
    }

    if (!user) {
      throw new NotFoundException(`${userType} not found`);
    }

    return user;
  }

  private async getPaymentContext(data: CreatePaymentIntentRequest): Promise<{
    type: string;
    name: string;
    description?: string | null;
  }> {
    if (data.planID) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: data.planID },
        select: { name: true, description: true }
      });
      if (!plan) throw new NotFoundException('Plan not found');
      return { type: 'plan', name: plan.name, description: plan.description };
    }

    if (data.courseID) {
      const course = await this.prisma.course.findUnique({
        where: { id: data.courseID },
        select: { title: true, description: true }
      });
      if (!course) throw new NotFoundException('Course not found');
      return { type: 'course', name: course.title, description: course.description };
    }

    if (data.communityID) {
      const community = await this.prisma.community.findUnique({
        where: { id: data.communityID },
        select: { name: true, description: true }
      });
      if (!community) throw new NotFoundException('Community not found');
      return { type: 'community', name: community.name, description: community.description };
    }

    throw new BadRequestException('At least one of planID, courseID, or communityID must be provided');
  }

  private async getStripeCustomerID(user: any, userType: UserType): Promise<string | null> {
    return user.stripeCustomerID || null;
  }

  private async updateUserStripeCustomerID(userID: string, userType: UserType, stripeCustomerID: string): Promise<void> {
    if (userType === UserType.coach) {
      await this.prisma.coach.update({
        where: { id: userID },
        data: { stripeCustomerID },
      });
    } else {
      await this.prisma.client.update({
        where: { id: userID },
        data: { stripeCustomerID },
      });
    }
  }

  private async createTransactionRecord(data: {
    payerID: string;
    payerType: UserType;
    planID?: string;
    courseID?: string;
    communityID?: string;
    amount: number;
    stripePaymentID: string;
    status: string;
    description?: string;
    failureReason?: string;
  }) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return this.prisma.transaction.create({
      data: {
        payerID: data.payerID,
        payerType: data.payerType,
        planID: data.planID,
        courseID: data.courseID,
        communityID: data.communityID,
        amount: data.amount,
        currency: 'USD',
        status: data.status as any,
        paymentMethodType: 'stripe',
        stripePaymentID: data.stripePaymentID,
        invoiceNumber,
        invoiceDate: new Date(),
        description: data.description,
        failureReason: data.failureReason,
      },
    });
  }

  private async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { payerID, payerType, planID, courseID, communityID } = paymentIntent.metadata as any;

    if (!payerID || !payerType) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    try {
      // Update transaction status
      await this.prisma.transaction.updateMany({
        where: {
          stripePaymentID: paymentIntent.id,
        },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      });

      // Handle post-payment actions based on context
      if (planID) {
        await this.createOrUpdateCoachSubscription(payerID, planID);
      } else if (courseID) {
        await this.createCourseEnrollment(payerID, courseID);
      } else if (communityID) {
        await this.createCommunitySubscription(payerID, communityID);
      }
    } catch (error: any) {
      console.error('Error handling successful payment:', error);
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

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { payerID, payerType, contextType } = session.metadata || {};

    if (!payerID || !payerType) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    await this.createTransactionRecord({
      payerID: payerID,
      payerType: payerType as UserType,
      planID: contextType === 'plan' ? session.metadata?.planID : undefined,
      courseID: contextType === 'course' ? session.metadata?.courseID : undefined,
      communityID: contextType === 'community' ? session.metadata?.communityID : undefined,
      amount: session.amount_total || 0,
      stripePaymentID: session.payment_intent as string,
      status: 'completed',
      description: `Payment via payment link - Session: ${session.id}`,
    });

    // Handle post-payment actions
    if (contextType === 'plan' && session.metadata?.planID) {
      await this.createOrUpdateCoachSubscription(payerID, session.metadata.planID);
    } else if (contextType === 'course' && session.metadata?.courseID) {
      await this.createCourseEnrollment(payerID, session.metadata.courseID);
    } else if (contextType === 'community' && session.metadata?.communityID) {
      await this.createCommunitySubscription(payerID, session.metadata.communityID);
    }
  }

  private async createOrUpdateCoachSubscription(coachID: string, planID: string): Promise<void> {
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        subscriberID: coachID,
        subscriberType: 'coach',
        status: 'active',
      },
    });

    const plan = await this.prisma.plan.findUnique({
      where: { id: planID },
      select: { monthlyPrice: true }
    });

    if (!plan) return;

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planID,
          amount: plan.monthlyPrice,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          subscriberID: coachID,
          subscriberType: 'coach',
          planID,
          status: 'active',
          billingCycle: 'monthly',
          amount: plan.monthlyPrice,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  private async createCourseEnrollment(clientID: string, courseID: string): Promise<void> {
    const existingEnrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        courseID_clientID: {
          courseID,
          clientID,
        },
      },
    });

    if (!existingEnrollment) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseID },
        select: { price: true }
      });

      await this.prisma.courseEnrollment.create({
        data: {
          courseID,
          clientID,
          paymentType: 'one_time',
          totalPaid: course?.price || 0,
          remainingBalance: 0,
          status: 'active',
        },
      });
    }
  }

  private async createCommunitySubscription(clientID: string, communityID: string): Promise<void> {
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        subscriberID: clientID,
        subscriberType: 'client',
        communityID,
        status: 'active',
      },
    });

    if (!existingSubscription) {
      const community = await this.prisma.community.findUnique({
        where: { id: communityID },
        select: { monthlyPrice: true }
      });

      if (!community || !community.monthlyPrice) return;

      await this.prisma.subscription.create({
        data: {
          subscriberID: clientID,
          subscriberType: 'client',
          communityID,
          status: 'active',
          billingCycle: 'monthly',
          amount: community.monthlyPrice,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}
