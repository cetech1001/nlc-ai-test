import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Integrations')
@Controller('integrations')
@ApiBearerAuth()
export class IntegrationsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyToIntegrations(@Req() req: Request) {
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

    return response.data;
  }

  private extractHeaders(req: Request): Record<string, string> {
    return {
      'authorization': req.headers.authorization || '',
      'content-type': req.headers['content-type'] || 'application/json',
      'user-agent': req.headers['user-agent'] || '',
      'x-forwarded-for': req.headers['x-forwarded-for'] as string || req.ip || '',
      'x-real-ip': req.ip || '',
'cookie': req.headers.cookie || '',
    };
  }
}
