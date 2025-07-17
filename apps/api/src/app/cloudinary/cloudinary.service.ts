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
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadAsset(
    file: Express.Multer.File,
    options: CloudinaryUploadOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: 'image' as const,
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

  async deleteAsset(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  getOptimizedUrl(publicId: string, transformations: any[] = []): string {
    return cloudinary.url(publicId, {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        ...transformations,
      ],
    });
  }
}
