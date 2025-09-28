import {
  Controller,
  All,
  Req, Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { CacheService } from '../../cache/cache.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly cacheService: CacheService,
  ) {}

  @All('*')
  async proxyToAuth(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const path = req.path.replace(/^\/auth/, '');

    if (req.method === 'GET' && path === '/profile' && req.headers.authorization) {
      const cacheKey = `profile:${req.headers.authorization}`;
      const cachedProfile = await this.cacheService.get(cacheKey);

      if (cachedProfile) {
        return cachedProfile;
      }
    }

    const response = await this.proxyService.proxyRequest(
      'auth',
      path,
      {
        method: req.method as any,
        data: req.body,
        params: req.query,
        headers: this.extractHeaders(req),
      }
    );

    if (response.headers['set-cookie']) {
      res.set('Set-Cookie', response.headers['set-cookie']);
    }

    if (req.method === 'GET' && path === '/profile' && response.status === 200) {
      const cacheKey = `profile:${req.headers.authorization}`;
      await this.cacheService.set(cacheKey, response.data, 300);
    }

    if ((req.method === 'PATCH' || req.method === 'PUT') && path === '/profile') {
      const cacheKey = `profile:${req.headers.authorization}`;
      await this.cacheService.delete(cacheKey);
    }

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
