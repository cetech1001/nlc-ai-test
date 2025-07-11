import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import {CreatePaymentIntentRequest, PaymentIntentResponse, ProcessPaymentRequest} from "@nlc-ai/types";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecretKey);
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
    } catch (error: any) {
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

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handleSuccessfulPayment(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handleFailedPayment(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.created':
        // Handle customer creation if needed
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { coachId, planId } = paymentIntent.metadata;

    if (!coachId || !planId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Update transaction status
    await this.prisma.transactions.updateMany({
      where: {
        stripePaymentId: paymentIntent.id,
      },
      data: {
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Create or update subscription
    await this.createOrUpdateSubscription(coachId, planId);
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

  async createSetupIntent(customerId: string): Promise<{ client_secret: string }> {
    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return { client_secret: setupIntent.client_secret! };
  }
}
