import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import {
  MediaProvider,
  MediaAsset,
  MediaUploadOptions,
  MediaSearchQuery,
  MediaSearchResult,
  TransformationOptions
} from '@nlc-ai/api-types';

@Injectable()
export class CloudinaryProvider implements MediaProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(private configService: ConfigService) {
    const config = this.configService.get('media.provider.cloudinary');

    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  }

  async upload(file: Buffer | Express.Multer.File, options: MediaUploadOptions = {}): Promise<MediaAsset> {
    try {
      const uploadOptions = {
        folder: options.folder || this.configService.get('media.upload.defaultFolder'),
        public_id: options.publicID,
        overwrite: options.overwrite || false,
        resource_type: 'auto' as const,
        tags: options.tags || [],
        context: options.metadata || {},
        transformation: this.buildCloudinaryTransformations(options.transformation),
      };

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        if (Buffer.isBuffer(file)) {
          uploadStream.end(file);
        } else {
          uploadStream.end(file.buffer);
        }
      });

      return this.mapCloudinaryResponse(result as any);
    } catch (error) {
      this.logger.error('Failed to upload to Cloudinary', error);
      throw error;
    }
  }

  async delete(publicID: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicID, {
        resource_type: resourceType,
      });

      return result.result === 'ok';
    } catch (error) {
      this.logger.error(`Failed to delete asset ${publicID}`, error);
      return false;
    }
  }

  async getAsset(publicID: string): Promise<MediaAsset | null> {
    try {
      const result = await cloudinary.api.resource(publicID, {
        resource_type: 'auto',
      });

      return this.mapCloudinaryResponse(result);
    } catch (error: any) {
      if (error.http_code === 404) {
        return null;
      }
      this.logger.error(`Failed to get asset ${publicID}`, error);
      throw error;
    }
  }

  generateUrl(publicID: string, transformations: TransformationOptions[] = []): string {
    return cloudinary.url(publicID, {
      transformation: this.buildCloudinaryTransformations(transformations),
      secure: true,
    });
  }

  async search(query: MediaSearchQuery): Promise<MediaSearchResult> {
    try {
      const searchOptions: any = {
        expression: query.expression || `folder:${query.folder || '*'}`,
        max_results: query.maxResults || 50,
        next_cursor: query.nextCursor,
      };

      if (query.resourceType) {
        searchOptions.resource_type = query.resourceType;
      }

      if (query.tags && query.tags.length > 0) {
        searchOptions.expression += ` AND tags=(${query.tags.join(' OR ')})`;
      }

      const result = await cloudinary.search.execute(searchOptions);

      return {
        resources: result.resources.map(resource => this.mapCloudinaryResponse(resource)),
        totalCount: result.total_count,
        nextCursor: result.next_cursor,
      };
    } catch (error) {
      this.logger.error('Failed to search assets', error);
      throw error;
    }
  }

  async updateAsset(publicID: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    try {
      const updateOptions: any = {};

      if (updates.tags) {
        updateOptions.tags = updates.tags.join(',');
      }

      if (updates.metadata) {
        updateOptions.context = updates.metadata;
      }

      const result = await cloudinary.uploader.update_metadata(
        updateOptions,
        [publicID]
      );

      return await this.getAsset(publicID);
    } catch (error) {
      this.logger.error(`Failed to update asset ${publicID}`, error);
      throw error;
    }
  }

  private buildCloudinaryTransformations(transformations: TransformationOptions[] = []): any[] {
    return transformations.map(t => {
      const transformation: any = {};

      switch (t.type) {
        case 'resize':
          if (t.width) transformation.width = t.width;
          if (t.height) transformation.height = t.height;
          if (t.crop) transformation.crop = t.crop;
          break;
        case 'quality':
          transformation.quality = t.quality;
          break;
        case 'format':
          transformation.format = t.format;
          break;
        case 'rotate':
          transformation.angle = t.angle;
          break;
        case 'effect':
          transformation.effect = t.effect;
          break;
      }

      if (t.gravity) transformation.gravity = t.gravity;

      return transformation;
    });
  }

  private mapCloudinaryResponse(response: any): MediaAsset {
    return {
      id: response.asset_id || response.public_id,
      publicID: response.public_id,
      url: response.url,
      secureUrl: response.secure_url,
      format: response.format,
      resourceType: response.resource_type,
      width: response.width,
      height: response.height,
      duration: response.duration,
      fileSize: response.bytes,
      tags: response.tags || [],
      metadata: response.context || {},
      folder: response.folder,
      createdAt: new Date(response.created_at),
      version: response.version?.toString(),
    };
  }
}
