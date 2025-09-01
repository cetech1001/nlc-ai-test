import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {
  CreatePaymentRequestRequest,
  UpdatePaymentRequestRequest,
  PaymentRequestFilters,
  ExtendedPaymentRequest,
  Paginated, UserType
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";
import {ConfigService} from "@nestjs/config";
import Stripe from 'stripe';

@Injectable()
export class PaymentRequestsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('billing.stripe.secretKey');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey);
    }
  }

  async createPaymentRequest(data: CreatePaymentRequestRequest): Promise<ExtendedPaymentRequest> {
    await this.validateUser(data.createdByID, data.createdByType);
    await this.validateUser(data.payerID, data.payerType);

    await this.validatePaymentContext(data);

    try {
      const paymentRequest = await this.prisma.paymentRequest.create({
        data: {
          createdByID: data.createdByID,
          createdByType: data.createdByType,
          payerID: data.payerID,
          payerType: data.payerType,
          type: data.type,
          planID: data.planID,
          courseID: data.courseID,
          communityID: data.communityID,
          amount: data.amount,
          currency: data.currency || 'USD',
          description: data.description,
          notes: data.notes,
          expiresAt: data.expiresAt,
          metadata: data.metadata || {},
        },
        include: this.getPaymentRequestIncludes(),
      });

      if (this.stripe) {
        const paymentLink = await this.createStripePaymentLink(paymentRequest);
        if (paymentLink) {
          await this.prisma.paymentRequest.update({
            where: { id: paymentRequest.id },
            data: {
              stripePaymentLinkID: paymentLink.id,
              paymentLinkUrl: paymentLink.url,
            },
          });
        }
      }

      return this.mapPaymentRequestWithDetails(paymentRequest);
    } catch (error: any) {
      throw new BadRequestException(`Failed to create payment request: ${error.message}`);
    }
  }

  async findAllPaymentRequests(filters: PaymentRequestFilters = {}): Promise<Paginated<ExtendedPaymentRequest>> {
    const where: any = {};

    if (filters.payerID) where.payerID = filters.payerID;
    if (filters.payerType) where.payerType = filters.payerType;
    if (filters.createdByID) where.createdByID = filters.createdByID;
    if (filters.createdByType) where.createdByType = filters.createdByType;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    if (filters.expiringBefore) {
      where.expiresAt = { lte: filters.expiringBefore };
    }

    const result = await this.prisma.paginate(this.prisma.paymentRequest, {
      where,
      include: this.getPaymentRequestIncludes(),
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...result,
      data: result.data.map(pr => this.mapPaymentRequestWithDetails(pr)),
    };
  }

  async findPaymentRequestByID(id: string): Promise<ExtendedPaymentRequest> {
    const paymentRequest = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: this.getPaymentRequestIncludes(),
    });

    if (!paymentRequest) {
      throw new NotFoundException('Payment request not found');
    }

    return this.mapPaymentRequestWithDetails(paymentRequest);
  }

  async updatePaymentRequest(id: string, data: UpdatePaymentRequestRequest): Promise<ExtendedPaymentRequest> {
    await this.findPaymentRequestByID(id);

    try {
      const updated = await this.prisma.paymentRequest.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: this.getPaymentRequestIncludes(),
      });

      return this.mapPaymentRequestWithDetails(updated);
    } catch (error: any) {
      throw new BadRequestException(`Failed to update payment request: ${error.message}`);
    }
  }

  async cancelPaymentRequest(id: string): Promise<ExtendedPaymentRequest> {
    const paymentRequest = await this.findPaymentRequestByID(id);

    if (paymentRequest.status === 'paid') {
      throw new BadRequestException('Cannot cancel paid payment request');
    }

    if (paymentRequest.stripePaymentLinkID && this.stripe) {
      try {
        await this.stripe.paymentLinks.update(paymentRequest.stripePaymentLinkID, {
          active: false,
        });
      } catch (error) {
        console.error('Failed to deactivate Stripe payment link:', error);
      }
    }

    return this.updatePaymentRequest(id, { status: 'canceled' });
  }

  async markPaymentRequestPaid(id: string, paidAmount?: number): Promise<ExtendedPaymentRequest> {
    const paymentRequest = await this.findPaymentRequestByID(id);

    if (paymentRequest.status === 'paid') {
      throw new BadRequestException('Payment request is already paid');
    }

    return this.updatePaymentRequest(id, {
      status: 'paid',
      paidAt: new Date(),
      paidAmount: paidAmount || paymentRequest.amount,
    });
  }

  async getPaymentRequestsByPayer(payerID: string, payerType: UserType, limit = 50): Promise<ExtendedPaymentRequest[]> {
    const result = await this.findAllPaymentRequests({ payerID, payerType });
    return result.data.slice(0, limit);
  }

  async getExpiredPaymentRequests(): Promise<ExtendedPaymentRequest[]> {
    const result = await this.findAllPaymentRequests({
      status: 'pending',
      expiringBefore: new Date(),
    });
    return result.data;
  }

  async processExpiredPaymentRequests(): Promise<{ processed: number; errors: string[] }> {
    const expiredRequests = await this.getExpiredPaymentRequests();
    let processed = 0;
    const errors: string[] = [];

    for (const request of expiredRequests) {
      try {
        await this.updatePaymentRequest(request.id, { status: 'expired' });
        processed++;
      } catch (error: any) {
        errors.push(`Failed to expire payment request ${request.id}: ${error.message}`);
      }
    }

    return { processed, errors };
  }

  private async validateUser(userID: string, userType: UserType): Promise<void> {
    const table = userType === UserType.coach ? UserType.coach : UserType.client;

    let user;
    if (table === UserType.coach) {
      user = await this.prisma.coach.findUnique({
        where: { id: userID },
      });
    } else {
      user = await this.prisma.client.findUnique({
        where: { id: userID },
      });
    }

    if (!user) {
      throw new NotFoundException(`${userType} not found`);
    }
  }

  private async validatePaymentContext(data: CreatePaymentRequestRequest): Promise<void> {
    if (data.planID) {
      const plan = await this.prisma.plan.findUnique({ where: { id: data.planID } });
      if (!plan) throw new NotFoundException('Plan not found');
    }

    if (data.courseID) {
      const course = await this.prisma.course.findUnique({ where: { id: data.courseID } });
      if (!course) throw new NotFoundException('Course not found');
    }

    if (data.communityID) {
      const community = await this.prisma.community.findUnique({ where: { id: data.communityID } });
      if (!community) throw new NotFoundException('Community not found');
    }
  }

  private async createStripePaymentLink(paymentRequest: any): Promise<{ id: string; url: string } | null> {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: paymentRequest.amount,
        currency: paymentRequest.currency.toLowerCase(),
        product_data: {
          name: paymentRequest.description || 'Payment Request',
        },
        metadata: {
          paymentRequestID: paymentRequest.id,
          payerID: paymentRequest.payerID,
          payerType: paymentRequest.payerType,
          type: paymentRequest.type,
        },
      });

      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: {
          paymentRequestID: paymentRequest.id,
          payerID: paymentRequest.payerID,
          payerType: paymentRequest.payerType,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${this.configService.get('PLATFORM_URL')}/payments/success?requestId=${paymentRequest.id}`,
          },
        },
      });

      return { id: paymentLink.id, url: paymentLink.url };
    } catch (error) {
      console.error('Failed to create Stripe payment link:', error);
      return null;
    }
  }

  private getPaymentRequestIncludes() {
    return {
      plan: { select: { name: true, monthlyPrice: true } },
      course: { select: { title: true, price: true } },
      community: { select: { name: true, pricingType: true } },
    };
  }

  private mapPaymentRequestWithDetails(paymentRequest: any): ExtendedPaymentRequest {
    return {
      ...paymentRequest,
      payer: {
        id: paymentRequest.payerID,
        name: '',
        email: '',
      },
    };
  }
}
