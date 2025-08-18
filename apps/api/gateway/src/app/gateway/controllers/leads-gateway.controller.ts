import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Leads')
@Controller('leads')
export class LeadsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyToLeads(@Req() req: Request, @Res() res: Response) {
    // Extract the path after /api/leads
    const path = req.url.replace(/^\/leads/, '');

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
