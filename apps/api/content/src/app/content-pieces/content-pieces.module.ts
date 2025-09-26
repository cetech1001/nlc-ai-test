import { Module } from '@nestjs/common';
import { ContentPiecesService } from './content-pieces.service';
import { ContentPiecesController } from './content-pieces.controller';

@Module({
  controllers: [ContentPiecesController],
  providers: [ContentPiecesService],
  exports: [ContentPiecesService],
})
export class ContentPiecesModule {}
