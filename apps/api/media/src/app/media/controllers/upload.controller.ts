import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { CurrentUser, UserTypesGuard, UserTypes } from '@nlc-ai/api-auth';
import type { AuthUser } from '@nlc-ai/api-types';
import { MediaService } from '../services/media.service';
import { UploadAssetDto } from '../dto/upload-asset.dto';

@ApiTags('Media Upload')
@Controller('upload')
@UseGuards(UserTypesGuard)
@UserTypes('coach')
export class UploadController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('asset')
  @ApiOperation({ summary: 'Upload a media asset' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Asset uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload parameters' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB - will be overridden by service validation
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mpeg', 'video/quicktime',
        'application/pdf', 'text/plain'
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
      }
    }
  }))
  async uploadAsset(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadAssetDto,
    @CurrentUser() user: AuthUser
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.mediaService.uploadAsset(user.id, file, uploadDto);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB for avatars
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Avatar must be JPEG, PNG, or WebP'), false);
      }
    }
  }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const avatarDto: UploadAssetDto = {
      folder: `avatars/${user.type}s`,
      publicID: `avatar_${user.id}`,
      overwrite: true,
      tags: ['avatar', user.type],
      transformation: [
        {
          type: 'resize',
          width: 200,
          height: 200,
          crop: 'fill',
          gravity: 'face'
        },
        {
          type: 'quality',
          quality: 'auto'
        },
        {
          type: 'format',
          format: 'webp'
        }
      ]
    };

    return this.mediaService.uploadAsset(user.id, file, avatarDto);
  }
}
