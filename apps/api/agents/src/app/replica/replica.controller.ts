import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';
import { ReplicaService } from './replica.service';

@ApiTags('Coach Replica / Knowledge Base')
@Controller('replica')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.COACH, UserType.ADMIN)
@ApiBearerAuth()
export class ReplicaController {
  constructor(
    private readonly replica: ReplicaService,
  ) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize coach AI assistant with vector store' })
  @ApiResponse({ status: 200, description: 'Assistant initialized successfully' })
  async initializeCoachAI(
    @CurrentUser() user: AuthUser,
    @Body() body: { name?: string }
  ) {
    return this.replica.initializeCoachAI(
      user.id,
      body.name
    );
  }

  @Get('files')
  @ApiOperation({ summary: 'List all files in vector store' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async listFiles(@CurrentUser() user: AuthUser) {
    return this.replica.listFiles(user.id);
  }

  @Post('files/upload')
  @ApiOperation({ summary: 'Upload file to OpenAI for vector store' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body('category') category: string,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.replica.uploadFile(user.id, file, category);
  }

  @Delete('files/remove-file/:fileID')
  @ApiOperation({ summary: 'Remove file from OpenAI only' })
  @ApiResponse({ status: 200, description: 'File removed successfully' })
  async removeFileUpload(
    @CurrentUser() user: AuthUser,
    @Param('fileID') fileID: string
  ) {
    return this.replica.removeFileUpload(
      user.id,
      fileID
    );
  }

  @Post('vector-store/add-file')
  @ApiOperation({ summary: 'Add uploaded file to vector store' })
  @ApiResponse({ status: 200, description: 'File added to vector store successfully' })
  async addFileToVectorStore(
    @CurrentUser() user: AuthUser,
    @Body() body: { fileID: string }
  ) {
    return this.replica.addFileToVectorStore(
      user.id,
      body.fileID
    );
  }

  @Delete('vector-store/remove-file/:fileID')
  @ApiOperation({ summary: 'Remove file from vector store' })
  @ApiResponse({ status: 200, description: 'File removed successfully' })
  async removeFileFromVectorStore(
    @CurrentUser() user: AuthUser,
    @Param('fileID') fileID: string
  ) {
    return this.replica.removeFileFromVectorStore(
      user.id,
      fileID
    );
  }

  @Post('thread/create')
  @ApiOperation({ summary: 'Create new conversation thread' })
  @ApiResponse({ status: 200, description: 'Thread created successfully' })
  async createThread(@CurrentUser() user: AuthUser) {
    return this.replica.createThread(user.id);
  }

  @Post('thread/:threadID/message')
  @ApiOperation({ summary: 'Add message to thread' })
  @ApiResponse({ status: 200, description: 'Message added successfully' })
  async addMessageToThread(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() body: { message: string }
  ) {
    return this.replica.addMessageToThread(
      user.id,
      threadID,
      body.message
    );
  }

  @Post('thread/:threadID/run')
  @ApiOperation({ summary: 'Run assistant on thread' })
  @ApiResponse({ status: 200, description: 'Assistant run started' })
  async runAssistant(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string
  ) {
    return this.replica.runAssistant(user.id, threadID);
  }

  @Get('thread/:threadID/run/:runID/status')
  @ApiOperation({ summary: 'Get run status' })
  @ApiResponse({ status: 200, description: 'Run status retrieved' })
  async getRunStatus(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Param('runID') runID: string
  ) {
    return this.replica.getRunStatus(user.id, threadID, runID);
  }

  @Get('thread/:threadID/messages')
  @ApiOperation({ summary: 'Get all messages in thread' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getThreadMessages(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string
  ) {
    return this.replica.getThreadMessages(user.id, threadID);
  }

  @Post('thread/:threadID/stream')
  @ApiOperation({ summary: 'Stream assistant response' })
  @ApiResponse({ status: 200, description: 'Streaming response' })
  async streamAssistantResponse(
    @CurrentUser() user: AuthUser,
    @Param('threadID') threadID: string,
    @Body() body: { message: string }
  ) {
    return this.replica.streamAssistantResponse(
      user.id,
      threadID,
      body.message
    );
  }

  @Get('assistant/info')
  @ApiOperation({ summary: 'Get coach assistant information' })
  @ApiResponse({ status: 200, description: 'Assistant info retrieved' })
  async getAssistantInfo(@CurrentUser() user: AuthUser) {
    return this.replica.getAssistantInfo(user.id);
  }

  @Post('assistant/update-instructions')
  @ApiOperation({ summary: 'Update assistant instructions' })
  @ApiResponse({ status: 200, description: 'Instructions updated' })
  async updateAssistantInstructions(
    @CurrentUser() user: AuthUser,
    @Body() body: { instructions: string }
  ) {
    return this.replica.updateAssistantInstructions(
      user.id,
      body.instructions
    );
  }
}
