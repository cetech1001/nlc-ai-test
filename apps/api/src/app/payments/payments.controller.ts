import {
  Controller,
  Post,
  Body,
  Headers,
  type RawBodyRequest,
  Req,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import type { Request } from 'express';
import type {CreatePaymentIntentRequest, ProcessPaymentRequest} from "@nlc-ai/types";

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody!);
  }
}
