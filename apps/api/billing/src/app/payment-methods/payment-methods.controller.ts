import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {PaymentMethodsService} from './payment-methods.service';
import {CreatePaymentMethodDto, PaymentMethodFiltersDto, UpdatePaymentMethodDto} from "./dto";
import {CurrentUser} from "@nlc-ai/api-auth";
import {type AuthUser, UserType} from "@nlc-ai/api-types";

@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data or expired card' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  async createPaymentMethod(@Body() data: CreatePaymentMethodDto) {
    return this.paymentMethodsService.createPaymentMethod(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment methods with filtering' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async findAllPaymentMethods(
    @Query() filters: PaymentMethodFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type !== UserType.admin) {
      filters.userID = user.id;
    }
    return this.paymentMethodsService.findAllPaymentMethods(filters);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring payment methods' })
  @ApiResponse({ status: 200, description: 'Expiring payment methods retrieved successfully' })
  async getExpiringPaymentMethods(@Query('monthsAhead') monthsAhead: number = 2) {
    return this.paymentMethodsService.getExpiringPaymentMethods(monthsAhead);
  }

  @Get('/default/:userID')
  @ApiOperation({ summary: 'Get default payment method for a user' })
  @ApiResponse({ status: 200, description: 'Default payment method retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No payment method found' })
  async getCoachDefaultPaymentMethod(@Param('userID') userID: string, @CurrentUser() user: AuthUser) {
    return this.paymentMethodsService.getDefaultPaymentMethod(userID, user.type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiResponse({ status: 200, description: 'Payment method retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findPaymentMethodByID(@Param('id') id: string) {
    return this.paymentMethodsService.findPaymentMethodByID(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data or expired card' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async updatePaymentMethod(@Param('id') id: string, @Body() data: UpdatePaymentMethodDto) {
    return this.paymentMethodsService.updatePaymentMethod(id, data);
  }

  @Put(':id/set-default')
  @ApiOperation({ summary: 'Set payment method as default' })
  @ApiResponse({ status: 200, description: 'Payment method set as default successfully' })
  @ApiResponse({ status: 400, description: 'Cannot set inactive payment method as default' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async setDefaultPaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.setDefaultPaymentMethod(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async deactivatePaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.deactivatePaymentMethod(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete payment method with pending transactions' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async deletePaymentMethod(@Param('id') id: string) {
    await this.paymentMethodsService.deletePaymentMethod(id);
    return { message: 'Payment method deleted successfully' };
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate a payment method' })
  @ApiResponse({ status: 200, description: 'Payment method validation completed' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async validatePaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.validatePaymentMethod(id);
  }

  @Post('bulk-validate')
  @ApiOperation({ summary: 'Bulk validate payment methods' })
  @ApiResponse({ status: 200, description: 'Bulk validation completed' })
  async bulkValidatePaymentMethods(@Body() data: { coachID?: string }) {
    return this.paymentMethodsService.bulkValidatePaymentMethods(data.coachID);
  }
}
