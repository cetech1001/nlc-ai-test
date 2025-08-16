import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { CacheService } from '../../cache/cache.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly cacheService: CacheService,
  ) {}

  // ========== COACHES ==========
  @Get('coaches')
  @ApiOperation({ summary: 'Get all coaches' })
  @ApiResponse({ status: 200, description: 'Coaches retrieved successfully' })
  async getCoaches(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const cacheKey = `coaches:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/coaches',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    if (response.status === 200) {
      await this.cacheService.set(cacheKey, response.data, 120); // 2 minutes
    }

    return res.status(response.status).json(response.data);
  }

  @Get('coaches/stats')
  @ApiOperation({ summary: 'Get coach statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getCoachStats(@Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/coaches/stats',
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('coaches/:id')
  @ApiOperation({ summary: 'Get coach by ID' })
  @ApiResponse({ status: 200, description: 'Coach retrieved successfully' })
  async getCoach(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/coaches/${id}`,
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('coaches/:id/kpis')
  @ApiOperation({ summary: 'Get coach KPIs' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getCoachKpis(@Param('id') id: string, @Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/coaches/${id}/kpis`,
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('coaches')
  @ApiOperation({ summary: 'Create a new coach' })
  @ApiResponse({ status: 201, description: 'Coach created successfully' })
  async createCoach(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/coaches',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Patch('coaches/:id')
  @ApiOperation({ summary: 'Update a coach' })
  @ApiResponse({ status: 200, description: 'Coach updated successfully' })
  async updateCoach(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/coaches/${id}`,
      {
        method: 'PATCH',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Patch('coaches/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle coach status' })
  @ApiResponse({ status: 200, description: 'Coach status toggled successfully' })
  async toggleCoachStatus(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/coaches/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Delete('coaches/:id')
  @ApiOperation({ summary: 'Delete a coach' })
  @ApiResponse({ status: 200, description: 'Coach deleted successfully' })
  async deleteCoach(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/coaches/${id}`,
      {
        method: 'DELETE',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== CLIENTS ==========
  @Get('clients')
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  async getClients(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/clients',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('clients/stats')
  @ApiOperation({ summary: 'Get client statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getClientStats(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/clients/stats',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  async getClient(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/clients/${id}`,
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('clients')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  async createClient(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/clients',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Patch('clients/:id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  async updateClient(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/clients/${id}`,
      {
        method: 'PATCH',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Delete('clients/:id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  async deleteClient(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      `/api/users/clients/${id}`,
      {
        method: 'DELETE',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== RELATIONSHIPS ==========
  @Get('relationships')
  @ApiOperation({ summary: 'Get client-coach relationships' })
  @ApiResponse({ status: 200, description: 'Relationships retrieved successfully' })
  async getRelationships(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/relationships',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('relationships')
  @ApiOperation({ summary: 'Create a new relationship' })
  @ApiResponse({ status: 201, description: 'Relationship created successfully' })
  async createRelationship(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/relationships',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== INVITES ==========
  @Get('invites')
  @ApiOperation({ summary: 'Get client invitations' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  async getInvites(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/invites',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('invites')
  @ApiOperation({ summary: 'Create a new invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  async createInvite(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/invites',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== ANALYTICS ==========
  @Get('analytics/platform')
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getPlatformAnalytics(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/analytics/platform',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('analytics/coaches/overview')
  @ApiOperation({ summary: 'Get coaches overview analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getCoachesOverview(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'users',
      '/api/users/analytics/coaches/overview',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  private extractHeaders(req: Request): Record<string, string> {
    return {
      'authorization': req.headers.authorization || '',
      'content-type': req.headers['content-type'] || 'application/json',
      'user-agent': req.headers['user-agent'] || '',
      'x-forwarded-for': req.headers['x-forwarded-for'] as string || req.ip || '',
      'x-real-ip': req.ip || '',
    };
  }
}
