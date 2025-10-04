import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CloudinaryProvider } from './providers/cloudinary/cloudinary.provider';
import { MediaProviderFactory } from './providers/provider.factory';
import {MediaRepository} from "./repositories/media.repository";
import {UploadHelper} from "./helpers/upload.helper";
import {S3Provider} from "./providers/s3/s3.provider";
import {S3MultipartService} from "./providers/s3/multipart.service";

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    CloudinaryProvider,
    S3Provider,
    S3MultipartService,
    MediaProviderFactory,
    UploadHelper,
    MediaRepository,
  ],
  exports: [
    MediaService,
    CloudinaryProvider,
    S3Provider,
    S3MultipartService,
    MediaProviderFactory,
    UploadHelper,
    MediaRepository,
  ]
})
export class MediaModule {}
