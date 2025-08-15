import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { MediaService } from './services/media.service';
import { MediaController } from './controllers/media.controller';
import { UploadController } from './controllers/upload.controller';
import { CloudinaryProvider } from './providers/cloudinary/cloudinary.provider';
import { MediaProviderFactory } from './providers/provider.factory';

@Module({
  imports: [
    DatabaseModule,
    MessagingModule.forRoot(),
  ],
  controllers: [
    MediaController,
    UploadController,
  ],
  providers: [
    MediaService,
    CloudinaryProvider,
    MediaProviderFactory,
  ],
  exports: [
    MediaService,
    MediaProviderFactory,
  ],
})
export class MediaModule {}
