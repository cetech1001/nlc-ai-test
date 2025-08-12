import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService, CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilters } from './invoices.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Coach, subscription, or transaction not found' })
  async createInvoice(@Body() data: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(data);
  }

  @Post('from-subscription/:subscriptionId')
  @ApiOperation({ summary: 'Create invoice from subscription billing cycle' })
  @ApiResponse({ status: 201, description: 'Invoice created from subscription successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async createInvoiceFromSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() data: { periodStart: Date; periodEnd: Date }
  ) {
    return this.invoicesService.createInvoiceFromSubscription(subscriptionId, data.periodStart, data.periodEnd);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with filtering' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async findAllInvoices(@Query() filters: InvoiceFilters) {
    return this.invoicesService.findAllInvoices(filters);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue invoices' })
  @ApiResponse({ status: 200, description: 'Overdue invoices retrieved successfully' })
  async getOverdueInvoices(@Query('daysOverdue') daysOverdue: number = 0) {
    return this.invoicesService.getOverdueInvoices(daysOverdue);
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Get draft invoices' })
  @ApiResponse({ status: 200, description: 'Draft invoices retrieved successfully' })
  async getDraftInvoices(@Query('coachID') coachID?: string) {
    return this.invoicesService.getDraftInvoices(coachID);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiResponse({ status: 200, description: 'Invoice statistics retrieved successfully' })
  async getInvoiceStats(@Query() filters: { coachID?: string; dateRange?: { start: Date; end: Date } }) {
    return this.invoicesService.getInvoiceStats(filters);
  }

  @Get('coach/:coachId')
  @ApiOperation({ summary: 'Get invoices for a specific coach' })
  @ApiResponse({ status: 200, description: 'Coach invoices retrieved successfully' })
  async getInvoicesByCoach(@Param('coachId') coachId: string, @Query('limit') limit: number = 50) {
    return this.invoicesService.getInvoicesByCoach(coachId, limit);
  }

  @Get('number/:invoiceNumber')
  @ApiOperation({ summary: 'Get invoice by invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findInvoiceByNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoicesService.findInvoiceByNumber(invoiceNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findInvoiceById(@Param('id') id: string) {
    return this.invoicesService.findInvoiceById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data or paid invoices cannot be modified' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async updateInvoice(@Param('id') id: string, @Body() data: UpdateInvoiceDto) {
    return this.invoicesService.updateInvoice(id, data);
  }

  @Put(':id/send')
  @ApiOperation({ summary: 'Send an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice sent successfully' })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be sent' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async sendInvoice(@Param('id') id: string) {
    return this.invoicesService.sendInvoice(id);
  }

  @Put(':id/mark-paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid successfully' })
  @ApiResponse({ status: 400, description: 'Invoice is already paid or canceled' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async markInvoicePaid(@Param('id') id: string, @Body() data: { paidAt?: Date }) {
    return this.invoicesService.markInvoicePaid(id, data.paidAt);
  }

  @Put(':id/mark-overdue')
  @ApiOperation({ summary: 'Mark invoice as overdue' })
  @ApiResponse({ status: 200, description: 'Invoice marked as overdue successfully' })
  @ApiResponse({ status: 400, description: 'Invoice is paid or not yet past due' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async markInvoiceOverdue(@Param('id') id: string) {
    return this.invoicesService.markInvoiceOverdue(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice canceled successfully' })
  @ApiResponse({ status: 400, description: 'Paid invoices cannot be canceled' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async cancelInvoice(@Param('id') id: string) {
    return this.invoicesService.cancelInvoice(id);
  }

  @Put(':id/refund')
  @ApiOperation({ summary: 'Refund an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice refunded successfully' })
  @ApiResponse({ status: 400, description: 'Only paid invoices can be refunded' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async refundInvoice(@Param('id') id: string) {
    return this.invoicesService.refundInvoice(id);
  }

  @Post('process-overdue')
  @ApiOperation({ summary: 'Batch process overdue invoices' })
  @ApiResponse({ status: 200, description: 'Overdue invoices processed successfully' })
  async processOverdueInvoices() {
    return this.invoicesService.processOverdueInvoices();
  }
}
