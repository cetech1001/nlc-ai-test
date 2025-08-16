import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
export class MediaGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const formData = new FormData();
    if (file) {
      formData.append('file', new Blob([file.buffer]), file.originalname);
    }

    // Add other form fields
    Object.keys(body).forEach(key => {
      formData.append(key, body[key]);
    });

    const response = await this.proxyService.proxyRequest(
      'media',
      '/api/media/upload',
      {
        method: 'POST',
        data: formData,
        headers: {
          ...this.extractHeaders(req),
          'content-type': 'multipart/form-data',
        },
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const formData = new FormData();

    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`files`, new Blob([file.buffer]), file.originalname);
      });
    }

    Object.keys(body).forEach(key => {
      formData.append(key, body[key]);
    });

    const response = await this.proxyService.proxyRequest(
      'media',
      '/api/media/upload/multiple',
      {
        method: 'POST',
        data: formData,
        headers: {
          ...this.extractHeaders(req),
          'content-type': 'multipart/form-data',
        },
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('files')
  @ApiOperation({ summary: 'Get media files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getFiles(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'media',
      '/api/media/files',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('files/:id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  async getFile(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'media',
      `/api/media/files/${id}`,
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'media',
      `/api/media/files/${id}`,
      {
        method: 'DELETE',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get media analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'media',
      '/api/media/analytics',
      {
        method: 'GET',
        params: query,
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
