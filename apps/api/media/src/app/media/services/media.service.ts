import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@nlc-ai/api-database';
import {OutboxService} from '@nlc-ai/api-messaging';
import {MediaProviderFactory} from '../providers/provider.factory';
import {UploadAssetDto} from '../dto/upload-asset.dto';
import {MediaFiltersDto} from '../dto/media-filters.dto';
import {MediaEvent, MediaFile, MediaResourceType, MediaUploadResult} from '@nlc-ai/api-types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaProviderFactory: MediaProviderFactory,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService
  ) {
  }

  async uploadAsset(
    userID: string,
    file: Express.Multer.File,
    uploadDto: UploadAssetDto
  ): Promise<MediaUploadResult & { processingStatus?: string }> {
    try {
      this.validateFile(file);

      const provider = this.mediaProviderFactory.getProvider();
      const isVideo = file.mimetype.startsWith('video/');
      const isLargeVideo = isVideo && file.size > 40 * 1024 * 1024; // 40MB

      const uploadOptions = {
        folder: uploadDto.folder,
        publicID: uploadDto.publicID,
        overwrite: uploadDto.overwrite,
        tags: uploadDto.tags || [],
        metadata: {
          ...uploadDto.metadata,
          userID,
          originalName: file.originalname
        },
        transformation: uploadDto.transformation
      };

      this.logger.log(`Starting upload for ${file.originalname} (${Math.round(file.size / 1024)}KB)`);

      const asset = await provider.upload(file, uploadOptions);

      // Save to database with processing status
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          userID,
          publicID: asset.publicID,
          originalName: file.originalname,
          url: asset.url,
          secureUrl: asset.secureUrl,
          format: asset.format,
          resourceType: asset.resourceType as MediaResourceType,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
          folder: asset.folder,
          tags: asset.tags,
          metadata: {
            ...asset.metadata,
            processingStatus: isLargeVideo ? 'processing' : 'complete',
            isAsyncProcessing: isLargeVideo
          },
          provider: this.mediaProviderFactory.getDefaultProvider(),
          providerData: {version: asset.version}
        }
      });

      // Publish event
      await this.outboxService.saveAndPublishEvent<MediaEvent>({
        eventType: 'media.asset.uploaded',
        schemaVersion: 1,
        payload: {
          assetID: mediaFile.id,
          userID,
          publicID: asset.publicID,
          originalName: file.originalname,
          resourceType: asset.resourceType as MediaResourceType,
          fileSize: asset.fileSize as number,
          provider: this.mediaProviderFactory.getDefaultProvider(),
          folder: asset.folder,
          tags: asset.tags,
          url: asset.secureUrl,
          uploadedAt: new Date().toISOString(),
          processingStatus: isLargeVideo ? 'processing' : 'complete'
        }
      }, 'media.asset.uploaded');

      const result = this.serializeMediaFile(mediaFile);

      // Add processing status info for large videos
      if (isLargeVideo) {
        return {
          ...result,
          processingStatus: 'processing',
          message: 'Video uploaded successfully. Processing may take a few minutes for optimal playback quality.'
        };
      }

      return result;

    } catch (error: any) {
      this.logger.error('Failed to upload asset', error);
      throw new BadRequestException({
        code: 'UPLOAD_FAILED',
        message: error.message,
        details: error
      });
    }
  }

  async checkProcessingStatus(assetID: string, userID: string): Promise<{
    status: 'pending' | 'processing' | 'complete' | 'error';
    asset?: MediaFile;
  }> {
    const asset = await this.prisma.mediaFile.findFirst({
      where: { id: assetID, userID }
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    if (!(asset.metadata as any)?.isAsyncProcessing) {
      return { status: 'complete', asset: this.serializeMediaFile(asset) as unknown as MediaFile };
    }

    try {
      const provider = this.mediaProviderFactory.getProvider();

      if ('checkProcessingStatus' in provider && typeof provider.checkProcessingStatus === 'function') {
        const status = await (provider as any).checkProcessingStatus(asset.publicID);

        if (status.status === 'complete' && (asset.metadata as any)?.processingStatus !== 'complete') {
          await this.prisma.mediaFile.update({
            where: { id: assetID },
            data: {
              metadata: {
                // @ts-ignore
                ...asset.metadata,
                processingStatus: 'complete'
              }
            }
          });

          const updatedAsset = await this.prisma.mediaFile.findUnique({
            where: { id: assetID }
          });

          return { status: 'complete', asset: this.serializeMediaFile(updatedAsset) as unknown as MediaFile };
        }

        return { status: status.status, asset: this.serializeMediaFile(asset) as unknown as MediaFile };
      }

      return { status: 'complete', asset: this.serializeMediaFile(asset) as unknown as MediaFile };
    } catch (error) {
      this.logger.error(`Failed to check processing status for asset ${assetID}`, error);
      return { status: 'error', asset: this.serializeMediaFile(asset) as unknown as MediaFile };
    }
  }

  async getAsset(id: string, userID: string): Promise<MediaFile> {
    const asset = await this.prisma.mediaFile.findFirst({
      where: {id, userID}
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return this.serializeMediaFile(asset) as unknown as MediaFile;
  }

  async getAssets(userID: string, filters: MediaFiltersDto): Promise<{
    assets: MediaFile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {userID};

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters.folder) {
      where.folder = {contains: filters.folder};
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {hasSome: filters.tags};
    }

    if (filters.search) {
      where.OR = [
        {originalName: {contains: filters.search, mode: 'insensitive'}},
        {tags: {hasSome: [filters.search]}}
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters.minSize || filters.maxSize) {
      where.fileSize = {};
      if (filters.minSize) where.fileSize.gte = filters.minSize;
      if (filters.maxSize) where.fileSize.lte = filters.maxSize;
    }

    const orderBy: any = {};
    switch (filters.sortBy) {
      case 'name':
        orderBy.originalName = filters.sortOrder;
        break;
      case 'size':
        orderBy.fileSize = filters.sortOrder;
        break;
      default:
        orderBy.createdAt = filters.sortOrder;
    }

    const [assets, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        orderBy,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10
      }),
      this.prisma.mediaFile.count({where})
    ]);

    return {
      assets: assets.map(a => this.serializeMediaFile(a)) as unknown as MediaFile[],
      total,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
  }

  async deleteAsset(id: string, userID: string, deletedBy: string): Promise<boolean> {
    const asset = await this.getAsset(id, userID);

    const provider = this.mediaProviderFactory.getProvider();
    const deleted = await provider.delete(asset.publicID, asset.resourceType);

    if (deleted) {
      await this.prisma.mediaFile.delete({
        where: {id}
      });

      // Publish event
      await this.outboxService.saveAndPublishEvent<MediaEvent>({
        eventType: 'media.asset.deleted',
        schemaVersion: 1,
        payload: {
          assetID: id,
          userID,
          publicID: asset.publicID,
          resourceType: asset.resourceType,
          provider: asset.provider,
          deletedBy,
          deletedAt: new Date().toISOString()
        }
      }, 'media.asset.deleted');
    }

    return deleted;
  }

  async generateUrl(id: string, userID: string, transformations?: any[]): Promise<string> {
    const asset = await this.getAsset(id, userID);
    const provider = this.mediaProviderFactory.getProvider();

    return provider.generateUrl(asset.publicID, transformations);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxSize = file.mimetype.startsWith('video/')
      ? this.configService.get('media.upload.maxVideoSize', 500 * 1024 * 1024) // Default 500MB for videos
      : this.configService.get('media.upload.maxFileSize', 100 * 1024 * 1024); // Default 100MB for other files

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
      'application/pdf', 'text/plain'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  private serializeMediaFile(mediaFile: any): any {
    return {
      ...mediaFile,
      fileSize: Number(mediaFile.fileSize),
      createdAt: mediaFile.createdAt?.toISOString?.() || mediaFile.createdAt,
      updatedAt: mediaFile.updatedAt?.toISOString?.() || mediaFile.updatedAt,
    };
  }
}
