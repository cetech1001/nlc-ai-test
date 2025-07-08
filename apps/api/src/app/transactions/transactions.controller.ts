// apps/api/src/app/transactions/transactions.controller.ts (Enhanced)

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { Response } from 'express';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String, description: 'Comma-separated payment methods' })
  @ApiQuery({ name: 'minAmount', required: false, type: String })
  @ApiQuery({ name: 'maxAmount', required: false, type: String })
  @ApiQuery({ name: 'planNames', required: false, type: String, description: 'Comma-separated plan names' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('planNames') planNames?: string,
  ) {
    return this.transactionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      search,
      startDate,
      endDate,
      paymentMethod,
      minAmount,
      maxAmount,
      planNames
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.transactionsService.getTransactionStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue data by period' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false })
  @ApiResponse({ status: 200, description: 'Revenue data retrieved successfully' })
  getRevenue(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.transactionsService.getRevenueByPeriod(period);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export transaction data' })
  @ApiResponse({ status: 200, description: 'Transaction data exported successfully' })
  async exportTransaction(@Param('id') id: string, @Res() res: Response) {
    const transactionData = await this.transactionsService.getTransactionExport(id);

    // Set headers for JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="transaction-${id}.json"`);

    return res.json(transactionData);
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

    // Set headers for CSV download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-export-${new Date().toISOString().split('T')[0]}.json"`);

    return res.json({
      exportDate: new Date().toISOString(),
      totalTransactions: transactionsData.length,
      filters: filters,
      transactions: transactionsData,
    });
  }

  @Get('analytics/top-coaches')
  @ApiOperation({ summary: 'Get top paying coaches' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top paying coaches retrieved successfully' })
  getTopPayingCoaches(@Query('limit') limit?: string) {
    return this.transactionsService.getTopPayingCoaches(limit ? parseInt(limit) : 10);
  }

  @Get('analytics/monthly-comparison')
  @ApiOperation({ summary: 'Get monthly revenue comparison' })
  @ApiResponse({ status: 200, description: 'Monthly revenue comparison retrieved successfully' })
  getMonthlyRevenueComparison() {
    return this.transactionsService.getMonthlyRevenueComparison();
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get transactions by status' })
  @ApiResponse({ status: 200, description: 'Transactions by status retrieved successfully' })
  getTransactionsByStatus(@Param('status') status: string) {
    return this.transactionsService.getTransactionsByStatus(status);
  }

  @Get('by-date-range')
  @ApiOperation({ summary: 'Get transactions by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Transactions by date range retrieved successfully' })
  getTransactionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.transactionsService.getTransactionsByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }
}
