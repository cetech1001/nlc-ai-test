import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Billing')
@Controller('billing')
@ApiBearerAuth()
export class BillingGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyToBilling(@Req() req: Request) {
    // Extract the path after /api/billing
    const path = req.path.replace(/^\/billing/, '');
    // const fullPath = `/api/billing${path}`;

    const response = await this.proxyService.proxyRequest(
      'billing',
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
    };
  }
}
