import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser, type OnboardingData } from '@nlc-ai/types';
import { OnboardingService } from './onboarding.service';
import { ReplicaService } from '../replica/replica.service';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly replicaService: ReplicaService,
  ) {}

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding and train AI assistant' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  async completeOnboarding(
    @CurrentUser() user: AuthUser,
    @Body() data: OnboardingData
  ) {
    // Save all onboarding data
    await this.onboardingService.saveOnboardingData(user.id, data);

    // Build comprehensive AI instructions from onboarding data
    const instructions = await this.onboardingService.buildAIInstructions(user.id);

    // Initialize or update the AI assistant with personalized instructions
    const aiConfig = await this.replicaService.initializeCoachAI(
      user.id,
      `${user.name.split(' ')[0]}'s AI Assistant`
    );

    // Update assistant with personalized instructions
    await this.replicaService.updateAssistantInstructions(
      user.id,
      instructions
    );

    // Mark onboarding as complete
    await this.onboardingService.markOnboardingComplete(user.id);

    return {
      message: 'Onboarding completed and AI trained successfully',
      assistantID: aiConfig.assistantID,
      vectorStoreID: aiConfig.vectorStoreID,
    };
  }

  @Post('save-progress')
  @ApiOperation({ summary: 'Save onboarding progress without completing' })
  @ApiResponse({ status: 200, description: 'Progress saved successfully' })
  async saveProgress(
    @CurrentUser() user: AuthUser,
    @Body() data: Partial<OnboardingData>
  ) {
    // Save progress WITHOUT marking as complete
    if (data.scenarios && data.scenarios.length > 0) {
      const fullData: OnboardingData = {
        scenarios: data.scenarios,
        documents: data.documents || [],
        connections: data.connections || [],
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

  @Post('regenerate-instructions')
  @ApiOperation({ summary: 'Regenerate AI instructions from onboarding data' })
  @ApiResponse({ status: 200, description: 'Instructions regenerated successfully' })
  async regenerateInstructions(@CurrentUser() user: AuthUser) {
    const instructions = await this.onboardingService.buildAIInstructions(user.id);

    await this.replicaService.updateAssistantInstructions(
      user.id,
      instructions
    );

    return {
      message: 'AI instructions regenerated successfully',
    };
  }
}
