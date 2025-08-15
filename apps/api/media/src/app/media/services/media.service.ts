import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { MediaProviderFactory } from '../providers/provider.factory';
import { UploadAssetDto } from '../dto/upload-asset.dto';
import { MediaFiltersDto } from '../dto/media-filters.dto';
import {MediaFile, MediaUploadResult, MediaResourceType, MediaEvent} from '@nlc-ai/api-types';

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
    coachID: string,
    file: Express.Multer.File,
    uploadDto: UploadAssetDto
  ): Promise<MediaUploadResult> {
    try {
      this.validateFile(file);

      const provider = this.mediaProviderFactory.getProvider();

      const uploadOptions = {
        folder: uploadDto.folder || `coaches/${coachID}`,
        publicID: uploadDto.publicID,
        overwrite: uploadDto.overwrite,
        tags: uploadDto.tags || [],
        metadata: {
          ...uploadDto.metadata,
          coachID,
          originalName: file.originalname
        },
        transformation: uploadDto.transformation
      };

      const asset = await provider.upload(file, uploadOptions);

      // Save to database
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          coachID,
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
          metadata: asset.metadata,
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
          coachID,
          publicID: asset.publicID,
          originalName: file.originalname,
          resourceType: asset.resourceType as MediaResourceType,
          fileSize: asset.fileSize,
          provider: this.mediaProviderFactory.getDefaultProvider(),
          folder: asset.folder,
          tags: asset.tags,
          url: asset.secureUrl,
          uploadedAt: new Date().toISOString()
        }
      }, 'media.asset.uploaded');

      return {
        success: true,
        asset: mediaFile as unknown as MediaFile
      };

    } catch (error: any) {
      this.logger.error('Failed to upload asset', error);
      return {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error.message,
          details: error
        }
      };
    }
  }

  async getAsset(id: string, coachID: string): Promise<MediaFile> {
    const asset = await this.prisma.mediaFile.findFirst({
      where: {id, coachID}
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return asset as unknown as MediaFile;
  }

  async getAssets(coachID: string, filters: MediaFiltersDto): Promise<{
    assets: MediaFile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {coachID};

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
      assets: assets as unknown as MediaFile[],
      total,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
  }

  async deleteAsset(id: string, coachID: string, deletedBy: string): Promise<boolean> {
    const asset = await this.getAsset(id, coachID);

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
          coachID,
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

  async generateUrl(id: string, coachID: string, transformations?: any[]): Promise<string> {
    const asset = await this.getAsset(id, coachID);
    const provider = this.mediaProviderFactory.getProvider();

    return provider.generateUrl(asset.publicID, transformations);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxSize = file.mimetype.startsWith('video/')
      ? this.configService.get('media.upload.maxVideoSize')
      : this.configService.get('media.upload.maxFileSize');

    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mpeg', 'video/quicktime',
      'application/pdf', 'text/plain'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }
}
