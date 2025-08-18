import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
export class MediaGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxyToMedia(@Req() req: Request, @Res() res: Response) {
    // Extract the path after /api/media
    const path = req.path.replace(/^\/media/, '');

    // Handle multipart/form-data for file uploads
    let requestData = req.body;
    let headers = this.extractHeaders(req);

    // For file uploads, we need to handle multipart data specially
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // The body should already contain the parsed multipart data
      // including files from multer middleware in the actual service
      headers['content-type'] = req.headers['content-type'];
    }

    const response = await this.proxyService.proxyRequest(
      'media',
      path,
      {
        method: req.method as any,
        data: requestData,
        params: req.query,
        headers: headers,
      }
    );

    res.status(response.status)

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
