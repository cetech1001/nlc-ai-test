import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyRoot(@Req() req: Request) {
    return this.forwardToCommunities(req);
  }

  @All('*')
  async proxyToCommunities(@Req() req: Request) {
    return this.forwardToCommunities(req);
  }

  async forwardToCommunities(req: Request) {
    const path = req.path.replace(/^\/communities/, '');

    const response = await this.proxyService.proxyRequest(
      'communities',
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
      'origin': req.headers.origin || '',
    };
  }
}
