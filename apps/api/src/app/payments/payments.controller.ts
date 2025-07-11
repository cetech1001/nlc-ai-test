import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  Get,
  Param, BadRequestException, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService, type CreatePaymentIntentRequest, type ProcessPaymentRequest } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('send-payment-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send payment request email with Stripe payment link' })
  @ApiResponse({ status: 201, description: 'Payment request sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async sendPaymentRequest(@Body() data: {
    coachId: string;
    planId: string;
    amount: number;
    currency?: string;
    description?: string;
  }) {
    return this.paymentsService.sendPaymentRequest(data);
  }

  @Post('create-payment-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe payment link for coach payment' })
  @ApiResponse({ status: 201, description: 'Payment link created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async createPaymentLink(@Body() data: {
    coachId: string;
    planId: string;
    amount: number;
    currency?: string;
    description?: string;
  }) {
    return this.paymentsService.createPaymentLink(data);
  }

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for coach payment' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async createPaymentIntent(@Body() data: CreatePaymentIntentRequest) {
    return this.paymentsService.createPaymentIntent(data);
  }

  @Post('process-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a payment for a coach' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment failed' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async processPayment(@Body() data: ProcessPaymentRequest) {
    return this.paymentsService.processPayment(data);
  }

  @Get('customer/:customerId/payment-methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment methods for a customer' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods(@Param('customerId') customerId: string) {
    return this.paymentsService.getPaymentMethods(customerId);
  }

  @Post('setup-intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a setup intent for saving payment methods' })
  @ApiResponse({ status: 201, description: 'Setup intent created successfully' })
  async createSetupIntent(@Body() data: { customerId: string }) {
    return this.paymentsService.createSetupIntent(data.customerId);
  }

  @Get('payment-link/:linkId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment link status' })
  @ApiResponse({ status: 200, description: 'Payment link status retrieved successfully' })
  async getPaymentLinkStatus(@Param('linkId') linkId: string) {
    return this.paymentsService.getPaymentLinkStatus(linkId);
  }

  @Patch('payment-link/:linkId/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a payment link' })
  @ApiResponse({ status: 200, description: 'Payment link deactivated successfully' })
  async deactivatePaymentLink(@Param('linkId') linkId: string) {
    await this.paymentsService.deactivatePaymentLink(linkId);
    return { message: 'Payment link deactivated successfully' };
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any // Use any type to access rawBody
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!(req as any).rawBody) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }

    try {
      await this.paymentsService.handleWebhook(signature, (req as any).rawBody);
      return { received: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }
}
