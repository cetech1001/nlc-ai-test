import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Email')
@Controller('email')
@ApiBearerAuth()
export class EmailGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'email',
      '/api/email/send',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get email templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'email',
      '/api/email/templates',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'email',
      '/api/email/templates',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('sequences')
  @ApiOperation({ summary: 'Get email sequences' })
  @ApiResponse({ status: 200, description: 'Sequences retrieved successfully' })
  async getSequences(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'email',
      '/api/email/sequences',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('sequences')
  @ApiOperation({ summary: 'Create email sequence' })
  @ApiResponse({ status: 201, description: 'Sequence created successfully' })
  async createSequence(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'email',
      '/api/email/sequences',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get email analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'email',
      '/api/email/analytics',
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
