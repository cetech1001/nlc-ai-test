import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailTemplatesService } from '../services/email-templates.service';
import { JwtAuthGuard } from '@nlc-ai/api-auth';
import { UserTypes } from '@nlc-ai/api-auth';
import { UserTypesGuard } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';
import { CurrentUser } from '@nlc-ai/api-auth';

interface CreateTemplateRequest {
  name: string;
  category: string;
  subjectTemplate: string;
  bodyTemplate: string;
  description?: string;
  tags?: string[];
  isAiGenerated?: boolean;
  generationPrompt?: string;
}

interface UpdateTemplateRequest {
  name?: string;
  category?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
}

interface TemplateFilters {
  category?: string;
  search?: string;
  tags?: string[];
  isAiGenerated?: boolean;
  isActive?: boolean;
  sortBy?: 'name' | 'category' | 'usageCount' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@ApiTags('Email Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get email templates for coach' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(
    @CurrentUser('id') coachID: string,
    @Query() filters: TemplateFilters,
  ) {
    return this.emailTemplatesService.getTemplates(coachID, filters);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get template categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getTemplateCategories(@CurrentUser('id') coachID: string) {
    return this.emailTemplatesService.getTemplateCategories(coachID);
  }

  @Get(':templateID')
  @ApiOperation({ summary: 'Get specific email template' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplate(
    @CurrentUser('id') coachID: string,
    @Param('templateID') templateID: string,
  ) {
    return this.emailTemplatesService.getTemplate(coachID, templateID);
  }

  @Post()
  @ApiOperation({ summary: 'Create new email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @CurrentUser('id') coachID: string,
    @Body() createRequest: CreateTemplateRequest,
  ) {
    return this.emailTemplatesService.createTemplate(coachID, createRequest);
  }

  @Put(':templateID')
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @CurrentUser('id') coachID: string,
    @Param('templateID') templateID: string,
    @Body() updateRequest: UpdateTemplateRequest,
  ) {
    return this.emailTemplatesService.updateTemplate(coachID, templateID, updateRequest);
  }

  @Delete(':templateID')
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  async deleteTemplate(
    @CurrentUser('id') coachID: string,
    @Param('templateID') templateID: string,
  ) {
    return this.emailTemplatesService.deleteTemplate(coachID, templateID);
  }

  @Post(':templateID/duplicate')
  @ApiOperation({ summary: 'Duplicate email template' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  async duplicateTemplate(
    @CurrentUser('id') coachID: string,
    @Param('templateID') templateID: string,
    @Body() options: { name?: string; category?: string },
  ) {
    return this.emailTemplatesService.duplicateTemplate(coachID, templateID, options);
  }

  @Post(':templateID/preview')
  @ApiOperation({ summary: 'Preview email template with sample data' })
  @ApiResponse({ status: 200, description: 'Template preview generated successfully' })
  async previewTemplate(
    @CurrentUser('id') coachID: string,
    @Param('templateID') templateID: string,
    @Body() previewData: Record<string, any>,
  ) {
    return this.emailTemplatesService.previewTemplate(coachID, templateID, previewData);
  }

  @Get(':templateID/usage-stats')
  @ApiOperation({ summary: 'Get template usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage stats retrieved successfully' })
  async getTemplateUsageStats(
    @CurrentUser('id') coachID: string,
    @Param('templateID') templateID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    return this.emailTemplatesService.getTemplateUsageStats(coachID, templateID, daysParsed);
  }
}
