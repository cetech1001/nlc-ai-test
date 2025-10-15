import { Module } from '@nestjs/common';
import { ContentSuggestionService } from './content-suggestion.service';
import { ContentSuggestionController } from './content-suggestion.controller';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ContentSuggestionService, PrismaService, ConfigService],
  controllers: [ContentSuggestionController],
  exports: [ContentSuggestionService],
})
export class ContentSuggestionModule {}
