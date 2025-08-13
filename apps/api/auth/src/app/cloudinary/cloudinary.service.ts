import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import "multer";

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  transformation?: any[];
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('auth.cloudinary.cloudName'),
      api_key: this.configService.get<string>('auth.cloudinary.apiKey'),
      api_secret: this.configService.get<string>('auth.cloudinary.apiSecret'),
    });
  }

  async uploadAsset(
    file: Express.Multer.File,
    options: CloudinaryUploadOptions & { resource_type?: 'image' | 'video' } = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: options.resource_type || 'auto' as const,
        folder: options.folder || 'uploads',
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        transformation: options.transformation || [],
        ...options,
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(file.buffer);
    });
  }

  async deleteAsset(publicID: string): Promise<any> {
    let options = {};
    return cloudinary.uploader.destroy(publicID, options);
  }

  getOptimizedUrl(publicID: string, transformations: any[] = []): string {
    return cloudinary.url(publicID, {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        ...transformations,
      ],
    });
  }
}
