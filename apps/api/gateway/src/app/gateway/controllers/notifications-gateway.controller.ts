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

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('')
  @ApiOperation({ summary: 'Get notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'notifications',
      '/api/notifications',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('')
  @ApiOperation({ summary: 'Create notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async createNotification(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'notifications',
      '/api/notifications',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'notifications',
      `/api/notifications/${id}/read`,
      {
        method: 'PATCH',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getPreferences(@Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'notifications',
      '/api/notifications/preferences',
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'notifications',
      '/api/notifications/preferences',
      {
        method: 'PATCH',
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
