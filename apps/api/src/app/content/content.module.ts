import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import {CloudinaryModule} from "../cloudinary/cloudinary.module";

@Module({
  imports: [CloudinaryModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
