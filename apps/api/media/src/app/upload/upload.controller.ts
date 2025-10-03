import {BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiConsumes, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CurrentUser, UserTypes, UserTypesGuard} from '@nlc-ai/api-auth';
import {type AuthUser, UserType, MediaTransformationType} from '@nlc-ai/types';
import {MediaService} from '../media/media.service';
import {UploadAssetDto} from './dto';

@ApiTags('Media Upload')
@Controller('upload')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN, UserType.CLIENT)
export class UploadController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('asset')
  @ApiOperation({ summary: 'Upload a media asset' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Asset uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload parameters' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024,
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
      fileSize: 5 * 1024 * 1024,
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
      folder: `nlc-ai/avatars/${user.type}s`,
      publicID: `avatar_${user.id}`,
      overwrite: true,
      tags: ['avatar', user.type],
      transformation: [
        {
          type: MediaTransformationType.RESIZE,
          width: 200,
          height: 200,
          crop: 'fill',
          gravity: 'face'
        },
        {
          type: MediaTransformationType.QUALITY,
          quality: 'auto'
        },
        {
          type: MediaTransformationType.FORMAT                             ,
          format: 'webp'
        }
      ]
    };

    return this.mediaService.uploadAsset(user.id, file, avatarDto);
  }
}
