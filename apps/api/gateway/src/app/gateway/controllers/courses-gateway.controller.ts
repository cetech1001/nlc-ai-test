import {
  Controller,
  All,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Course')
@Controller('courses')
@ApiBearerAuth()
export class CoursesGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyRoot(@Req() req: Request) {
    return this.forwardToCourses(req);
  }

  @All('*')
  async proxyToCourse(@Req() req: Request) {
    return this.forwardToCourses(req);
  }

  private async forwardToCourses(req: Request) {
    const path = req.path.replace(/^\/courses/, '');

    const response = await this.proxyService.proxyRequest(
      'courses',
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
