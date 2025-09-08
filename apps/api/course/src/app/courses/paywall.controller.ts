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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaywallService } from './paywall.service';
import { UpdatePaywallSettingsDto, CreatePaymentLinkDto } from './dto/paywall.dto';
import { CurrentUser } from '@nlc-ai/api-auth';
import { type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Course Paywall')
@ApiBearerAuth()
@Controller('courses/:courseId/paywall')
export class PaywallController {
  constructor(private readonly paywallService: PaywallService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get paywall settings' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async getPaywallSettings(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.paywallService.getPaywallSettings(courseId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update paywall settings' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async updatePaywallSettings(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() updateDto: UpdatePaywallSettingsDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.paywallService.updatePaywallSettings(courseId, updateDto, user.id);
  }

  @Post('payment-link')
  @ApiOperation({ summary: 'Create payment link for course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async createPaymentLink(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createDto: CreatePaymentLinkDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.paywallService.createPaymentLink(courseId, createDto, user.id);
  }

  @Get('access/:userId')
  @ApiOperation({ summary: 'Check user access to course content' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async checkAccess(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return this.paywallService.checkCourseAccess(courseId, userId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get paywall analytics' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async getAnalytics(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.paywallService.getPaywallAnalytics(courseId, user.id);
  }
}
