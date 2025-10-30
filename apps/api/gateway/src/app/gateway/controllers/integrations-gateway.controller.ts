import {
  Controller,
  All,
  Req,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { Public } from '@nlc-ai/api-auth';

@ApiTags('Integrations')
@Controller('integrations')
@ApiBearerAuth()
export class IntegrationsGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('auth/:platform/callback')
  @Public()
  async handleOAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Param('platform') platform: string,
  ) {

    const path = `/api/integrations/auth/${platform}/callback`;

    try {
      const response = await this.proxyService.proxyRequest(
        'integrations',
        path,
        {
          method: 'GET',
          params: req.query,
          headers: this.extractHeaders(req),
        }
      );

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Security-Policy', response.headers['content-security-policy'] || '');
      res.setHeader('X-Content-Type-Options', response.headers['x-content-type-options'] || 'nosniff');
      res.setHeader('Referrer-Policy', response.headers['referrer-policy'] || 'no-referrer');
      res.setHeader('X-Frame-Options', response.headers['x-frame-options'] || 'DENY');

      res.send(response.data);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
          <h1>Authentication Error</h1>
          <p>Failed to complete authentication. Please close this window and try again.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `);
    }
  }

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
      'origin': req.headers.origin || '',
    };
  }
}
