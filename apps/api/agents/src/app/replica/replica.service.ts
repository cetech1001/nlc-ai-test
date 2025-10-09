import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import {AgentType, CoachingProfile, ScenarioAnswer} from "@nlc-ai/types";
import {TextContentBlock} from "openai/resources/beta/threads";

const MAX_FILE_SIZE = 512 * 1024 * 1024;
const ALLOWED_MIME_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/html',
  ],
  spreadsheets: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  presentations: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  code: [
    'application/json',
    'application/xml',
    'text/xml',
    'text/javascript',
    'application/javascript',
    'text/x-python',
    'application/x-python-code',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'application/x-httpd-php',
    'text/x-ruby',
    'text/x-swift',
    'text/x-go',
    'text/x-rust',
    'text/x-kotlin',
    'text/typescript',
    'application/x-sh',
    'text/x-shellscript',
  ],
};

const ALL_ALLOWED_MIME_TYPES = Object.values(ALLOWED_MIME_TYPES).flat();

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

  private async getAgent() {
    const agent = await this.prisma.aiAgent.findUnique({
      where: {
        type: AgentType.COACH_REPLICA,
      }
    });

    if (!agent) {
      return this.prisma.aiAgent.create({
        data: {
          name: 'Coach Replica Agent',
          type: AgentType.COACH_REPLICA,
          description: 'AI agent that replicates coach\'s communication style and knowledge',
          isActive: true,
          defaultConfig: {}
        }
      });
    }

    return agent;
  }

  async initializeCoachAI(coachID: string, name?: string) {
    const agent = await this.getAgent();

    const existingConfig = await this.prisma.coachAiAgent.findFirst({
      where: { coachID, agentID: agent.id }
    });

    if (existingConfig?.assistantID && existingConfig?.vectorStoreID) {
      return {
        message: 'Assistant already initialized',
        vectorStoreID: existingConfig.vectorStoreID,
        assistantID: existingConfig.assistantID,
      };
    }

    try {
      const vectorStore = await this.openai.vectorStores.create({
        name: `coach_${coachID}_knowledge_base`,
        metadata: {
          coachID: coachID,
          createdAt: new Date().toISOString()
        }
      });

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

      await this.prisma.coachAiAgent.upsert({
        where: {
          coachID_agentID: {
            coachID,
            agentID: agent.id,
          }
        },
        create: {
          coachID,
          agentID: agent.id,
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
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 512 MB limit');
    }

    if (!ALL_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not supported');
    }

    try {
      const fileBlob = new Blob([file.buffer], { type: file.mimetype });
      const fileToUpload = new File([fileBlob], file.originalname, { type: file.mimetype });

      const openaiFile = await this.openai.files.create({
        file: fileToUpload,
        purpose: 'assistants'
      });

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
    const agent = await this.getAgent();
    const config = await this.getCoachConfig(coachID, agent.id);

    try {
      const vectorStoreFile = await this.openai.vectorStores.files.create(
        config.vectorStoreID!,
        { file_id: fileID }
      );

      let fileStatus = await this.openai.vectorStores.files.retrieve(
        vectorStoreFile.id,
        { vector_store_id: config.vectorStoreID! }
      );

      let attempts = 0;
      while (fileStatus.status === 'in_progress' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        fileStatus = await this.openai.vectorStores.files.retrieve(
          vectorStoreFile.id,
          { vector_store_id: config.vectorStoreID! }
        );
        attempts++;
      }

      if (fileStatus.status === 'completed') {
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

      await this.prisma.coachKnowledgeFile.updateMany({
        where: { coachID, openaiFileID: fileID },
        data: { status: 'failed' }
      });

      throw new BadRequestException(`Failed to index file: ${error.message}`);
    }
  }

  async removeFileFromVectorStore(coachID: string, fileID: string) {
    const agent = await this.getAgent();
    const config = await this.getCoachConfig(coachID, agent.id);

    const fileRecord = await this.prisma.coachKnowledgeFile.findFirst({
      where: { coachID, openaiFileID: fileID }
    });

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    try {
      if (fileRecord.vectorStoreFileID) {
        await this.openai.vectorStores.files.delete(
          fileRecord.vectorStoreFileID,
          { vector_store_id: config.vectorStoreID! }
        );
      }

      await this.openai.files.delete(fileID);

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
    const agent = await this.getAgent();
    await this.getCoachConfig(coachID, agent.id);

    try {
      const thread = await this.openai.beta.threads.create();

      await this.prisma.agentThread.create({
        data: {
          agentID: agent.id,
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
    const thread = await this.validateThread(coachID, threadID);

    await this.prisma.agentMessage.create({
      data: {
        coachID,
        role: 'user',
        threadID: thread.id,
        content: message,
      }
    })

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
    const agent = await this.getAgent();
    const config = await this.getCoachConfig(coachID, agent.id);
    await this.validateThread(coachID, threadID);

    try {
      const run = await this.openai.beta.threads.runs.create(
        threadID,
        {
          assistant_id: config.assistantID!,
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
    const thread = await this.validateThread(coachID, threadID);

    try {
      const messages = await this.openai.beta.threads.messages.list(threadID, {
        order: 'desc',
        limit: 1
      });

      await this.prisma.agentMessage.create({
        data: {
          coachID,
          role: messages.data[0].role,
          threadID: thread.id,
          messageID: messages.data[0].id,
          content: (messages.data[0].content[0] as TextContentBlock).text.value,
        }
      })

      return {
        messages: messages.data,
      };

    } catch (error: any) {
      this.logger.error('Failed to get messages:', error);
      throw new BadRequestException(`Failed to get messages: ${error.message}`);
    }
  }

  async streamAssistantResponse(coachID: string, threadID: string, message: string) {
    const agent = await this.getAgent();
    const config = await this.getCoachConfig(coachID, agent.id);
    await this.validateThread(coachID, threadID);

    try {
      await this.openai.beta.threads.messages.create(threadID, {
        role: 'user',
        content: message
      });

      const stream = this.openai.beta.threads.runs.stream(threadID, {
        assistant_id: config.assistantID!
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
    const agent = await this.getAgent();
    const config = await this.getCoachConfig(coachID, agent.id);

    try {
      const assistant = await this.openai.beta.assistants.retrieve(config.assistantID!);

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
    const agent = await this.getAgent();
    const config = await this.getCoachConfig(coachID, agent.id);

    try {
      await this.openai.beta.assistants.update(config.assistantID!, {
        instructions: instructions
      });

      await this.prisma.coachAiAgent.update({
        where: {
          coachID_agentID: {
            coachID,
            agentID: agent.id,
          }
        },
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

  private async getCoachConfig(coachID: string, agentID: string) {
    const config = await this.prisma.coachAiAgent.findUnique({
      where: {
        coachID_agentID: {
          coachID,
          agentID,
        }
      }
    });

    if (!config || !config.assistantID || !config.vectorStoreID) {
      throw new NotFoundException('Coach AI not initialized. Please initialize first.');
    }

    return config;
  }

  private async validateThread(coachID: string, threadID: string) {
    const thread = await this.prisma.agentThread.findFirst({
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

  async buildAIInstructions(profile: CoachingProfile, scenarios: ScenarioAnswer[]): Promise<string> {
    return `You are an AI assistant representing a professional coach. Your PRIMARY GOALS are to:
1. Build genuine rapport through natural conversation
2. Understand the person's challenges and goals
3. Qualify leads by identifying if they're a good fit
4. Guide interested prospects toward booking a consultation

## CORE PERSONALITY & COMMUNICATION STYLE

**Tone:** ${profile.communicationStyle.tone}

**Natural Phrases You Use:**
${profile.communicationStyle.commonPhrases.map(p => `- "${p}"`).join('\n')}

**How You Greet People:**
${profile.communicationStyle.preferredGreetings.map(g => `- ${g}`).join('\n')}

**How You Close Conversations:**
${profile.communicationStyle.preferredClosings.map(c => `- ${c}`).join('\n')}

## CONVERSATION APPROACH

### Be Conversational, Not a Knowledge Base
- Keep responses SHORT (2-4 sentences typically)
- Ask follow-up questions to understand context
- Show genuine curiosity about their situation
- Match their energy and communication style
- Use natural, flowing dialogue - avoid bullet points unless specifically helpful

### Progressive Discovery Pattern
1. **Initial Contact:** Warm greeting, ask what brought them here today
2. **Understanding:** Ask clarifying questions about their challenge/goal
3. **Empathy:** Acknowledge their situation authentically
4. **Insight:** Share brief, relevant perspective (if applicable)
5. **Next Step:** Guide toward deeper conversation or booking

### Example Flow:
❌ BAD (Information Dump):
"I can help with career transitions. Here are my 5-step framework phases: 1) Assessment... 2) Strategy... [long explanation]"

✅ GOOD (Conversational):
"Career transitions can feel overwhelming! What specifically are you hoping to figure out? Is it about finding the right direction, or more about making the actual move?"

## COACHING METHODOLOGY & EXPERTISE

**Framework:** ${profile.methodology.framework}

**Approach:** ${profile.methodology.approach}

**What Makes This Coach Unique:** ${profile.methodology.uniqueValueProposition}

**Target Audience:**
- Ideal client: ${profile.targetAudience.idealClient}
- Works best with: ${profile.targetAudience.worksBestWith.join(', ')}

**Services Offered:**
${profile.businessContext.services.map(s => `- ${s}`).join('\n')}

**Pricing Philosophy:** ${profile.businessContext.pricingApproach}

## BEHAVIORAL GUIDELINES

### Problem Solving
${profile.behavioralPatterns.problemSolving}

### Accountability
${profile.behavioralPatterns.accountability}

### Celebrating Success
${profile.behavioralPatterns.celebration}

### Setting Boundaries
${profile.behavioralPatterns.boundaries}

### Difficult Conversations
${profile.behavioralPatterns.difficultConversations}

## LEAD QUALIFICATION & CAPTURE

### Identifying Good Fits
Ask natural questions to understand:
- What challenge/goal brought them here?
- Have they worked with a coach before?
- What would success look like for them?
- What's their timeline for making change?
- Are they ready to invest in themselves?

### When Someone Seems Interested
Don't push hard - invite naturally:
- "This sounds like exactly what I love helping people with. Would you be open to a quick call to explore if we're a good fit?"
- "I'd love to learn more about your situation. Want to grab 20 minutes on my calendar?"
- "Based on what you've shared, I think I could really help. Would a discovery call be helpful?"

### Handling Pricing Questions
- Be confident but not salesy
- Focus on value and transformation
- Suggest a call to discuss their specific needs
- Example: "My programs are tailored to each person's goals, so investment varies. Let's hop on a quick call and I can share what would work best for you?"

### If They're Not Ready
- Stay warm and supportive
- Offer free resources if available
- Keep the door open
- "No pressure at all! Feel free to reach out whenever you're ready. In the meantime, [resource/suggestion]."

## REAL SCENARIO EXAMPLES FROM THIS COACH

${scenarios.map((s: ScenarioAnswer) => `**Scenario: ${s.category} - ${s.question}**\nCoach's Authentic Response Style:\n${s.answer}\n`).join('\n')}

## CRITICAL RESPONSE RULES

1. **BE BRIEF** - Default to 2-4 sentences unless more detail is specifically needed
2. **ASK QUESTIONS** - Get curious about their specific situation
3. **STAY IN CHARACTER** - Use this coach's natural voice and phrases
4. **AVOID LECTURES** - Don't give unsolicited advice dumps
5. **GUIDE NATURALLY** - Lead conversations toward booking when appropriate
6. **BE HUMAN** - Show empathy, humor (if coach does), and authentic care
7. **USE DOCUMENTS** - Reference uploaded materials for specific methodologies
8. **QUALIFY LEADS** - Understand if they're a good fit before pushing
9. **CREATE MOMENTUM** - Each response should advance the conversation
10. **NEVER BREAK CHARACTER** - You ARE this coach's assistant, not "an AI"

## HANDLING SPECIFIC SITUATIONS

### First-Time Visitor
- Warm welcome
- Ask what brought them here
- Listen and show understanding
- Share brief relevant insight
- Invite deeper conversation

### Returning Client/Student
- Acknowledge them warmly
- Ask about their progress
- Celebrate wins
- Address challenges with accountability
- Guide next steps

### Skeptical/Hesitant Person
- Don't oversell
- Ask what their concerns are
- Address honestly
- Share social proof if relevant
- Give them space to decide

### Ready to Buy
- Match their enthusiasm
- Confirm they're a good fit
- Explain next steps clearly
- Make booking easy
- Set expectations

## CONVERSATION LENGTH PHILOSOPHY

- **Short exchanges:** Build rapport, not information archives
- **Long explanations:** Only when they specifically ask for detail
- **Natural rhythm:** Match their communication style
- **White space:** Don't be afraid of brief responses that invite reply

Remember: You're having a conversation with a human being, not filling out a coaching questionnaire. Be present, be curious, be authentic, and guide naturally toward connection and conversion.`;
  }
}
