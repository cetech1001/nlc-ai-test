import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  isVideo: boolean;
  isImage: boolean;
  maxSize: number;
}

@Injectable()
export class UploadHelper {
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  private readonly allowedVideoTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    'video/x-msvideo',
  ];

  private readonly allowedDocumentTypes = [
    'application/pdf',
    'text/plain',
  ];

  constructor(private configService: ConfigService) {}

  validateFile(file: Express.Multer.File): FileValidationResult {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isVideo = this.isVideoFile(file);
    const isImage = this.isImageFile(file);

    const maxSize = isVideo
      ? this.configService.get('media.upload.maxVideoSize', 10 * 1024 * 1024 * 1024)
      : this.configService.get('media.upload.maxFileSize', 100 * 1024 * 1024);

    if (file.size > maxSize) {
      const maxSizeMB = this.formatFileSize(maxSize);
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeMB}`,
        isVideo,
        isImage,
        maxSize,
      };
    }

    const allowedTypes = [
      ...this.allowedImageTypes,
      ...this.allowedVideoTypes,
      ...this.allowedDocumentTypes,
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed`,
        isVideo,
        isImage,
        maxSize,
      };
    }

    return {
      isValid: true,
      isVideo,
      isImage,
      maxSize,
    };
  }

  isVideoFile(file: Express.Multer.File): boolean {
    return this.allowedVideoTypes.includes(file.mimetype);
  }

  isImageFile(file: Express.Multer.File): boolean {
    return this.allowedImageTypes.includes(file.mimetype);
  }

  formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)}KB`;
    }
    return `${bytes}B`;
  }

  generatePublicID(fileName: string, userID: string): string {
    const timestamp = Date.now();
    const cleanFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
    return `${userID}_${timestamp}_${cleanFileName}`;
  }

  getFolderPath(userID: string, isVideo: boolean, customFolder?: string): string {
    if (customFolder) {
      return customFolder;
    }

    const baseFolder = this.configService.get('media.upload.defaultFolder', 'uploads');
    const mediaType = isVideo ? 'videos' : 'images';
    return `${baseFolder}/${mediaType}/${userID}`;
  }
}
