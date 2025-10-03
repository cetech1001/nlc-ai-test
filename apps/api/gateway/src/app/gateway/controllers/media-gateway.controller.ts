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

  // Handle file uploads separately with proper multipart handling
  @All('upload/*')
  @UseInterceptors(FileInterceptor('file'))
  async proxyFileUpload(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any
  ) {
    const path = req.path.replace(/^\/media/, '');

    // Create FormData for the proxied request
    const FormData = require('form-data');
    const formData = new FormData();

    // Add the file if it exists
    if (file) {
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }

    // Add other form fields
    if (body) {
      Object.keys(body).forEach(key => {
        if (body[key] !== undefined && body[key] !== null) {
          formData.append(key, body[key]);
        }
      });
    }

    const headers = this.extractHeaders(req);
    // Remove content-type and let form-data set it
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
            ...formData.getHeaders(), // This sets the correct Content-Type with boundary
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('File upload proxy error:', error);
      throw error;
    }
  }

  // Handle all other media requests (non-upload)
  @All('*')
  async proxyToMedia(@Req() req: Request) {
    // Skip if this is an upload request (handled above)
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
