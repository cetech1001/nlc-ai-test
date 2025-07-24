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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import { Public } from '../auth/decorators/public.decorator';
import {CreatePaymentIntentDto, CreateSetupIntentDto, ProcessPaymentRequestDto, SendPaymentRequestDto} from "./dto";

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('send-payment-request')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send payment request email with Stripe payment link' })
  @ApiResponse({ status: 201, description: 'Payment request sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async sendPaymentRequest(@Body() data: SendPaymentRequestDto) {
    return this.paymentsService.sendPaymentRequest(data);
  }

  @Post('create-payment-link')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe payment link for coach payment' })
  @ApiResponse({ status: 201, description: 'Payment link created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async createPaymentLink(@Body() data: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentLink(data);
  }

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for coach payment' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async createPaymentIntent(@Body() data: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(data);
  }

  @Post('process-payment')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a payment for a coach' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment failed' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async processPayment(@Body() data: ProcessPaymentRequestDto) {
    return this.paymentsService.processPayment(data);
  }

  @Get('customer/:customerID/payment-methods')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment methods for a customer' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods(@Param('customerID') customerID: string) {
    return this.paymentsService.getPaymentMethods(customerID);
  }

  @Post('setup-intent')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a setup intent for saving payment methods' })
  @ApiResponse({ status: 201, description: 'Setup intent created successfully' })
  async createSetupIntent(@Body() data: CreateSetupIntentDto) {
    return this.paymentsService.createSetupIntent(data.customerID);
  }

  @Get('payment-link/:linkID/status')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment link status' })
  @ApiResponse({ status: 200, description: 'Payment link status retrieved successfully' })
  async getPaymentLinkStatus(@Param('linkID') linkID: string) {
    return this.paymentsService.getPaymentLinkStatus(linkID);
  }

  @Patch('payment-link/:linkID/deactivate')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a payment link' })
  @ApiResponse({ status: 200, description: 'Payment link deactivated successfully' })
  async deactivatePaymentLink(@Param('linkID') linkID: string) {
    await this.paymentsService.deactivatePaymentLink(linkID);
    return { message: 'Payment link deactivated successfully' };
  }

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const payload = req.body;

    if (!payload) {
      throw new BadRequestException('Missing webhook payload');
    }

    try {
      await this.paymentsService.handleWebhook(signature, payload);
      return { received: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }
}
