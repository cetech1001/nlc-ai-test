import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { Public } from '@nlc-ai/api-auth';

@ApiTags('Leads')
@Controller('leads')
export class LeadsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('submit')
  @Public()
  @ApiOperation({ summary: 'Submit lead from landing page' })
  @ApiResponse({ status: 201, description: 'Lead submitted successfully' })
  async submitLead(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'leads',
      '/api/leads/submit',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get leads' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  async getLeads(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'leads',
      '/api/leads',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getLeadStats(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'leads',
      '/api/leads/stats',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  async getLead(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'leads',
      `/api/leads/${id}`,
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  async updateLead(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'leads',
      `/api/leads/${id}`,
      {
        method: 'PATCH',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post(':id/convert')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Convert lead to client' })
  @ApiResponse({ status: 200, description: 'Lead converted successfully' })
  async convertLead(@Param('id') id: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'leads',
      `/api/leads/${id}/convert`,
      {
        method: 'POST',
        data: body,
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
