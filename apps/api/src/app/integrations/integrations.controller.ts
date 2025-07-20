import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserType } from "@nlc-ai/types";

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.coach)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations for the authenticated coach' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  getIntegrations(@Request() req: { user: { id: string } }) {
    return this.integrationsService.getIntegrations(req.user.id);
  }

  @Post('connect/:platform')
  @ApiOperation({ summary: 'Connect a platform' })
  @ApiResponse({ status: 201, description: 'Platform connected successfully' })
  connectPlatform(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string,
    @Body() body: {
      accessToken: string;
      refreshToken?: string;
      profileData?: any;
      tokenExpiresAt?: string;
    }
  ) {
    return this.integrationsService.connectPlatform(
      req.user.id,
      platform,
      body
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration settings' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  updateIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string,
    @Body() body: {
      isActive?: boolean;
      syncSettings?: any;
    }
  ) {
    return this.integrationsService.updateIntegration(
      req.user.id,
      integrationID,
      body
    );
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  testIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    console.log("User: ", req.user);
    console.log("Integration ID: ", integrationID);
    return this.integrationsService.testIntegration(req.user.id, integrationID);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect integration' })
  @ApiResponse({ status: 200, description: 'Integration disconnected successfully' })
  disconnectIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    console.log("User: ", req.user);
    console.log("Integration ID: ", integrationID);
    return this.integrationsService.disconnectIntegration(req.user.id, integrationID);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Manually sync data from platform' })
  @ApiResponse({ status: 200, description: 'Sync initiated successfully' })
  syncPlatformData(
    @Request() req: { user: { id: string } },
    @Param('id') integrationID: string
  ) {
    return this.integrationsService.syncPlatformData(req.user.id, integrationID);
  }

  @Get('auth/:platform/url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for a platform' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  getAuthUrl(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string
  ) {
    return this.integrationsService.getAuthUrl(req.user.id, platform);
  }

  @Post('auth/:platform/callback')
  @ApiOperation({ summary: 'Handle OAuth callback from platform' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed successfully' })
  handleOAuthCallback(
    @Request() req: { user: { id: string } },
    @Param('platform') platform: string,
    @Body() body: { code: string; state?: string }
  ) {
    return this.integrationsService.handleOAuthCallback(
      req.user.id,
      platform,
      body.code,
      body.state
    );
  }
}
