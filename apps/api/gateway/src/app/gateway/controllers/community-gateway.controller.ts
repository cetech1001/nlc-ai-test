import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Community')
@Controller('community')
export class CommunityGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyToCommunity(@Req() req: Request) {
    // Extract the path after /api/community
    const path = req.path.replace(/^\/community/, '');

    const response = await this.proxyService.proxyRequest(
      'community',
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
