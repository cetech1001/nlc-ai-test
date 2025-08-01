import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTypes } from '../auth/decorators/user-types.decorator';
import { UserTypesGuard } from '../auth/guards/user-types.guard';
import {TransactionsQueryParamsDto} from "./dto";
import {type AuthUser, TransactionStatus, UserType} from "@nlc-ai/types";
import {CurrentUser} from "../auth/decorators/current-user.decorator";

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.admin)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UserTypes(UserType.admin, UserType.coach)
  @Get()
  @ApiOperation({ summary: 'Get all transactions with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  findAll(@Query() query: TransactionsQueryParamsDto, @CurrentUser() user: AuthUser) {
    return this.transactionsService.findAll(query, user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.transactionsService.getTransactionStats();
  }

  @Get('revenue/stats')
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiResponse({ status: 200, description: 'Revenue statistics retrieved successfully' })
  getRevenueStats() {
    return this.transactionsService.getRevenueStats();
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

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Download invoice PDF for transaction' })
  @ApiResponse({ status: 200, description: 'Invoice PDF generated successfully' })
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.transactionsService.generateInvoicePDF(id);
    const transaction = await this.transactionsService.findOne(id);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${transaction.invoiceNumber || id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
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
  getTransactionsByStatus(@Param('status') status: TransactionStatus) {
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
