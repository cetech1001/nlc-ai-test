import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Leads')
@Controller('leads')
@ApiBearerAuth()
export class LeadsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyRoot(@Req() req: Request) {
    return this.forwardToLeads(req);
  }

  @All('*')
  async proxyWildcard(@Req() req: Request) {
    return this.forwardToLeads(req);
  }

  private async forwardToLeads(req: Request) {
    const path = req.path.replace(/^\/leads/, '');

    const response = await this.proxyService.proxyRequest(
      'leads',
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
      'x-anti-spam-token': req.headers['x-anti-spam-token'] as string || '',
      'x-anti-spam-signature': req.headers['x-anti-spam-signature'] as string || '',
      'x-anti-spam-timestamp': req.headers['x-anti-spam-timestamp'] as string || '',
    };
  }
}
