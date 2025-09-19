import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaywallService } from './paywall.service';
import { UpdatePaywallSettingsDto, CreatePaymentLinkDto } from './dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/types';

@ApiTags('Course Paywall')
@ApiBearerAuth()
@Controller(':courseID/paywall')
export class PaywallController {
  constructor(private readonly paywallService: PaywallService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get paywall settings' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async getPaywallSettings(@Param('courseID', ParseUUIDPipe) courseID: string) {
    return this.paywallService.getPaywallSettings(courseID);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update paywall settings' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async updatePaywallSettings(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Body() updateDto: UpdatePaywallSettingsDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.paywallService.updatePaywallSettings(courseID, updateDto, user.id);
  }

  @Post('payment-link')
  @ApiOperation({ summary: 'Create payment link for course' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async createPaymentLink(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Body() createDto: CreatePaymentLinkDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.paywallService.createPaymentLink(courseID, createDto, user.id);
  }

  @Get('access/:userID')
  @ApiOperation({ summary: 'Check user access to course content' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  @ApiParam({ name: 'userID', description: 'User ID' })
  async checkAccess(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @Param('userID', ParseUUIDPipe) userID: string
  ) {
    return this.paywallService.checkCourseAccess(courseID, userID);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get paywall analytics' })
  @ApiParam({ name: 'courseID', description: 'Course ID' })
  async getAnalytics(
    @Param('courseID', ParseUUIDPipe) courseID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.paywallService.getPaywallAnalytics(courseID, user.id);
  }
}
