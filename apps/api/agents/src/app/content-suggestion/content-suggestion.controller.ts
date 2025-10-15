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
import {GenerateIdeasDto, RegenDto, FromMediaDto, GenerateManualDto} from './dto';
import {CurrentUser} from "@nlc-ai/api-auth";
import {type AuthUser} from "@nlc-ai/types";

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

  @Post('from-manual')
  async fromManual(@Body() dto: GenerateManualDto, @CurrentUser() user: AuthUser) {
    return this.svc.generateFromManualIdea(
      user.id,
      dto.threadID,
      {
        idea: dto.idea,
        contentType: dto.contentType,
        category: dto.category,
        targetPlatforms: dto.targetPlatforms,
        customInstructions: dto.customInstructions,
        videoOptions: {
          duration: dto.videoDuration,
          style: dto.videoStyle,
          includeMusic: dto.includeMusic,
          includeCaptions: dto.includeCaptions,
          orientation: dto.videoOrientation,
        },
        desiredVibes: dto.desiredVibes as any,
        referenceVideoURLs: dto.referenceVideoURLs,
      }
    );
  }

  @Post('from-content-piece')
  async fromContentPiece(@Body() dto: {
    coachID: string;
    threadID: string;
    contentPieceID: string;
    desiredVibes?: string[];
    extraContext?: string;
  }, @CurrentUser() user: AuthUser) {
    return this.svc.generateFromContentPiece(
      user.id,
      dto.threadID,
      dto.contentPieceID,
      { desiredVibes: dto.desiredVibes as any, extraContext: dto.extraContext }
    );
  }
}
