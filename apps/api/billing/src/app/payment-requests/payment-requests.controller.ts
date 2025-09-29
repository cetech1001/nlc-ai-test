import {Body, Controller, Get, Param, Post, Put, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {PaymentRequestsService} from './payment-requests.service';
import {CreatePaymentRequestDto, PaymentRequestFiltersDto, UpdatePaymentRequestDto} from "./dto";
import {CurrentUser} from "@nlc-ai/api-auth";
import {type AuthUser, UserType} from "@nlc-ai/types";

@ApiTags('Payment Requests')
@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly paymentRequestsService: PaymentRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment request' })
  @ApiResponse({ status: 201, description: 'Payment request created successfully' })
  async createPaymentRequest(@Body() data: CreatePaymentRequestDto) {
    return this.paymentRequestsService.createPaymentRequest(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment requests with filtering' })
  @ApiResponse({ status: 200, description: 'Payment requests retrieved successfully' })
  async findAllPaymentRequests(
    @Query() filters: PaymentRequestFiltersDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.type === UserType.COACH) {
      filters.payerID = user.id;
    }
    return this.paymentRequestsService.findAllPaymentRequests(filters);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired payment requests' })
  @ApiResponse({ status: 200, description: 'Expired payment requests retrieved successfully' })
  async getExpiredPaymentRequests() {
    return this.paymentRequestsService.getExpiredPaymentRequests();
  }

  @Get('payer/:payerID')
  @ApiOperation({ summary: 'Get payment requests for a specific payer' })
  @ApiResponse({ status: 200, description: 'Payer payment requests retrieved successfully' })
  async getPaymentRequestsByPayer(
    @Param('payerID') payerID: string,
    @Query('payerType') payerType: UserType,
    @Query('limit') limit: number = 50
  ) {
    return this.paymentRequestsService.getPaymentRequestsByPayer(payerID, payerType, limit);
  }

  @Get(':payerID/stats')
  @ApiOperation({ summary: 'Get payment request stats by Payer ID' })
  @ApiResponse({ status: 200, description: 'Payment request stats retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment request not found' })
  async getStats(@Param('payerID') payerID: string) {
    return this.paymentRequestsService.getStats(payerID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment request by ID' })
  @ApiResponse({ status: 200, description: 'Payment request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment request not found' })
  async findPaymentRequestByID(@Param('id') id: string) {
    return this.paymentRequestsService.findPaymentRequestByID(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment request' })
  @ApiResponse({ status: 200, description: 'Payment request updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment request not found' })
  async updatePaymentRequest(@Param('id') id: string, @Body() data: UpdatePaymentRequestDto) {
    return this.paymentRequestsService.updatePaymentRequest(id, data);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a payment request' })
  @ApiResponse({ status: 200, description: 'Payment request canceled successfully' })
  async cancelPaymentRequest(@Param('id') id: string) {
    return this.paymentRequestsService.cancelPaymentRequest(id);
  }

  @Put(':id/mark-paid')
  @ApiOperation({ summary: 'Mark payment request as paid' })
  @ApiResponse({ status: 200, description: 'Payment request marked as paid successfully' })
  async markPaymentRequestPaid(
    @Param('id') id: string,
    @Body() data: { transactionID: string; paidAmount?: number }
  ) {
    return this.paymentRequestsService.markPaymentRequestPaid(id, data.paidAmount);
  }

  @Post('process-expired')
  @ApiOperation({ summary: 'Process expired payment requests' })
  @ApiResponse({ status: 200, description: 'Expired payment requests processed successfully' })
  async processExpiredPaymentRequests() {
    return this.paymentRequestsService.processExpiredPaymentRequests();
  }
}
