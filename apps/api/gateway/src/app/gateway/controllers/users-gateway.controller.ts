import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { CacheService } from '../../cache/cache.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly cacheService: CacheService,
  ) {}

  @All('*')
  async proxyToUsers(@Req() req: Request) {
    // Extract the path after /api/users
    const path = req.path.replace(/^\/users/, '');

    // Cache coaches list for 2 minutes
    if (req.method === 'GET' && path.startsWith('/coaches') && !path.includes('/stats') && !path.includes('/kpis')) {
      const cacheKey = `coaches:${JSON.stringify(req.query)}`;
      const cached = await this.cacheService.get(cacheKey);

      if (cached) {
        return cached;
      }
    }

    const response = await this.proxyService.proxyRequest(
      'users',
      path,
      {
        method: req.method as any,
        data: req.body,
        params: req.query,
        headers: this.extractHeaders(req),
      }
    );

    // Cache successful coaches responses
    if (req.method === 'GET' && path.startsWith('/coaches') && !path.includes('/stats') && !path.includes('/kpis') && response.status === 200) {
      const cacheKey = `coaches:${JSON.stringify(req.query)}`;
      await this.cacheService.set(cacheKey, response.data, 120); // 2 minutes
    }

    // res.status(response.status);
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
