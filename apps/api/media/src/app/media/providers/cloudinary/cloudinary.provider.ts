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
      const fileBuffer = Buffer.isBuffer(file) ? file : file.buffer;
      const fileSize = fileBuffer.length;
      const isVideo = this.isVideoFile(file);

      const needsAsyncProcessing = isVideo && (
        fileSize > 40 * 1024 * 1024 ||
        (options.transformation && options.transformation.length > 0)
      );

      const transformations = this.buildCloudinaryTransformations(options.transformation);

      const uploadOptions = {
        folder: options.folder || this.configService.get('media.upload.defaultFolder'),
        public_id: options.publicID,
        overwrite: options.overwrite || false,
        resource_type: 'auto' as const,
        tags: options.tags || [],
        context: options.metadata || {},
        ...(needsAsyncProcessing
          ? {
              eager_async: true,
              eager: transformations.length > 0
                ? transformations
                : [{ quality: 'auto' }, { fetch_format: 'auto' }],
            }
          : {
              transformation: transformations,
            }),
      };

      this.logger.log(`Uploading ${isVideo ? 'video' : 'file'} (${Math.round(fileSize / 1024)}KB) with ${needsAsyncProcessing ? 'eager async' : 'sync'} processing`);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(fileBuffer);
      });

      const mappedResult = this.mapCloudinaryResponse(result as any);

      if (needsAsyncProcessing) {
        this.logger.log(`Video uploaded successfully with async processing. Public ID: ${mappedResult.publicID}`);
      }

      return mappedResult;
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

      // @ts-ignore
      const result = await cloudinary.search.execute(searchOptions);

      return {
        // @ts-ignore
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

      await cloudinary.uploader.update_metadata(
        updateOptions,
        [publicID]
      );

      // @ts-ignore
      return this.getAsset(publicID);
    } catch (error) {
      this.logger.error(`Failed to update asset ${publicID}`, error);
      throw error;
    }
  }

  /**
   * Check if the processing status of an async upload
   */
  async checkProcessingStatus(publicID: string): Promise<{
    status: 'pending' | 'processing' | 'complete' | 'error';
    eager?: any[];
  }> {
    try {
      const result = await cloudinary.api.resource(publicID, {
        resource_type: 'video',
      });

      // Check if eager transformations are still processing
      if (result.eager && result.eager.length > 0) {
        const hasProcessing = result.eager.some((eager: any) => eager.status === 'processing');
        const hasError = result.eager.some((eager: any) => eager.status === 'error');

        if (hasError) {
          return { status: 'error', eager: result.eager };
        } else if (hasProcessing) {
          return { status: 'processing', eager: result.eager };
        } else {
          return { status: 'complete', eager: result.eager };
        }
      }

      return { status: 'complete' };
    } catch (error) {
      this.logger.error(`Failed to check processing status for ${publicID}`, error);
      return { status: 'error' };
    }
  }

  private isVideoFile(file: Buffer | Express.Multer.File): boolean {
    if (Buffer.isBuffer(file)) {
      return false;
    }
    return file.mimetype?.startsWith('video/') || false;
  }

  private buildCloudinaryTransformations(transformations: TransformationOptions[] = []): any[] {
    if (transformations.length === 0) {
      return [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];
    }

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
