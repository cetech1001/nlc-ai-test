import {
  BadRequestException,
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
  Query,
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

  @Get('runs/:runID')
  async getScriptRun(
    @CurrentUser() user: AuthUser,
    @Param('runID') runID: string
  ) {
    return this.svc.getScriptRun(user.id, runID);
  }

  @Get('runs')
  async getScriptRuns(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sourceType') sourceType?: string
  ) {
    return this.svc.getScriptRuns(user.id, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      sourceType,
    });
  }

  @Post('from-transcript')
  async fromTranscript(@Body() dto: GenerateIdeasDto, @CurrentUser() user: AuthUser) {
    return this.svc.generateVideoContentIdeas(
      user.id,
      dto.threadID,
      dto.transcriptText,
      { desiredVibes: dto.desiredVibes as any, extraContext: dto.extraContext }
    );
  }

  @Post('regen')
  async regenerate(@Body() dto: RegenDto, @CurrentUser() user: AuthUser) {
    return this.svc.regenerateVideoScriptSection(user.id, dto.threadID, {
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
