import {Controller, Get, Post, Put, Body, Param, Query, ForbiddenException} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import {CreateSubscriptionDto, SubscriptionFiltersDto, UpdateSubscriptionDto} from "./dto";
import {type AuthUser, UserType} from "@nlc-ai/api-types";
import {CurrentUser, UserTypes} from "@nlc-ai/api-auth";

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @UserTypes(UserType.admin, UserType.coach, UserType.client)
  @ApiOperation({ summary: 'Get current active subscription for a user' })
  @ApiResponse({ status: 200, description: 'Current subscription retrieved successfully' })
  getCurrentSubscription(
    @Query('subscriberID') subscriberID: string,
    @Query('subscriberType') subscriberType: string,
    @CurrentUser() user: AuthUser
  ) {
    // Users can only view their own subscriptions, admins can view any
    if (user.type !== UserType.admin && user.id !== subscriberID) {
      throw new ForbiddenException('Access denied');
    }
    return this.subscriptionsService.getCurrentSubscription(subscriberID, subscriberType);
  }

  @Get('history')
  @UserTypes(UserType.admin, UserType.coach, UserType.client)
  @ApiOperation({ summary: 'Get subscription history for a user' })
  @ApiResponse({ status: 200, description: 'Subscription history retrieved successfully' })
  getSubscriptionHistory(
    @Query('subscriberID') subscriberID: string,
    @Query('subscriberType') subscriberType: string,
    @CurrentUser() user: AuthUser
  ) {
    if (user.type !== UserType.admin && user.id !== subscriberID) {
      throw new ForbiddenException('Access denied');
    }
    return this.subscriptionsService.getSubscriptionHistory(subscriberID, subscriberType);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data or coach already has active subscription' })
  @ApiResponse({ status: 404, description: 'Coach or plan not found' })
  async createSubscription(@Body() data: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription with filtering' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async findAllSubscriptions(@Query() filters: SubscriptionFiltersDto) {
    return this.subscriptionsService.findAllSubscriptions(filters);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring subscription' })
  @ApiResponse({ status: 200, description: 'Expiring subscription retrieved successfully' })
  async getExpiringSubscriptions(@Query('daysAhead') daysAhead: number = 7) {
    return this.subscriptionsService.getExpiringSubscriptions(daysAhead);
  }

  @Get('coach/:coachID/active')
  @ApiOperation({ summary: 'Get active subscription for a coach' })
  @ApiResponse({ status: 200, description: 'Active subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  async findCoachActiveSubscription(@Param('coachID') coachID: string) {
    return this.subscriptionsService.findActiveSubscription(coachID, UserType.coach);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findSubscriptionByID(@Param('id') id: string) {
    return this.subscriptionsService.findSubscriptionByID(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(@Param('id') id: string, @Body() data: UpdateSubscriptionDto) {
    return this.subscriptionsService.updateSubscription(id, data);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  @ApiResponse({ status: 400, description: 'Subscription is already canceled' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancelSubscription(
    @Param('id') id: string,
    @Body() data: { reason?: string; immediateCancel?: boolean }
  ) {
    return this.subscriptionsService.cancelSubscription(id, data.reason, data.immediateCancel);
  }

  @Put(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription reactivated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reactivate subscription in current state' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async reactivateSubscription(@Param('id') id: string) {
    return this.subscriptionsService.reactivateSubscription(id);
  }

  @Put(':id/renew')
  @ApiOperation({ summary: 'Renew a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription renewed successfully' })
  @ApiResponse({ status: 400, description: 'Only active subscription can be renewed' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async renewSubscription(@Param('id') id: string) {
    return this.subscriptionsService.renewSubscription(id);
  }
}
