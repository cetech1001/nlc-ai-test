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
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      search,
      startDate,
      endDate
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

    // Set headers for CSV download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="transaction-${id}.json"`);

    return res.json(transactionData);
  }
}
