import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser, Public } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';
import { ChatbotCustomizationService } from './chatbot-customization.service';

@ApiTags('Chatbot Customization')
@Controller('chatbot-customization')
export class ChatbotCustomizationController {
  constructor(
    private readonly customizationService: ChatbotCustomizationService
  ) {}

  @Get()
  @UseGuards(UserTypesGuard)
  @UserTypes(UserType.COACH)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chatbot customization for current coach' })
  @ApiResponse({ status: 200, description: 'Customization retrieved successfully' })
  async getCustomization(@CurrentUser() user: AuthUser) {
    return this.customizationService.getCustomization(user.id);
  }

  @Put()
  @UseGuards(UserTypesGuard)
  @UserTypes(UserType.COACH)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update chatbot customization' })
  @ApiResponse({ status: 200, description: 'Customization updated successfully' })
  async updateCustomization(
    @CurrentUser() user: AuthUser,
    @Body() data: any
  ) {
    return this.customizationService.updateCustomization(user.id, data);
  }

  @Public()
  @Get('public/:coachID')
  @ApiOperation({ summary: 'Get public chatbot customization' })
  @ApiResponse({ status: 200, description: 'Public customization retrieved' })
  async getPublicCustomization(@Param('coachID') coachID: string) {
    return this.customizationService.getPublicCustomization(coachID);
  }
}
