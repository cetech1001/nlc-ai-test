import {Controller, Get, Post, Put, Body, Param, Query, Res} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiQuery} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import {CreateTransactionDto, RefundDto, TransactionFiltersDto, UpdateTransactionDto} from "./dto";
import type {Response} from "express";

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
  async findAllTransactions(@Query() filters: TransactionFiltersDto) {
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

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransactionByID(@Param('id') id: string) {
    return this.transactionsService.findTransactionByID(id);
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

  @Get('export/bulk')
  @ApiOperation({ summary: 'Bulk export transactions' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Bulk transaction data exported successfully' })
  async bulkExportTransactions(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.createdAt.lte = end;
      }
    }

    const transactionsData = await this.transactionsService.bulkExportTransactions(filters);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-export-${new Date().toISOString().split('T')[0]}.json"`);

    return res.json({
      exportDate: new Date().toISOString(),
      totalTransactions: transactionsData.length,
      filters: filters,
      transactions: transactionsData,
    });
  }
}
