import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3Client,} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {Upload} from '@aws-sdk/lib-storage';
import {
  MediaAsset,
  MediaProvider,
  MediaSearchQuery,
  MediaSearchResult,
  MediaUploadOptions,
  TransformationOptions,
} from '@nlc-ai/api-types';

@Injectable()
export class S3Provider implements MediaProvider {
  private readonly logger = new Logger(S3Provider.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly cloudFrontDomain?: string;

  constructor(private configService: ConfigService) {
    const config = this.configService.get('media.provider.s3');

    this.bucketName = config.bucketName;
    this.region = config.region;
    this.cloudFrontDomain = config.cloudFrontDomain;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.accessKeyID,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(
    file: Buffer | Express.Multer.File,
    options: MediaUploadOptions = {}
  ): Promise<MediaAsset> {
    try {
      const fileBuffer = Buffer.isBuffer(file) ? file : file.buffer;
      const fileName = Buffer.isBuffer(file) ? options.publicID || 'unnamed' : file.originalname;
      const mimeType = Buffer.isBuffer(file) ? 'application/octet-stream' : file.mimetype;

      const folder = options.folder || this.configService.get('media.upload.defaultFolder');
      const publicID = options.publicID || `${Date.now()}-${fileName}`;
      const key = `${folder}/${publicID}`;

      const metadata: Record<string, string> = {};
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([k, v]) => {
          metadata[k] = String(v);
        });
      }

      if (options.tags && options.tags.length > 0) {
        metadata.tags = options.tags.join(',');
      }

      this.logger.log(`Uploading to S3: ${key} (${Math.round(fileBuffer.length / 1024)}KB)`);

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
          Metadata: metadata,
          ServerSideEncryption: 'AES256',
        },
        queueSize: 4,
        partSize: 10 * 1024 * 1024,
        leavePartsOnError: false,
      });

      upload.on('httpUploadProgress', (progress: any) => {
        const percent = progress.loaded && progress.total
          ? Math.round((progress.loaded / progress.total) * 100)
          : 0;
        this.logger.log(`Upload progress: ${percent}%`);
      });

      const result = await upload.done();

      const url = this.cloudFrontDomain
        ? `https://${this.cloudFrontDomain}/${key}`
        : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const headResult = await this.s3Client.send(headCommand);

      return {
        id: key,
        publicID: key,
        url,
        secureUrl: url,
        format: this.getFileExtension(fileName),
        resourceType: this.getResourceType(mimeType),
        fileSize: headResult.ContentLength || fileBuffer.length,
        tags: options.tags || [],
        metadata: options.metadata || {},
        folder,
        createdAt: new Date(),
        version: result.VersionId!,
      };
    } catch (error) {
      this.logger.error('Failed to upload to S3', error);
      throw error;
    }
  }

  async delete(publicID: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: publicID,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete asset ${publicID}`, error);
      return false;
    }
  }

  async getAsset(publicID: string): Promise<MediaAsset | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: publicID,
      });

      const result = await this.s3Client.send(command);

      const url = this.cloudFrontDomain
        ? `https://${this.cloudFrontDomain}/${publicID}`
        : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${publicID}`;

      const tags = result.Metadata?.tags?.split(',') || [];
      const folder = publicID.split('/').slice(0, -1).join('/');

      return {
        id: publicID,
        publicID,
        url,
        secureUrl: url,
        format: this.getFileExtension(publicID),
        resourceType: this.getResourceType(result.ContentType || ''),
        fileSize: result.ContentLength || 0,
        tags,
        metadata: result.Metadata || {},
        folder,
        createdAt: result.LastModified || new Date(),
        version: result.VersionId!,
      };
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return null;
      }
      this.logger.error(`Failed to get asset ${publicID}`, error);
      throw error;
    }
  }

  generateUrl(publicID: string, transformations: TransformationOptions[] = []): string {
    return this.cloudFrontDomain
      ? `https://${this.cloudFrontDomain}/${publicID}`
      : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${publicID}`;
  }

  async generateSignedUrl(publicID: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: publicID,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async search(query: MediaSearchQuery): Promise<MediaSearchResult> {
    throw new Error('Search not implemented for S3 provider. Use database queries instead.');
  }

  async updateAsset(publicID: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    throw new Error('Update not implemented for S3 provider. Use database for metadata.');
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }
}
