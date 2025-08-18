import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Integrations')
@Controller('integrations')
@ApiBearerAuth()
export class NotificationsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyToNotifications(@Req() req: Request, @Res() res: Response) {
    // Extract the path after /api/integrations
    const path = req.path.replace(/^\/integrations/, '');

    const response = await this.proxyService.proxyRequest(
      'integrations',
      path,
      {
        method: req.method as any,
        data: req.body,
        params: req.query,
        headers: this.extractHeaders(req),
      }
    );

    res.status(response.status)

return response.data;
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
