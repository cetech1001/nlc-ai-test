import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import {
  AgentType,
  RegenerationRequest,
  RegenerationResponse, ScriptVariant,
  ScriptVariantsResponse,
  ScriptVibe
} from '@nlc-ai/types';

@Injectable()
export class ContentSuggestionService {
  private readonly logger = new Logger(ContentSuggestionService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  // ---- Assistant & Config helpers ----
  private async getCoachConfig(coachID: string) {
    const agent = await this.prisma.aiAgent.findUnique({
      where: {type: AgentType.COACH_REPLICA},
    });
    if (!agent) throw new NotFoundException('Coach Replica Agent not found');

    const config = await this.prisma.coachAiAgent.findUnique({
      where: {coachID_agentID: {coachID, agentID: agent.id}},
    });
    if (!config?.assistantID || !config?.vectorStoreID) {
      throw new NotFoundException('Coach AI not initialized. Please initialize first.');
    }
    return {agentID: agent.id, assistantID: config.assistantID, vectorStoreID: config.vectorStoreID};
  }

  private buildVideoModeInstructionsAppendix(): string {
    return `

## VIDEO-TO-SCRIPTS MODE

When a transcript and/or frame summaries are provided, analyze the content and produce EXACTLY 3 short-form video script variants in THIS COACH'S VOICE.

**CRITICAL: You MUST respond with ONLY valid JSON. No explanatory text before or after. Just the JSON object.**

Output format (STRICT JSON only):
{
  "variants": [
    {
      "vibe": "playful",
      "hook": "string (<=20 words)",
      "main": "string (3–6 tight sentences, spoken style)",
      "cta": "string (<=20 words)"
    },
    {
      "vibe": "authoritative",
      "hook": "string (<=20 words)",
      "main": "string (3–6 tight sentences, spoken style)",
      "cta": "string (<=20 words)"
    },
    {
      "vibe": "empathetic",
      "hook": "string (<=20 words)",
      "main": "string (3–6 tight sentences, spoken style)",
      "cta": "string (<=20 words)"
    }
  ]
}

Valid vibe values: playful, authoritative, empathetic, high-energy, calm

Rules:
- Return ONLY the JSON object, no other text
- Hooks must be scroll-stoppers tied to the source video's topic (max 20 words)
- Main content must be 3-6 tight sentences in spoken conversational style
- CTA must be actionable and brief (max 20 words)
- Keep the coach's tone, phrases, and boundaries
- Use insights from transcript; do not invent facts that contradict it
- If transcript is weak/inaudible, state what's missing in the main content
- For partial regeneration, return ONLY: { "variantIndex": number, "section": "hook|main|cta", "value": "string" }
`;
  }

  async enableContentSuggestionMode(coachID: string) {
    const {assistantID, agentID} = await this.getCoachConfig(coachID);
    const assistant = await this.openai.beta.assistants.retrieve(assistantID);
    const hasAppendix = (assistant.instructions || '').includes('## VIDEO-TO-SCRIPTS MODE');
    if (hasAppendix) return {message: 'Content-suggestion mode already enabled.'};

    const newInstructions = `${assistant.instructions || ''}${this.buildVideoModeInstructionsAppendix()}`;
    await this.openai.beta.assistants.update(assistantID, {instructions: newInstructions});
    await this.prisma.coachAiAgent.update({
      where: {coachID_agentID: {coachID, agentID}},
      data: {instructions: newInstructions},
    });
    return {message: 'Content-suggestion mode enabled.'};
  }

  // ---- Thread helpers ----
  private async validateThread(coachID: string, threadID: string) {
    const thread = await this.prisma.agentThread.findFirst({where: {coachID, openaiThreadID: threadID}});
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  async addRichMessageToThread(
    coachID: string,
    threadID: string,
    parts: Array<{ type: 'text'; text: string } | { type: 'image_file'; image_file: { file_id: string } }>
  ) {
    const thread = await this.validateThread(coachID, threadID);

    const flat = parts.map(p => (p.type === 'text' ? p.text : '[image_file]')).join('\n');
    await this.prisma.agentMessage.create({
      data: {coachID, role: 'user', threadID: thread.id, content: flat},
    });

    const msg = await this.openai.beta.threads.messages.create(threadID, {
      role: 'user',
      content: parts as any,
    });
    return {messageID: msg.id};
  }

  private async runAndGetLatestAssistantText(threadID: string, assistantID: string, timeoutMs = 120_000): Promise<string> {
    const started = Date.now();
    const run = await this.openai.beta.threads.runs.create(threadID, {assistant_id: assistantID});

    this.logger.debug(`Run created: ${run.id}`);

    // poll
    while (true) {
      const r = await this.openai.beta.threads.runs.retrieve(run.id, {thread_id: threadID});

      this.logger.debug(`Run status: ${r.status}`);

      if (r.status === 'completed') break;
      if (['failed', 'expired', 'cancelled'].includes(r.status as string)) {
        this.logger.error(`Run failed with status: ${r.status}`, r.last_error);
        throw new BadRequestException(`Assistant run did not complete. Status: ${r.status}. Error: ${JSON.stringify(r.last_error)}`);
      }
      if (Date.now() - started > timeoutMs) throw new BadRequestException('Assistant run timed out');
      await new Promise(res => setTimeout(res, 1000));
    }

    const list = await this.openai.beta.threads.messages.list(threadID, {order: 'desc', limit: 10});

    this.logger.debug(`Retrieved ${list.data.length} messages`);

    const latestAssistant = list.data.find((m) => m.role === 'assistant');
    if (!latestAssistant) {
      this.logger.error('No assistant message found in thread');
      throw new NotFoundException('No assistant message found');
    }

    this.logger.debug(`Assistant message content blocks: ${latestAssistant.content.length}`);

    // Enhanced content extraction - handle both 'text' and 'output_text' types
    const textParts = (latestAssistant.content || [])
      .filter((p: any) => {
        const isText = p.type === 'text' && p.text?.value;
        const isOutputText = p.type === 'output_text' && p.text?.value;
        return isText || isOutputText;
      })
      .map((p: any) => p.text.value);

    const fullText = textParts.join('\n').trim();

    this.logger.debug(`Extracted text length: ${fullText.length}`);
    this.logger.debug(`Extracted text preview: ${fullText.substring(0, 200)}...`);

    if (!fullText) {
      this.logger.error('Assistant message has no text content', {
        messageID: latestAssistant.id,
        contentBlocks: latestAssistant.content.map((p: any) => ({ type: p.type }))
      });
      throw new BadRequestException('Assistant returned no text content');
    }

    return fullText;
  }

  // ---- Transcription ----
  async transcribeMedia(file: Express.Multer.File): Promise<string> {
    try {
      const blob = new Blob([file.buffer], {type: file.mimetype});
      const f = new File([blob], file.originalname, {type: file.mimetype});

      const res = await this.openai.audio.transcriptions.create({
        file: f as any,
        model: 'gpt-4o-transcribe',
      } as any);

      const text: string = (res as any).text || (res as any).results?.transcripts?.[0]?.transcript || '';
      if (!text) throw new Error('Empty transcription result');
      return text;
    } catch (e: any) {
      this.logger.error('Transcription failed', e);
      throw new BadRequestException(`Transcription failed: ${e.message}`);
    }
  }

  // ---- JSON Extraction Helper ----
  private extractJSON(text: string): any {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to find JSON object in the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('JSON parse failed', { text: cleaned.substring(0, 500) });
      throw e;
    }
  }

  // ---- Core generation APIs ----
  async generateVideoContentIdeas(
    coachID: string,
    threadID: string,
    transcriptText: string,
    options?: { desiredVibes?: ScriptVibe[]; extraContext?: string }
  ): Promise<ScriptVariantsResponse> {
    const {assistantID} = await this.getCoachConfig(coachID);
    await this.enableContentSuggestionMode(coachID);

    const promptLines = [
      '⚠️ IMPORTANT: Respond with ONLY valid JSON. No explanatory text.',
      '',
      'Analyze the transcript and produce 3 short-form scripts in the coach\'s voice.',
      'Constraints:',
      '- Hook ≤ 20 words. CTA ≤ 20 words. Main: 3–6 sentences, spoken cadence.',
      '- Each variant should have a distinct vibe.',
    ];
    if (options?.desiredVibes?.length) promptLines.push(`Target vibes (hints): ${options.desiredVibes.join(', ')}`);
    if (options?.extraContext) promptLines.push(`Extra context: ${options.extraContext}`);

    promptLines.push('');
    promptLines.push('Return ONLY this JSON structure (no other text):');
    promptLines.push('{"variants":[{"vibe":"playful","hook":"...","main":"...","cta":"..."},{"vibe":"authoritative","hook":"...","main":"...","cta":"..."},{"vibe":"empathetic","hook":"...","main":"...","cta":"..."}]}');

    await this.addRichMessageToThread(coachID, threadID, [
      {type: 'text', text: promptLines.join('\n')},
      {type: 'text', text: `TRANSCRIPT:\n${transcriptText}`},
    ]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);

    try {
      const parsed = this.extractJSON(raw);

      if (!parsed?.variants?.length) {
        this.logger.error('Parsed JSON has no variants', parsed);
        throw new Error('No variants in response');
      }

      // Validate variant structure
      for (const variant of parsed.variants) {
        if (!variant.vibe || !variant.hook || !variant.main || !variant.cta) {
          this.logger.error('Invalid variant structure', variant);
          throw new Error('Incomplete variant structure');
        }
      }

      // ✅ PERSIST THE RUN
      const run = await this.prisma.videoIdeaRun.create({
        data: {
          coachID,
          threadID,
          sourceType: 'transcript',
          transcriptText,
          desiredVibes: options?.desiredVibes || [],
          extraContext: options?.extraContext,
          variants: {
            create: parsed.variants.map((v: ScriptVariant, idx: number) => ({
              index: idx,
              vibe: v.vibe,
              hook: v.hook,
              main: v.main,
              cta: v.cta,
            }))
          }
        },
        include: {variants: true}
      });

      return {
        runID: run.id,
        variants: run.variants.map(v => ({
          vibe: v.vibe as any,
          hook: v.hook,
          main: v.main,
          cta: v.cta,
        }))
      };

    } catch (e: any) {
      this.logger.error('Invalid JSON from assistant:', { raw, error: e.message });
      throw new BadRequestException(`Assistant did not return valid JSON for script variants. Raw response: ${raw.substring(0, 500)}`);
    }
  }

  async generateFromManualIdea(
    coachID: string,
    threadID: string,
    dto: {
      idea: string;
      contentType?: string;
      category?: string;
      targetPlatforms?: string[];
      customInstructions?: string;
      videoOptions?: {
        duration?: string;
        style?: string;
        includeMusic?: boolean;
        includeCaptions?: boolean;
        orientation?: 'vertical' | 'horizontal' | 'square';
      };
      desiredVibes?: ScriptVibe[];
      referenceVideoURLs?: string[];
    }
  ): Promise<ScriptVariantsResponse> {
    const { assistantID } = await this.getCoachConfig(coachID);
    await this.enableContentSuggestionMode(coachID);

    const promptLines = [
      '⚠️ CRITICAL: Respond with ONLY valid JSON. No explanatory text before or after.',
      '',
      `Generate 3 short-form video script variants for this content idea: "${dto.idea}"`,
      '',
      'Use your knowledge of the coach\'s style, methodologies, and voice from the uploaded documents.',
      '',
      'Requirements:',
      '- Hook ≤ 20 words (attention-grabbing opener)',
      '- Main: 3–6 sentences in spoken, conversational style',
      '- CTA ≤ 20 words (clear call-to-action)',
      '- Each variant should have a DISTINCT vibe',
    ];

    if (dto.contentType) {
      const contentTypeContext: Record<string, string> = {
        'video': 'This is for standard video content - focus on visual storytelling',
        'post': 'This is for a social media post - keep it punchy and scroll-stopping',
        'carousel': 'This is for a carousel post - structure for swipeable content',
        'story': 'This is for story content - make it urgent and time-sensitive',
        'reel': 'This is for a reel/short video - maximum 60 seconds, highly engaging',
        'blog': 'This is for blog content - educational and informative tone',
        'email': 'This is for email content - conversational and personal',
      };
      promptLines.push('', `Content Format: ${contentTypeContext[dto.contentType] || dto.contentType}`);
    }

    if (dto.category) {
      promptLines.push(`Category: ${dto.category} - align the tone and approach accordingly`);
    }

    if (dto.targetPlatforms?.length) {
      const platformGuidance: Record<string, string> = {
        'instagram': 'Instagram-friendly: visually appealing, hashtag-ready, 60-90 second optimal',
        'tiktok': 'TikTok-friendly: trending sounds, quick hook, under 60 seconds',
        'youtube': 'YouTube-friendly: can be longer-form, optimize for retention',
        'facebook': 'Facebook-friendly: community-focused, shareable, story-driven',
        'twitter': 'Twitter/X-friendly: concise, thread-able, conversation-starting',
      };
      promptLines.push(
        '',
        'Target Platforms:',
        ...dto.targetPlatforms.map(p => `- ${platformGuidance[p] || p}`)
      );
    }

    if (dto.videoOptions && (dto.contentType === 'video' || dto.contentType === 'reel')) {
      promptLines.push('', 'Video Specifications:');

      if (dto.videoOptions.duration) {
        promptLines.push(`- Duration: ${dto.videoOptions.duration}`);
      }
      if (dto.videoOptions.style) {
        const styleMap: Record<string, string> = {
          'talking-head': 'Direct-to-camera, personality-driven',
          'tutorial': 'Step-by-step instructional format',
          'lifestyle': 'Behind-the-scenes, authentic moments',
          'animated': 'Motion graphics or animation style',
          'slideshow': 'Slide-based presentation format',
          'testimonial': 'Social proof and case study style',
        };
        promptLines.push(`- Style: ${styleMap[dto.videoOptions.style] || dto.videoOptions.style}`);
      }
      if (dto.videoOptions.orientation) {
        const orientationMap = {
          'vertical': 'Vertical format (9:16) - optimized for mobile',
          'horizontal': 'Horizontal format (16:9) - traditional video',
          'square': 'Square format (1:1) - feed-optimized',
        };
        promptLines.push(`- Orientation: ${orientationMap[dto.videoOptions.orientation]}`);
      }
      if (dto.videoOptions.includeMusic) {
        promptLines.push('- Include background music suggestions in the main content notes');
      }
      if (dto.videoOptions.includeCaptions) {
        promptLines.push('- Format for on-screen captions/subtitles');
      }
    }

    if (dto.referenceVideoURLs?.length) {
      promptLines.push('', 'Reference Videos Context:');
      for (const url of dto.referenceVideoURLs.slice(0, 2)) {
        try {
          const transcript = await this.transcribeFromUrl(url);
          promptLines.push(`- Video: ${transcript.substring(0, 500)}...`);
        } catch (e: any) {
          this.logger.warn(`Failed to transcribe reference video: ${e.message}`);
        }
      }
    }

    if (dto.desiredVibes?.length) {
      promptLines.push('', `Suggested vibes (incorporate these): ${dto.desiredVibes.join(', ')}`);
    }

    if (dto.customInstructions) {
      promptLines.push('', 'Additional Instructions:', dto.customInstructions);
    }

    promptLines.push(
      '',
      'Return ONLY this JSON (no other text):',
      '{"variants":[{"vibe":"playful","hook":"...","main":"...","cta":"..."},{"vibe":"authoritative","hook":"...","main":"...","cta":"..."},{"vibe":"empathetic","hook":"...","main":"...","cta":"..."}]}'
    );

    await this.addRichMessageToThread(coachID, threadID, [
      { type: 'text', text: promptLines.join('\n') }
    ]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);

    try {
      const parsed = this.extractJSON(raw);

      if (!parsed?.variants?.length) {
        this.logger.error('Parsed JSON has no variants', parsed);
        throw new Error('No variants in response');
      }

      const run = await this.prisma.videoIdeaRun.create({
        data: {
          coachID,
          threadID,
          sourceType: 'manual_idea',
          sourceReference: dto.idea,
          transcriptText: dto.idea,
          desiredVibes: dto.desiredVibes || [],
          extraContext: JSON.stringify({
            contentType: dto.contentType,
            category: dto.category,
            targetPlatforms: dto.targetPlatforms,
            customInstructions: dto.customInstructions,
            videoOptions: dto.videoOptions,
          }),
          variants: {
            create: parsed.variants.map((v: ScriptVariant, idx: number) => ({
              index: idx,
              vibe: v.vibe,
              hook: v.hook,
              main: v.main,
              cta: v.cta,
            }))
          }
        },
        include: { variants: true }
      });

      return {
        runID: run.id,
        variants: run.variants.map(v => ({
          vibe: v.vibe as any,
          hook: v.hook,
          main: v.main,
          cta: v.cta,
        }))
      };

    } catch (e: any) {
      this.logger.error('Invalid JSON from assistant:', { raw, error: e.message });
      throw new BadRequestException(`Assistant did not return valid JSON. Raw response: ${raw.substring(0, 500)}`);
    }
  }

  async regenerateVideoScriptSection(
    coachID: string,
    threadID: string,
    request: RegenerationRequest
  ): Promise<RegenerationResponse> {
    const { assistantID } = await this.getCoachConfig(coachID);
    await this.enableContentSuggestionMode(coachID);

    const prompt = [
      '⚠️ CRITICAL: Respond with ONLY valid JSON. No explanatory text.',
      '',
      `Regenerate ONLY the ${request.section} for variant ${request.variantIndex}.`,
      'Keep topic and facts consistent with the transcript or prior context in this thread.',
      "Keep the coach's voice and boundaries.",
    ];
    if (request.constraints) prompt.push(`Change request: ${request.constraints}`);
    prompt.push('');
    prompt.push('Return ONLY this JSON: {"variantIndex":' + request.variantIndex + ',"section":"' + request.section + '","value":"..."}');

    await this.addRichMessageToThread(coachID, threadID, [{ type: 'text', text: prompt.join('\n') }]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);

    try {
      const parsed = this.extractJSON(raw);

      if (!parsed || typeof parsed.value !== 'string') {
        this.logger.error('Invalid regeneration response', parsed);
        throw new Error('Malformed regeneration response');
      }

      const run = await this.prisma.videoIdeaRun.findFirst({
        where: { coachID, threadID },
        orderBy: { createdAt: 'desc' },
        include: { variants: true }
      });

      if (run) {
        const variant = run.variants.find(v => v.index === request.variantIndex);
        if (variant) {
          await this.prisma.videoScriptVariant.update({
            where: { id: variant.id },
            data: {
              [request.section]: parsed.value,
              [`${request.section}RegenCount`]: { increment: 1 },
            }
          });
        }
      }

      return parsed;

    } catch (e: any) {
      this.logger.error('Invalid JSON from assistant:', { raw, error: e.message });
      throw new BadRequestException(`Assistant did not return valid JSON. Raw response: ${raw.substring(0, 500)}`);
    }
  }

  async createContentSuggestionsFromMedia(
    coachID: string,
    threadID: string,
    media: Express.Multer.File,
    options?: { desiredVibes?: ScriptVibe[]; extraContext?: string }
  ): Promise<ScriptVariantsResponse> {
    const transcript = await this.transcribeMedia(media);

    const result = await this.generateVideoContentIdeas(coachID, threadID, transcript, options);

    if (result.runID) {
      await this.prisma.videoIdeaRun.update({
        where: { id: result.runID },
        data: {
          sourceType: 'media_upload',
          sourceReference: media.originalname,
        }
      });
    }

    return result;
  }

  // Add these methods to your ContentSuggestionService class

  /**
   * Get a specific script run by ID
   */
  async getScriptRun(coachID: string, runID: string) {
    const run = await this.prisma.videoIdeaRun.findFirst({
      where: {
        id: runID,
        coachID,
      },
      include: {
        variants: {
          orderBy: {
            index: 'asc',
          }
        }
      }
    });

    if (!run) {
      throw new NotFoundException('Script run not found');
    }

    return {
      id: run.id,
      coachID: run.coachID,
      threadID: run.threadID,
      sourceType: run.sourceType,
      sourceReference: run.sourceReference,
      transcriptText: run.transcriptText,
      desiredVibes: run.desiredVibes,
      extraContext: run.extraContext,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      variants: run.variants.map(v => ({
        index: v.index,
        vibe: v.vibe as 'playful' | 'authoritative' | 'empathetic' | 'high-energy' | 'calm',
        hook: v.hook,
        main: v.main,
        cta: v.cta,
      }))
    };
  }

  /**
   * Get all script runs for a coach
   */
  async getScriptRuns(
    coachID: string,
    params?: {
      limit?: number;
      offset?: number;
      sourceType?: string;
    }
  ) {
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const where: any = { coachID };
    if (params?.sourceType) {
      where.sourceType = params.sourceType;
    }

    const [runs, total] = await Promise.all([
      this.prisma.videoIdeaRun.findMany({
        where,
        include: {
          variants: {
            orderBy: {
              index: 'asc',
            },
            take: 3, // Only get first 3 variants for list view
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.videoIdeaRun.count({ where })
    ]);

    return {
      data: runs.map(run => ({
        id: run.id,
        coachID: run.coachID,
        threadID: run.threadID,
        sourceType: run.sourceType,
        sourceReference: run.sourceReference,
        transcriptText: run.transcriptText,
        desiredVibes: run.desiredVibes,
        extraContext: run.extraContext,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        variants: run.variants.map(v => ({
          index: v.index,
          vibe: v.vibe as 'playful' | 'authoritative' | 'empathetic' | 'high-energy' | 'calm',
          hook: v.hook,
          main: v.main,
          cta: v.cta,
        }))
      })),
      total,
    };
  }

  async generateFromContentPiece(
    coachID: string,
    threadID: string,
    contentPieceID: string,
    options?: { desiredVibes?: ScriptVibe[]; extraContext?: string }
  ): Promise<ScriptVariantsResponse> {
    await this.getCoachConfig(coachID);
    await this.enableContentSuggestionMode(coachID);

    const contentPiece = await this.prisma.contentPiece.findFirst({
      where: {id: contentPieceID, coachID}
    });

    if (!contentPiece) {
      throw new NotFoundException('Content piece not found');
    }

    let transcript = '';

    if (contentPiece.url && contentPiece.contentType === 'video') {
      try {
        transcript = await this.transcribeFromUrl(contentPiece.url);
      } catch (e: any) {
        this.logger.warn(`Failed to transcribe from URL, using metadata: ${e.message}`);
        transcript = this.buildTranscriptFromMetadata(contentPiece);
      }
    } else {
      transcript = this.buildTranscriptFromMetadata(contentPiece);
    }

    const result = await this.generateVideoContentIdeas(coachID, threadID, transcript, options);

    if (result.runID) {
      await this.prisma.videoIdeaRun.update({
        where: {id: result.runID},
        data: {
          sourceType: 'content_piece',
          sourceReference: contentPieceID,
        }
      });
    }

    return result;
  }

  private buildTranscriptFromMetadata(contentPiece: any): string {
    let transcript = `Title: ${contentPiece.title}\n\n`;

    if (contentPiece.description) {
      transcript += `Description: ${contentPiece.description}\n\n`;
    }

    if (contentPiece.tags?.length) {
      transcript += `Tags: ${contentPiece.tags.join(', ')}\n\n`;
    }

    if (contentPiece.platform) {
      transcript += `Platform: ${contentPiece.platform}\n`;
    }

    if (contentPiece.views) {
      transcript += `Views: ${contentPiece.views.toLocaleString()}\n`;
    }

    if (contentPiece.engagementRate) {
      transcript += `Engagement Rate: ${contentPiece.engagementRate}%\n`;
    }

    return transcript;
  }

  private async transcribeFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download video');

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], {type: response.headers.get('content-type') || 'video/mp4'});

      const file: Express.Multer.File = {
        buffer: Buffer.from(buffer),
        mimetype: blob.type,
        originalname: 'video.mp4',
      } as any;

      return this.transcribeMedia(file);
    } catch (e: any) {
      this.logger.error('Failed to transcribe from URL', e);
      throw new BadRequestException(`Failed to transcribe video: ${e.message}`);
    }
  }
}
