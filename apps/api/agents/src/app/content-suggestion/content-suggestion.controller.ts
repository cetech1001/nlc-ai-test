import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentSuggestionService } from './content-suggestion.service';
import { GenerateIdeasDto, RegenDto, FromMediaDto } from './dto';

@Controller('content-suggestions')
export class ContentSuggestionController {
  constructor(private readonly svc: ContentSuggestionService) {}

  @Post('enable')
  async enable(@Body('coachID') coachID: string) {
    return this.svc.enableContentSuggestionMode(coachID);
  }

  @Post('from-transcript')
  async fromTranscript(@Body() dto: GenerateIdeasDto) {
    return this.svc.generateVideoContentIdeas(
      dto.coachID,
      dto.threadID,
      dto.transcriptText,
      { desiredVibes: dto.desiredVibes as any, extraContext: dto.extraContext }
    );
  }

  @Post('regen')
  async regenerate(@Body() dto: RegenDto) {
    return this.svc.regenerateVideoScriptSection(dto.coachID, dto.threadID, {
      variantIndex: dto.variantIndex,
      section: dto.section,
      constraints: dto.constraints,
    });
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('from-media')
  async fromMedia(@UploadedFile() file: Express.Multer.File, @Body() dto: FromMediaDto) {
    if (!file) throw new BadRequestException('file is required');
    return this.svc.createContentSuggestionsFromMedia(
      dto.coachID,
      dto.threadID,
      file,
      { desiredVibes: dto.desiredVibes as any, extraContext: dto.extraContext }
    );
  }
}
