import {
  Controller,
  All,
  Req, UseInterceptors, UploadedFile, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { CacheService } from '../../cache/cache.service';
import {FileInterceptor} from "@nestjs/platform-express";

@ApiTags('Agents')
@Controller('agents')
@ApiBearerAuth()
export class AgentsGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly cacheService: CacheService,
  ) {}

  @All('replica/files/upload')
  @UseInterceptors(FileInterceptor('file'))
  async proxyFileUpload(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any
  ) {
    const path = req.path.replace(/^\/agents/, '');

    const FormData = require('form-data');
    const formData = new FormData();

    if (file) {
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }

    if (body) {
      Object.keys(body).forEach(key => {
        if (body[key] !== undefined && body[key] !== null) {
          formData.append(key, body[key]);
        }
      });
    }

    const headers = this.extractHeaders(req);
    delete headers['content-type'];

    try {
      const response = await this.proxyService.proxyFormDataRequest(
        'agents',
        path,
        {
          method: req.method as any,
          data: formData,
          params: req.query,
          headers: {
            ...headers,
            ...formData.getHeaders(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('File upload proxy error:', error);
      throw error;
    }
  }

  @All('*')
  async proxyToAgents(@Req() req: Request) {
    const path = req.path.replace(/^\/agents/, '');

    if (req.method === 'GET' && path.startsWith('/agents') && !path.includes('/stats') && !path.includes('/kpis')) {
      const cacheKey = `agents:${JSON.stringify(req.query)}`;
      const cached = await this.cacheService.get(cacheKey);

      if (cached) {
        return cached;
      }
    }

    const response = await this.proxyService.proxyRequest(
      'agents',
      path,
      {
        method: req.method as any,
        data: req.body,
        params: req.query,
        headers: this.extractHeaders(req),
      }
    );

    if (req.method === 'GET' && path.startsWith('/agents') && !path.includes('/stats') && !path.includes('/kpis') && response.status === 200) {
      const cacheKey = `agents:${JSON.stringify(req.query)}`;
      await this.cacheService.set(cacheKey, response.data, 120); // 2 minutes
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
