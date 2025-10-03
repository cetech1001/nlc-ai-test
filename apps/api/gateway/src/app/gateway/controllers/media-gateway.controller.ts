import {
  Controller,
  All,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import busboy from 'busboy';
import FormData from 'form-data';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
export class MediaGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
  ) {}

  // Handle file uploads with streaming (no memory loading)
  @All('upload/*')
  async proxyFileUpload(@Req() req: RawBodyRequest<Request>) {
    const path = req.path.replace(/^\/media/, '');

    return new Promise((resolve, reject) => {
      const bb = busboy({
        headers: req.headers,
        limits: {
          fileSize: 10 * 1024 * 1024 * 1024, // 10GB max
        }
      });

      const formData = new FormData();
      const fields: Record<string, any> = {};
      let fileCount = 0;

      // Handle file streams
      bb.on('file', (fieldname, fileStream, info) => {
        fileCount++;
        const { filename, mimeType } = info;

        console.log(`Streaming file: ${filename} (${mimeType})`);

        // Append file stream directly to FormData (no buffering)
        formData.append(fieldname, fileStream, {
          filename,
          contentType: mimeType,
        });
      });

      // Handle form fields
      bb.on('field', (fieldname, value) => {
        fields[fieldname] = value;
        formData.append(fieldname, value);
      });

      // Handle completion
      bb.on('finish', async () => {
        if (fileCount === 0) {
          return reject('No file provided');
          // return resolve(undefined);
        }

        const headers = this.extractHeaders(req);
        delete headers['content-type'];
        delete headers['content-length'];

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

          resolve(response.data);
        } catch (error: any) {
          console.error('File upload proxy error:', error);
          reject(error.message || 'Upload failed');
        }
      });

      // Handle errors
      bb.on('error', (error) => {
        console.error('Busboy error:', error);
        reject('Upload processing failed');
      });

      // Pipe request to busboy
      req.pipe(bb);
    });
  }

  // Handle all other media requests (non-upload)
  @All('*')
  async proxyToMedia(@Req() req: Request) {
    // Skip if this is an upload request (handled above)
    if (req.path.includes('/upload/')) {
      return;
    }

    const path = req.path.replace(/^\/media/, '');

    const response = await this.proxyService.proxyRequest('media', path, {
      method: req.method as any,
      data: req.body,
      params: req.query,
      headers: this.extractHeaders(req),
    });

    return response.data;
  }

  private extractHeaders(req: Request): Record<string, string> {
    return {
      authorization: req.headers.authorization || '',
      'content-type': req.headers['content-type'] || 'application/json',
      'user-agent': req.headers['user-agent'] || '',
      'x-forwarded-for':
        (req.headers['x-forwarded-for'] as string) || req.ip || '',
      'x-real-ip': req.ip || '',
      cookie: req.headers.cookie || '',
    };
  }
}
