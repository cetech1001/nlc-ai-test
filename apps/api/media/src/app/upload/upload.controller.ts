import {BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiConsumes, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CurrentUser, UserTypes, UserTypesGuard} from '@nlc-ai/api-auth';
import {type AuthUser, MediaTransformationType, UserType} from '@nlc-ai/types';
import {MediaService} from '../media/media.service';
import {CompleteMultipartDto, GetPartUrlDto, InitMultipartDto, UploadAssetDto} from './dto';
import {S3MultipartService} from "../media/providers/s3/multipart.service";

@ApiTags('Media Upload')
@Controller('upload')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN, UserType.CLIENT)
export class UploadController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3mp: S3MultipartService
  ) {}

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

  @Post('multipart/init')
  @ApiOperation({summary: 'Init video multipart upload (S3 presigned)'})
  async initMultipart(@Body() dto: InitMultipartDto, @CurrentUser() user: AuthUser) {
    console.log("Came in here");
    const folder = dto.folder || `nlc-ai/uploads/videos/${user.id}`;
    const key = `${folder}/${Date.now()}_${dto.filename}`;
    const contentType = guessContentType(dto.filename) || 'video/mp4';

    const {uploadId} = await this.s3mp.initMultipart(key, contentType);
    console.log(`Upload ID: ${uploadId}`);

    return {
      uploadId,
      key,
      partSize: 10 * 1024 * 1024,
      contentType,
    };
  }

  @Post('multipart/part-url')
  @ApiOperation({ summary: 'Get presigned URL for one part' })
  async getPartUrl(@Body() dto: GetPartUrlDto) {
    const url = await this.s3mp.getPartUrl(dto.key, dto.uploadId, dto.partNumber);
    return { url };
  }

  @Post('multipart/complete')
  @ApiOperation({ summary: 'Complete multipart, persist media, emit events' })
  async completeMultipart(@Body() dto: CompleteMultipartDto, @CurrentUser() user: AuthUser) {
    await this.s3mp.completeMultipart(dto.key, dto.uploadId, dto.parts);

    const fakeMulterLike: any = {
      originalname: dto.key.split('/').pop(),
      mimetype: 'video/mp4',
      size: 0,
      buffer: Buffer.alloc(0), // not used
    };

    return await this.mediaService.uploadAsset(user.id, fakeMulterLike, {
      folder: dto.key.split('/').slice(0, -1).join('/'),
      publicID: dto.key,
      overwrite: true,
      tags: ['video', 'multipart'],
      metadata: {multipart: true},
      transformation: [{type: MediaTransformationType.QUALITY, quality: 'auto'}],
    });
  }
}

function guessContentType(filename: string) {
  if (filename.endsWith('.mp4')) return 'video/mp4';
  if (filename.endsWith('.webm')) return 'video/webm';
  if (filename.endsWith('.mov')) return 'video/quicktime';
  return undefined;
}
