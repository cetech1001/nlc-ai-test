// apps/api/src/app/payments/payments.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import Stripe from 'stripe';

export interface CreatePaymentIntentRequest {
  coachId: string;
  planId: string;
  amount: number; // in cents
  currency?: string;
  description?: string;
  paymentMethodId?: string; // for immediate processing
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ProcessPaymentRequest {
  coachId: string;
  planId: string;
  amount: number;
  paymentMethodId: string;
  description?: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

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

  async createPaymentLink(data: {
    coachId: string;
    planId: string;
    amount: number;
    currency?: string;
    description?: string;
  }): Promise<{ paymentLink: string; linkId: string }> {
    const { coachId, planId, amount, currency = 'USD', description } = data;

    // Validate coach exists
    const coach = await this.prisma.coaches.findUnique({
      where: { id: coachId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Validate plan exists
    const plan = await this.prisma.plans.findUnique({
      where: { id: planId },
      select: { id: true, name: true }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    try {
      // Create a price for this specific payment
      const price = await this.stripe.prices.create({
        unit_amount: amount,
        currency: currency.toLowerCase(),
        product_data: {
          name: `${plan.name} Plan Payment`,
        },
        metadata: {
          coachId,
          planId,
          planName: plan.name,
          coachName: `${coach.firstName} ${coach.lastName}`,
          description: description || `Payment for ${plan.name} plan for ${coach.firstName} ${coach.lastName}`,
        },
      });

      // Create payment link
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          coachId,
          planId,
          planName: plan.name,
          coachName: `${coach.firstName} ${coach.lastName}`,
          coachEmail: coach.email,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${this.configService.get('ADMIN_PLATFORM_URL')}/coaches/make-payment?coachId=${coachId}&payment=success`,
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

      // Store payment link in PaymentLinks table
      const paymentLinkRecord = await this.prisma.paymentLinks.create({
        data: {
          coachId,
          planId,
          stripePaymentLinkId: paymentLink.id,
          paymentLinkUrl: paymentLink.url,
          amount,
          currency: currency.toUpperCase(),
          description,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      console.log('Payment link created:', {
        id: paymentLinkRecord.id,
        stripeId: paymentLink.id,
        coachId,
        planId,
        amount,
      });

      return {
        paymentLink: paymentLink.url,
        linkId: paymentLink.id,
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new BadRequestException(`Failed to create payment link: ${error.message}`);
    }
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    const { coachId, planId, amount, currency = 'USD', description } = data;

    // Validate coach exists
    const coach = await this.prisma.coaches.findUnique({
      where: { id: coachId },
      select: { id: true, email: true, firstName: true, lastName: true, stripeCustomerId: true }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Validate plan exists
    const plan = await this.prisma.plans.findUnique({
      where: { id: planId },
      select: { id: true, name: true }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Create or get Stripe customer
    let customerId = coach.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: coach.email,
        name: `${coach.firstName} ${coach.lastName}`,
        metadata: {
          coachId: coach.id,
        },
      });

      customerId = customer.id;

      // Update coach with Stripe customer ID
      await this.prisma.coaches.update({
        where: { id: coachId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      description: description || `Payment for ${plan.name} plan`,
      metadata: {
        coachId,
        planId,
        planName: plan.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  async processPayment(data: ProcessPaymentRequest): Promise<any> {
    const { coachId, planId, amount, paymentMethodId, description } = data;

    // First create payment intent
    const paymentIntentData = await this.createPaymentIntent({
      coachId,
      planId,
      amount,
      description,
    });

    try {
      // Confirm payment with payment method
      const confirmedPayment = await this.stripe.paymentIntents.confirm(
        paymentIntentData.paymentIntentId,
        {
          payment_method: paymentMethodId,
          return_url: `${this.configService.get('ADMIN_PLATFORM_URL')}/coaches/make-payment`,
        }
      );

      // Create transaction record
      const transaction = await this.createTransactionRecord({
        coachId,
        planId,
        amount,
        stripePaymentId: confirmedPayment.id,
        status: confirmedPayment.status,
        description,
      });

      return {
        transaction,
        paymentIntent: confirmedPayment,
        success: confirmedPayment.status === 'succeeded',
      };
    } catch (error) {
      // Handle payment failure
      await this.createTransactionRecord({
        coachId,
        planId,
        amount,
        stripePaymentId: paymentIntentData.paymentIntentId,
        status: 'failed',
        description,
        failureReason: error.message,
      });

      throw new BadRequestException(`Payment failed: ${error.message}`);
    }
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    console.log('Processing webhook with:', {
      hasSignature: !!signature,
      hasPayload: !!payload,
      payloadLength: payload ? payload.length : 0,
      webhookSecretExists: !!webhookSecret,
    });

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      console.log('Webhook event constructed successfully:', event.type, event.id);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Processing webhook event:', {
      type: event.type,
      id: event.id,
      livemode: event.livemode,
    });

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
        case 'customer.created':
          console.log('Customer created:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      console.log('Webhook processed successfully');
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { coachId, planId } = session.metadata || {};

    if (!coachId || !planId) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Create transaction record for payment link payment
    const transaction = await this.createTransactionRecord({
      coachId,
      planId,
      amount: session.amount_total || 0,
      stripePaymentId: session.payment_intent as string,
      status: 'completed',
      description: `Payment via payment link - Session: ${session.id}`,
    });

    // Create or update subscription
    await this.createOrUpdateSubscription(coachId, planId);

    console.log('Payment link payment completed:', {
      sessionId: session.id,
      coachId,
      planId,
      transactionId: transaction.id,
    });
  }

  private async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { coachId, planId } = paymentIntent.metadata;

    console.log('Handling successful payment:', {
      paymentIntentId: paymentIntent.id,
      coachId,
      planId,
      amount: paymentIntent.amount,
    });

    if (!coachId || !planId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    try {
      // Update transaction status
      const updatedTransactions = await this.prisma.transactions.updateMany({
        where: {
          stripePaymentId: paymentIntent.id,
        },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      });

      console.log('Updated transactions:', updatedTransactions.count);

      // Create or update subscription
      await this.createOrUpdateSubscription(coachId, planId);

      console.log('Payment processing completed successfully');
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw error;
    }
  }

  private async handleFailedPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.prisma.transactions.updateMany({
      where: {
        stripePaymentId: paymentIntent.id,
      },
      data: {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });
  }

  private async createTransactionRecord(data: {
    coachId: string;
    planId: string;
    amount: number;
    stripePaymentId: string;
    status: string;
    description?: string;
    failureReason?: string;
  }) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return this.prisma.transactions.create({
      data: {
        coachId: data.coachId,
        planId: data.planId,
        amount: data.amount,
        currency: 'USD',
        status: data.status as any,
        paymentMethod: 'stripe',
        stripePaymentId: data.stripePaymentId,
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

  private async createOrUpdateSubscription(coachId: string, planId: string): Promise<void> {
    // Check if coach has an active subscription
    const existingSubscription = await this.prisma.subscriptions.findFirst({
      where: {
        coachId,
        status: 'active',
      },
    });

    if (existingSubscription) {
      // Update existing subscription
      await this.prisma.subscriptions.update({
        where: { id: existingSubscription.id },
        data: {
          planId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      // Create new subscription
      await this.prisma.subscriptions.create({
        data: {
          coachId,
          planId,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  async sendPaymentRequest(data: {
    coachId: string;
    planId: string;
    amount: number;
    paymentLink?: string;
    linkId?: string;
    currency?: string;
    description?: string;
  }): Promise<{ paymentLink: string; linkId: string; emailSent: boolean }> {
    let paymentLink = data.paymentLink;
    let linkId = data.linkId;
    if (!paymentLink || !linkId) {
      const result = await this.createPaymentLink(data);
      paymentLink = result.paymentLink;
      linkId = result.linkId;
    }

    // Get coach and plan details for email
    const [coach, plan] = await Promise.all([
      this.prisma.coaches.findUnique({
        where: { id: data.coachId },
        select: { email: true, firstName: true, lastName: true }
      }),
      this.prisma.plans.findUnique({
        where: { id: data.planId },
        select: { name: true, description: true }
      })
    ]);

    if (!coach || !plan) {
      throw new NotFoundException('Coach or plan not found');
    }

    let emailSent = false;
    try {
      // Send payment request email
      await this.emailService.sendPaymentRequestEmail({
        to: coach.email,
        coachName: `${coach.firstName} ${coach.lastName}`,
        planName: plan.name,
        planDescription: plan.description || undefined,
        amount: Math.floor(data.amount / 100), // Convert from cents to dollars
        paymentLink,
        description: data.description,
      });
      emailSent = true;

      console.log('Payment request email sent successfully to:', coach.email);
    } catch (error) {
      console.error('Failed to send payment request email:', error);
      // Don't throw error - payment link was created successfully
    }

    return {
      paymentLink,
      linkId,
      emailSent,
    };
  }

  async getPaymentLinkStatus(linkId: string): Promise<{
    status: string;
    paymentsCount: number;
    totalAmount: number;
  }> {
    try {
      const paymentLink = await this.stripe.paymentLinks.retrieve(linkId);

      return {
        status: paymentLink.active ? 'active' : 'inactive',
        paymentsCount: 0, // Stripe doesn't provide this directly
        totalAmount: 0, // Would need to query payment intents
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve payment link status: ${error.message}`);
    }
  }

  async createSetupIntent(customerId: string): Promise<{ client_secret: string }> {
    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return { client_secret: setupIntent.client_secret! };
  }

  // Add this method to your PaymentsService class

  async deactivatePaymentLink(linkId: string): Promise<void> {
    try {
      // Deactivate in Stripe
      await this.stripe.paymentLinks.update(linkId, {
        active: false,
      });

      // Deactivate in database
      await this.prisma.paymentLinks.updateMany({
        where: { stripePaymentLinkId: linkId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      console.log('Payment link deactivated:', linkId);
    } catch (error) {
      console.error('Error deactivating payment link:', error);
      throw new BadRequestException(`Failed to deactivate payment link: ${error.message}`);
    }
  }
}
