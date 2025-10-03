import {Injectable} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {MediaFiltersDto} from '../dto/media-filters.dto';
import {MediaFile, MediaProcessingStatus, MediaProviderType, MediaResourceType} from "@nlc-ai/types";

export interface CreateMediaFileData {
  userID: string;
  publicID: string;
  originalName: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: MediaResourceType;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  tags?: string[];
  metadata?: any;
  provider: MediaProviderType;
  providerData?: any;
  processingStatus?: MediaProcessingStatus;
}

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMediaFile(data: CreateMediaFileData) {
    return this.prisma.mediaFile.create({
      data: {
        userID: data.userID,
        publicID: data.publicID,
        originalName: data.originalName,
        url: data.url,
        secureUrl: data.secureUrl,
        format: data.format,
        resourceType: data.resourceType,
        fileSize: data.fileSize,
        width: data.width,
        height: data.height,
        duration: data.duration,
        folder: data.folder,
        tags: data.tags || [],
        metadata: {
          ...data.metadata,
          processingStatus: data.processingStatus || MediaProcessingStatus.COMPLETE,
        },
        provider: data.provider,
        providerData: data.providerData || {},
      },
    });
  }

  async findMediaFile(id: string, userID?: string) {
    const where: any = { id };
    if (userID) {
      where.userID = userID;
    }

    return this.prisma.mediaFile.findFirst({ where });
  }

  async findMediaFiles(userID: string, filters: MediaFiltersDto) {
    const where: any = { userID };

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters.folder) {
      where.folder = { contains: filters.folder };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.search) {
      where.OR = [
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
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
        take: filters.limit || 10,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return { assets, total };
  }

  async updateMediaFile(id: string, updates: any) {
    return this.prisma.mediaFile.update({
      where: { id },
      data: updates,
    });
  }

  async updateProcessingStatus(
    id: string,
    status: 'pending' | 'processing' | 'complete' | 'error'
  ) {
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      return null;
    }

    return this.prisma.mediaFile.update({
      where: { id },
      data: {
        metadata: {
          ...(mediaFile.metadata as any),
          processingStatus: status,
        },
      },
    });
  }

  async deleteMediaFile(id: string) {
    return this.prisma.mediaFile.delete({
      where: { id },
    });
  }

  serializeMediaFile(mediaFile: any): MediaFile {
    return {
      ...mediaFile,
      fileSize: Number(mediaFile.fileSize),
      createdAt: mediaFile.createdAt?.toISOString?.() || mediaFile.createdAt,
      updatedAt: mediaFile.updatedAt?.toISOString?.() || mediaFile.updatedAt,
    } as MediaFile;
  }
}
