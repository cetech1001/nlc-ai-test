import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {MediaProviderFactory} from './providers/provider.factory';
import {MediaFiltersDto} from './dto';
import {
  MediaFile,
  MediaResourceType,
  MediaUploadResult,
  MediaProcessingStatus,
  MediaProviderType, MediaUploadOptions
} from '@nlc-ai/types';
import {UploadHelper} from './helpers/upload.helper';
import {MediaRepository} from './repositories/media.repository';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly mediaProviderFactory: MediaProviderFactory,
    private readonly uploadHelper: UploadHelper,
    private readonly mediaRepo: MediaRepository
  ) {}

  async uploadAsset(
    userID: string,
    file: Express.Multer.File,
    uploadDto: MediaUploadOptions,
  ): Promise<MediaUploadResult> {
    // Special path: called after S3 multipart COMPLETE — do NOT upload again.
    if (uploadDto?.metadata?.multipart === true) {
      // For multipart we treat as video -> S3 provider
      const provider = this.mediaProviderFactory.getProviderForVideo();
      const providerType = this.mediaProviderFactory.getProviderType(true);

      const folder =
        uploadDto.folder ||
        this.uploadHelper.getFolderPath(userID, /* isVideo */ true);
      const publicID =
        uploadDto.publicID ||
        this.uploadHelper.generatePublicID(
          // try to preserve original name if provided by caller
          (uploadDto.metadata as any)?.originalName ||
            file?.originalname ||
            'video.mp4',
          userID
        );

      // Try to read the just-uploaded object's metadata from the provider
      let asset = await provider.getAsset(publicID);

      // Fallback if HEAD fails momentarily
      if (!asset) {
        asset = {
          id: publicID,
          publicID,
          url: provider.generateUrl(publicID, []),
          secureUrl: provider.generateUrl(publicID, []),
          format: publicID.split('.').pop() || 'mp4',
          resourceType: 'video',
          width: undefined as any,
          height: undefined as any,
          duration: undefined as any,
          fileSize: (uploadDto.metadata as any)?.originalSize || 0,
          tags: uploadDto.tags || [],
          metadata: uploadDto.metadata || {},
          folder,
          createdAt: new Date(),
          version: undefined as any,
        };
      }

      const isLargeVideo = true;
      const processingStatus = MediaProcessingStatus.PROCESSING;

      const mediaFile = await this.mediaRepo.createMediaFile({
        userID,
        publicID: asset.publicID,
        originalName:
          (uploadDto.metadata as any)?.originalName ||
          file?.originalname ||
          asset.publicID.split('/').pop()!,
        url: asset.url,
        secureUrl: asset.secureUrl,
        format: asset.format,
        resourceType: 'video' as MediaResourceType,
        fileSize: asset.fileSize || (uploadDto.metadata as any)?.originalSize || 0,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        folder: asset.folder || folder,
        tags: asset.tags || uploadDto.tags || [],
        metadata: {
          ...(asset.metadata || {}),
          ...(uploadDto.metadata || {}),
          isAsyncProcessing: isLargeVideo,
          multipart: true,
        },
        provider: providerType,
        providerData: { version: asset.version },
        processingStatus,
      });


      const result = this.mediaRepo.serializeMediaFile(mediaFile);
      return {
        asset: result,
        processingStatus,
        message:
          'Video registered successfully. Processing may take a few minutes for optimal playback quality.',
      };
    }

    // Normal path (non-multipart): validate and upload via provider
    const validation = this.uploadHelper.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const provider = this.mediaProviderFactory.getProviderForFile(validation.isVideo);
    const providerType = this.mediaProviderFactory.getProviderType(validation.isVideo);

    const folder = uploadDto.folder || this.uploadHelper.getFolderPath(userID, validation.isVideo);
    const publicID = uploadDto.publicID || this.uploadHelper.generatePublicID(file.originalname, userID);

    const uploadOptions = {
      folder,
      publicID,
      overwrite: uploadDto.overwrite,
      tags: uploadDto.tags || [],
      metadata: {
        ...uploadDto.metadata,
        userID,
        originalName: file.originalname,
      },
      transformation: uploadDto.transformation,
    };

    this.logger.log(
      `Uploading ${validation.isVideo ? 'video' : 'image'}: ${file.originalname} ` +
      `(${this.uploadHelper.formatFileSize(file.size)}) to ${validation.isVideo ? 'S3' : 'Cloudinary'}`
    );

    const asset = await provider.upload(file, uploadOptions);

    const isLargeVideo = validation.isVideo && file.size > 40 * 1024 * 1024;
    const processingStatus = isLargeVideo
      ? MediaProcessingStatus.PROCESSING : MediaProcessingStatus.COMPLETE;

    const mediaFile = await this.mediaRepo.createMediaFile({
      userID,
      publicID: asset.publicID,
      originalName: file.originalname,
      url: asset.url,
      secureUrl: asset.secureUrl,
      format: asset.format,
      resourceType: asset.resourceType as MediaResourceType,
      fileSize: asset.fileSize || file.size,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      folder: asset.folder,
      tags: asset.tags,
      metadata: {
        ...asset.metadata,
        isAsyncProcessing: isLargeVideo,
      },
      provider: providerType,
      providerData: { version: asset.version },
      processingStatus,
    });

    const result = this.mediaRepo.serializeMediaFile(mediaFile);

    if (isLargeVideo) {
      return {
        asset: result,
        processingStatus: MediaProcessingStatus.PROCESSING,
        message: 'Video uploaded successfully. Processing may take a few minutes for optimal playback quality.',
      };
    }

    return {
      asset: result,
      processingStatus: MediaProcessingStatus.PROCESSING,
      message: 'Video uploaded successfully',
    };
  }

  async checkProcessingStatus(
    assetID: string,
    userID: string
  ): Promise<{
    status: 'pending' | 'processing' | 'complete' | 'error';
    asset?: MediaFile;
  }> {
    const asset = await this.mediaRepo.findMediaFile(assetID, userID);

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    const metadata = asset.metadata as any;

    if (!metadata?.isAsyncProcessing) {
      return {
        status: 'complete',
        asset: this.mediaRepo.serializeMediaFile(asset),
      };
    }

    try {
      const provider = this.mediaProviderFactory.getProvider(asset.provider as MediaProviderType);

      if ('checkProcessingStatus' in provider && typeof provider.checkProcessingStatus === 'function') {
        const status = await (provider as any).checkProcessingStatus(asset.publicID);

        if (status.status === 'complete' && metadata?.processingStatus !== 'complete') {
          await this.mediaRepo.updateProcessingStatus(assetID, 'complete');

          const updatedAsset = await this.mediaRepo.findMediaFile(assetID, userID);
          return {
            status: 'complete',
            asset: this.mediaRepo.serializeMediaFile(updatedAsset!),
          };
        }

        return {
          status: status.status,
          asset: this.mediaRepo.serializeMediaFile(asset),
        };
      }

      return {
        status: 'complete',
        asset: this.mediaRepo.serializeMediaFile(asset),
      };
    } catch (error) {
      this.logger.error(`Failed to check processing status for asset ${assetID}`, error);
      return {
        status: 'error',
        asset: this.mediaRepo.serializeMediaFile(asset),
      };
    }
  }

  async getAsset(id: string, userID: string): Promise<MediaFile> {
    const asset = await this.mediaRepo.findMediaFile(id, userID);

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return this.mediaRepo.serializeMediaFile(asset);
  }

  async getAssets(
    userID: string,
    filters: MediaFiltersDto
  ): Promise<{
    assets: MediaFile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { assets, total } = await this.mediaRepo.findMediaFiles(userID, filters);

    return {
      assets: assets.map((a) => this.mediaRepo.serializeMediaFile(a)),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }

  async deleteAsset(id: string, userID: string, deletedBy: string): Promise<boolean> {
    const asset = await this.getAsset(id, userID);

    // Determine which provider to use based on resource type
    const provider = asset.resourceType === 'video'
      ? this.mediaProviderFactory.getProviderForVideo()
      : this.mediaProviderFactory.getProviderForImage();

    const deleted = await provider.delete(asset.publicID, asset.resourceType);

    if (deleted) {
      await this.mediaRepo.deleteMediaFile(id);
    }

    return deleted;
  }

  async generateUrl(id: string, userID: string, transformations?: any[]): Promise<string> {
    const asset = await this.getAsset(id, userID);

    const provider = asset.resourceType === 'video'
      ? this.mediaProviderFactory.getProviderForVideo()
      : this.mediaProviderFactory.getProviderForImage();

    return provider.generateUrl(asset.publicID, transformations);
  }
}
