import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class ReplicaService {
  private readonly logger = new Logger(ReplicaService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  async initializeCoachAI(coachID: string, name?: string) {
    this.logger.log(`Initializing coach AI for coach ${coachID}`);

    // Check if coach already has an assistant
    const existingConfig = await this.prisma.coachAIConfig.findUnique({
      where: { coachID }
    });

    if (existingConfig?.assistantID && existingConfig?.vectorStoreID) {
      return {
        message: 'Assistant already initialized',
        vectorStoreID: existingConfig.vectorStoreID,
        assistantID: existingConfig.assistantID,
      };
    }

    try {
      // Create vector store
      const vectorStore = await this.openai.vectorStores.create({
        name: `coach_${coachID}_knowledge_base`,
        metadata: {
          coachID: coachID,
          createdAt: new Date().toISOString()
        }
      });

      // Create assistant
      const assistant = await this.openai.beta.assistants.create({
        name: name || `Coach ${coachID} AI Assistant`,
        instructions: this.getDefaultInstructions(),
        model: 'gpt-4o',
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id]
          }
        },
        metadata: {
          coachID: coachID
        }
      });

      // Store in database
      await this.prisma.coachAIConfig.upsert({
        where: { coachID },
        create: {
          coachID,
          assistantID: assistant.id,
          vectorStoreID: vectorStore.id,
          assistantName: assistant.name || '',
          instructions: assistant.instructions || '',
          model: assistant.model,
        },
        update: {
          assistantID: assistant.id,
          vectorStoreID: vectorStore.id,
          assistantName: assistant.name || '',
          instructions: assistant.instructions || '',
          model: assistant.model,
        }
      });

      return {
        vectorStoreID: vectorStore.id,
        assistantID: assistant.id,
      };

    } catch (error: any) {
      this.logger.error('Failed to initialize coach AI:', error);
      throw new BadRequestException(`Initialization failed: ${error.message}`);
    }
  }

  async uploadFile(coachID: string, file: Express.Multer.File) {
    this.logger.log(`Uploading file for coach ${coachID}: ${file.originalname}`);

    try {
      // Convert buffer to File object for OpenAI
      const fileBlob = new Blob([file.buffer], { type: file.mimetype });
      const fileToUpload = new File([fileBlob], file.originalname, { type: file.mimetype });

      // Upload to OpenAI
      const openaiFile = await this.openai.files.create({
        file: fileToUpload,
        purpose: 'assistants'
      });

      // Store metadata in database
      await this.prisma.coachKnowledgeFile.create({
        data: {
          coachID,
          openaiFileID: openaiFile.id,
          filename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          status: 'uploaded',
        }
      });

      return {
        fileID: openaiFile.id,
        filename: file.originalname,
        size: file.size,
      };

    } catch (error: any) {
      this.logger.error('File upload failed:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async addFileToVectorStore(coachID: string, fileID: string) {
    this.logger.log(`Adding file ${fileID} to vector store for coach ${coachID}`);

    const config = await this.getCoachConfig(coachID);

    try {
      // Add file to vector store
      const vectorStoreFile = await this.openai.vectorStores.files.create(
        config.vectorStoreID,
        { file_id: fileID }
      );

      // Poll for completion
      let fileStatus = await this.openai.vectorStores.files.retrieve(
        // config.vectorStoreID,
        vectorStoreFile.id,
        {vector_store_id: config.vectorStoreID}
      );

      let attempts = 0;
      while (fileStatus.status === 'in_progress' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        fileStatus = await this.openai.vectorStores.files.retrieve(
          // config.vectorStoreID,
          vectorStoreFile.id,
          {vector_store_id: config.vectorStoreID}
        );
        attempts++;
      }

      if (fileStatus.status === 'completed') {
        // Update database
        await this.prisma.coachKnowledgeFile.updateMany({
          where: { coachID, openaiFileID: fileID },
          data: {
            status: 'indexed',
            vectorStoreFileID: vectorStoreFile.id,
            indexedAt: new Date(),
          }
        });

        return {
          vectorStoreFileID: vectorStoreFile.id,
          status: fileStatus.status,
        };
      } else {
        throw new Error(`File processing failed with status: ${fileStatus.status}`);
      }

    } catch (error: any) {
      this.logger.error('Failed to add file to vector store:', error);

      // Update status in database
      await this.prisma.coachKnowledgeFile.updateMany({
        where: { coachID, openaiFileID: fileID },
        data: { status: 'failed' }
      });

      throw new BadRequestException(`Failed to index file: ${error.message}`);
    }
  }

  async removeFileFromVectorStore(coachID: string, fileID: string) {
    this.logger.log(`Removing file ${fileID} from vector store for coach ${coachID}`);

    const config = await this.getCoachConfig(coachID);
    const fileRecord = await this.prisma.coachKnowledgeFile.findFirst({
      where: { coachID, openaiFileID: fileID }
    });

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    try {
      // Remove from vector store if it was indexed
      if (fileRecord.vectorStoreFileID) {
        await this.openai.vectorStores.files.delete(
          // config.vectorStoreID,
          fileRecord.vectorStoreFileID,
          {vector_store_id: config.vectorStoreID}
        );
      }

      // Optionally delete from OpenAI entirely
      await this.openai.files.delete(fileID);

      // Remove from database
      await this.prisma.coachKnowledgeFile.delete({
        where: { id: fileRecord.id }
      });

      return {
        message: 'File removed successfully',
      };

    } catch (error: any) {
      this.logger.error('Failed to remove file:', error);
      throw new BadRequestException(`Failed to remove file: ${error.message}`);
    }
  }

  async listFiles(coachID: string) {
    const files = await this.prisma.coachKnowledgeFile.findMany({
      where: { coachID },
      orderBy: { uploadedAt: 'desc' }
    });

    return {
      files: files.map(f => ({
        id: f.openaiFileID,
        filename: f.filename,
        size: f.fileSize,
        mimeType: f.mimeType,
        status: f.status,
        uploadedAt: f.uploadedAt,
        indexedAt: f.indexedAt,
      }))
    };
  }

  async createThread(coachID: string) {
    await this.getCoachConfig(coachID);

    try {
      const thread = await this.openai.beta.threads.create();

      // Store thread in database
      await this.prisma.coachReplicaThread.create({
        data: {
          coachID,
          openaiThreadID: thread.id,
          status: 'active',
        }
      });

      return {
        threadID: thread.id,
      };

    } catch (error: any) {
      this.logger.error('Failed to create thread:', error);
      throw new BadRequestException(`Thread creation failed: ${error.message}`);
    }
  }

  async addMessageToThread(coachID: string, threadID: string, message: string) {
    await this.validateThread(coachID, threadID);

    try {
      const threadMessage = await this.openai.beta.threads.messages.create(
        threadID,
        {
          role: 'user',
          content: message
        }
      );

      return {
        messageID: threadMessage.id,
      };

    } catch (error: any) {
      this.logger.error('Failed to add message:', error);
      throw new BadRequestException(`Failed to add message: ${error.message}`);
    }
  }

  async runAssistant(coachID: string, threadID: string) {
    const config = await this.getCoachConfig(coachID);
    await this.validateThread(coachID, threadID);

    try {
      const run = await this.openai.beta.threads.runs.create(
        threadID,
        {
          assistant_id: config.assistantID,
        }
      );

      return {
        runID: run.id,
        status: run.status,
      };

    } catch (error: any) {
      this.logger.error('Failed to run assistant:', error);
      throw new BadRequestException(`Failed to run assistant: ${error.message}`);
    }
  }

  async getRunStatus(coachID: string, threadID: string, runID: string) {
    await this.validateThread(coachID, threadID);

    try {
      const run = await this.openai.beta.threads.runs.retrieve(runID, { thread_id: threadID });

      return {
        status: run.status,
        completedAt: run.completed_at,
        failedAt: run.failed_at,
        lastError: run.last_error,
      };

    } catch (error: any) {
      this.logger.error('Failed to get run status:', error);
      throw new BadRequestException(`Failed to get run status: ${error.message}`);
    }
  }

  async getThreadMessages(coachID: string, threadID: string) {
    await this.validateThread(coachID, threadID);

    try {
      const messages = await this.openai.beta.threads.messages.list(threadID, {
        order: 'desc',
        limit: 20
      });

      return {
        messages: messages.data,
      };

    } catch (error: any) {
      this.logger.error('Failed to get messages:', error);
      throw new BadRequestException(`Failed to get messages: ${error.message}`);
    }
  }

  async streamAssistantResponse(coachID: string, threadID: string, message: string) {
    const config = await this.getCoachConfig(coachID);
    await this.validateThread(coachID, threadID);

    try {
      // Add user message
      await this.openai.beta.threads.messages.create(threadID, {
        role: 'user',
        content: message
      });

      // Create streaming run
      const stream = this.openai.beta.threads.runs.stream(threadID, {
        assistant_id: config.assistantID
      });

      return {
        stream: stream,
      };

    } catch (error: any) {
      this.logger.error('Streaming failed:', error);
      throw new BadRequestException(`Streaming failed: ${error.message}`);
    }
  }

  async getAssistantInfo(coachID: string) {
    const config = await this.getCoachConfig(coachID);

    try {
      const assistant = await this.openai.beta.assistants.retrieve(config.assistantID);

      return {
        assistant: {
          id: assistant.id,
          name: assistant.name,
          model: assistant.model,
          instructions: assistant.instructions,
          tools: assistant.tools,
        }
      };

    } catch (error: any) {
      this.logger.error('Failed to get assistant info:', error);
      throw new BadRequestException(`Failed to get assistant info: ${error.message}`);
    }
  }

  async updateAssistantInstructions(coachID: string, instructions: string) {
    const config = await this.getCoachConfig(coachID);

    try {
      await this.openai.beta.assistants.update(config.assistantID, {
        instructions: instructions
      });

      await this.prisma.coachAIConfig.update({
        where: { coachID },
        data: { instructions }
      });

      return {
        message: 'Instructions updated successfully',
      };

    } catch (error: any) {
      this.logger.error('Failed to update instructions:', error);
      throw new BadRequestException(`Failed to update instructions: ${error.message}`);
    }
  }

  // Helper methods
  private async getCoachConfig(coachID: string) {
    const config = await this.prisma.coachAIConfig.findUnique({
      where: { coachID }
    });

    if (!config || !config.assistantID || !config.vectorStoreID) {
      throw new NotFoundException('Coach AI not initialized. Please initialize first.');
    }

    return config;
  }

  private async validateThread(coachID: string, threadID: string) {
    const thread = await this.prisma.coachReplicaThread.findFirst({
      where: { coachID, openaiThreadID: threadID }
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    return thread;
  }

  private getDefaultInstructions(): string {
    return `You are an AI assistant trained on this coach's unique style, methodology, and approach.

When answering questions:
1. Search through the uploaded documents to understand the coach's voice and style
2. Respond as if you ARE the coach - use their tone, language, and approach
3. Reference specific examples from their documents when relevant
4. If you don't find relevant information in the documents, say so honestly
5. Maintain the coach's personality and values in every response

Always be authentic to the coach's documented style and methodology.`;
  }

  async getCoachKnowledgeProfile(coachID: string) {
    // This would typically aggregate knowledge from multiple sources
    // For now, returning a basic structure
    return {
      personality: {
        communicationStyle: 'professional and supportive',
        responseLength: 'moderate',
        commonPhrases: ['Let\'s explore this together', 'Great question'],
        preferredGreetings: ['Hi', 'Hello'],
        preferredClosings: ['Best regards', 'Looking forward to hearing from you'],
      },
      businessContext: {
        industry: 'coaching',
        services: ['1-on-1 coaching', 'group programs'],
        expertise: ['leadership', 'career development'],
      },
      writingStyle: {
        formalityLevel: 7,
        useOfEmojis: 'minimal',
      }
    };
  }
}
