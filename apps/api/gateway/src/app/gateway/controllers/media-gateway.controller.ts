import {
  Controller,
  All,
  Req,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
export class MediaGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('upload/multipart/*')
  async proxyMultiPartRequests(@Req() req: Request) {
    const path = req.path.replace(/^\/media/, '');
    const headers = this.extractHeaders(req);

    const response = await this.proxyService.proxyRequest(
      'media',
      path,
      {
        method: req.method as any,
        data: req.body,
        params: req.query,
        headers: headers,
      }
    );

    return response.data;
  }

  @All('upload/*')
  @UseInterceptors(FileInterceptor('file'))
  async proxyFileUpload(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any
  ) {
    if (req.path.includes('/upload/multipart')) {
      return;
    }

    const path = req.path.replace(/^\/media/, '');

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
        'media',
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
  async proxyToMedia(@Req() req: Request) {
    if (req.path.includes('/upload/')) {
      return;
    }

    const path = req.path.replace(/^\/media/, '');
    const headers = this.extractHeaders(req);

    const response = await this.proxyService.proxyRequest(
      'media',
      path,
      {
        method: req.method as any,
        data: req.body,
        params: req.query,
        headers: headers,
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
