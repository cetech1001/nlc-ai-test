import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser, type OnboardingRequest } from '@nlc-ai/types';
import { OnboardingService } from './onboarding.service';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
  ) {}

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding and train AI assistant' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  async completeOnboarding(
    @CurrentUser() user: AuthUser,
    @Body() data: OnboardingRequest
  ) {
    await this.onboardingService.saveOnboardingData(user.id, data);
    await this.onboardingService.markOnboardingComplete(user.id);

    return { message: 'Onboarding completed and AI trained successfully' };
  }

  @Post('save-progress')
  @ApiOperation({ summary: 'Save onboarding progress without completing' })
  @ApiResponse({ status: 200, description: 'Progress saved successfully' })
  async saveProgress(
    @CurrentUser() user: AuthUser,
    @Body() data: Partial<OnboardingRequest>
  ) {
    if (data.scenarios && data.scenarios.length > 0) {
      const fullData: OnboardingRequest = {
        scenarios: data.scenarios,
        documents: data.documents || [],
      };
      await this.onboardingService.saveOnboardingData(user.id, fullData);
    }

    return {
      message: 'Progress saved successfully',
    };
  }

  @Get('data')
  @ApiOperation({ summary: 'Get onboarding data for prefilling' })
  @ApiResponse({ status: 200, description: 'Onboarding data retrieved' })
  async getOnboardingData(@CurrentUser() user: AuthUser) {
    return this.onboardingService.getOnboardingData(user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get onboarding status' })
  @ApiResponse({ status: 200, description: 'Onboarding status retrieved' })
  async getStatus(@CurrentUser() user: AuthUser) {
    return this.onboardingService.getOnboardingStatus(user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get generated coaching profile' })
  @ApiResponse({ status: 200, description: 'Coaching profile retrieved' })
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.onboardingService.generateCoachingProfile(user.id);
  }
}
