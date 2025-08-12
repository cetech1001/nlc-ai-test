import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService, CreateTransactionDto, UpdateTransactionDto, TransactionFilters, RefundDto } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach, plan, or subscription not found' })
  async createTransaction(@Body() data: CreateTransactionDto) {
    return this.transactionsService.createTransaction(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filtering' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async findAllTransactions(@Query() filters: TransactionFilters) {
    return this.transactionsService.findAllTransactions(filters);
  }

  @Get('failed')
  @ApiOperation({ summary: 'Get failed transactions' })
  @ApiResponse({ status: 200, description: 'Failed transactions retrieved successfully' })
  async getFailedTransactions(@Query('limit') limit: number = 100) {
    return this.transactionsService.getFailedTransactions(limit);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending transactions older than specified minutes' })
  @ApiResponse({ status: 200, description: 'Pending transactions retrieved successfully' })
  async getPendingTransactions(@Query('olderThanMinutes') olderThanMinutes: number = 60) {
    return this.transactionsService.getPendingTransactions(olderThanMinutes);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Transaction statistics retrieved successfully' })
  async getTransactionStats(@Query() filters: { coachID?: string; dateRange?: { start: Date; end: Date } }) {
    return this.transactionsService.getTransactionStats(filters);
  }

  @Get('revenue-report')
  @ApiOperation({ summary: 'Get revenue report with grouping' })
  @ApiResponse({ status: 200, description: 'Revenue report retrieved successfully' })
  async getRevenueReport(@Query() filters: {
    coachID?: string;
    dateRange: { start: Date; end: Date };
    groupBy: 'day' | 'week' | 'month' | 'year';
  }) {
    return this.transactionsService.getRevenueReport(filters);
  }

  @Get('coach/:coachId')
  @ApiOperation({ summary: 'Get transactions for a specific coach' })
  @ApiResponse({ status: 200, description: 'Coach transactions retrieved successfully' })
  async getTransactionsByCoach(@Param('coachId') coachId: string, @Query('limit') limit: number = 50) {
    return this.transactionsService.getTransactionsByCoach(coachId, limit);
  }

  @Get('invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Get transaction by invoice number' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransactionByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.transactionsService.findTransactionByInvoiceNumber(invoiceNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransactionById(@Param('id') id: string) {
    return this.transactionsService.findTransactionById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(@Param('id') id: string, @Body() data: UpdateTransactionDto) {
    return this.transactionsService.updateTransaction(id, data);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark transaction as completed' })
  @ApiResponse({ status: 200, description: 'Transaction marked as completed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async markTransactionCompleted(@Param('id') id: string, @Body() data: { paidAt?: Date }) {
    return this.transactionsService.markTransactionCompleted(id, data.paidAt);
  }

  @Put(':id/fail')
  @ApiOperation({ summary: 'Mark transaction as failed' })
  @ApiResponse({ status: 200, description: 'Transaction marked as failed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async markTransactionFailed(@Param('id') id: string, @Body() data: { failureReason: string }) {
    return this.transactionsService.markTransactionFailed(id, data.failureReason);
  }

  @Put(':id/refund')
  @ApiOperation({ summary: 'Process refund for a transaction' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot refund transaction or invalid refund amount' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async processRefund(@Param('id') id: string, @Body() refundData: RefundDto) {
    return this.transactionsService.processRefund(id, refundData);
  }
}
