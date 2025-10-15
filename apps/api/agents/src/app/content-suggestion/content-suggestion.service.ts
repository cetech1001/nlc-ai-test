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

Output STRICT JSON (no prose):
{
  "variants": [
    {
      "vibe": "playful | authoritative | empathetic | high-energy | calm",
      "hook": "string (<=20 words)",
      "main": "string (3–6 tight sentences, spoken style)",
      "cta": "string (<=20 words)"
    }
  ]
}

Rules:
- Hooks must be scroll-stoppers tied to the source video’s topic.
- Keep the coach’s tone, phrases, and boundaries.
- Use insights from transcript; do not invent facts that contradict it.
- If transcript is weak/inaudible, state what’s missing and ask for specifics.
- For partial regeneration, return ONLY the modified section and its variant index in the same JSON shape:
  { "variantIndex": 2, "section": "hook", "value": "..." }
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

  private async runAndGetLatestAssistantText(threadID: string, assistantID: string, timeoutMs = 60_000): Promise<string> {
    const started = Date.now();
    const run = await this.openai.beta.threads.runs.create(threadID, {assistant_id: assistantID});

    // poll
    while (true) {
      const r = await this.openai.beta.threads.runs.retrieve(run.id, {thread_id: threadID});
      if (r.status === 'completed') break;
      if (['failed', 'expired', 'cancelled'].includes(r.status as string)) {
        throw new BadRequestException(`Assistant run did not complete. Status: ${r.status}`);
      }
      if (Date.now() - started > timeoutMs) throw new BadRequestException('Assistant run timed out');
      await new Promise(res => setTimeout(res, 1000));
    }

    const list = await this.openai.beta.threads.messages.list(threadID, {order: 'desc', limit: 5});
    const latestAssistant = list.data.find((m) => m.role === 'assistant');
    if (!latestAssistant) throw new NotFoundException('No assistant message found');

    const textParts = (latestAssistant.content || [])
      .filter((p: any) => p.type === 'output_text' && p.text?.value)
      .map((p: any) => p.text.value);
    return (textParts.join('\n') || '').trim();
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

  // ---- Core generation APIs ----
  // Update the generateVideoContentIdeas method
  async generateVideoContentIdeas(
    coachID: string,
    threadID: string,
    transcriptText: string,
    options?: { desiredVibes?: ScriptVibe[]; extraContext?: string }
  ): Promise<ScriptVariantsResponse> {
    const {assistantID} = await this.getCoachConfig(coachID);
    await this.enableContentSuggestionMode(coachID);

    const promptLines = [
      'Analyze the transcript and produce 3 short-form scripts in the coach\'s voice.',
      'Constraints:',
      '- Hook ≤ 20 words. CTA ≤ 20 words. Main: 3–6 sentences, spoken cadence.',
      '- Each variant should have a distinct vibe.',
    ];
    if (options?.desiredVibes?.length) promptLines.push(`Target vibes (hints): ${options.desiredVibes.join(', ')}`);
    if (options?.extraContext) promptLines.push(`Extra context: ${options.extraContext}`);

    await this.addRichMessageToThread(coachID, threadID, [
      {type: 'text', text: promptLines.join('\n')},
      {type: 'text', text: `TRANSCRIPT:\n${transcriptText}`},
    ]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);

    try {
      const parsed = JSON.parse(raw) as { variants: ScriptVariant[] };
      if (!parsed?.variants?.length) throw new Error('No variants');

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
            create: parsed.variants.map((v, idx) => ({
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

    } catch {
      this.logger.error('Invalid JSON from assistant:', raw);
      throw new BadRequestException('Assistant did not return valid JSON for script variants');
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

    // Build enhanced prompt using the coach's knowledge base
    const promptLines = [
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

    // Add content type context
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

    // Add category context
    if (dto.category) {
      promptLines.push(`Category: ${dto.category} - align the tone and approach accordingly`);
    }

    // Add platform-specific guidance
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

    // Add video-specific options
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

      for (const url of dto.referenceVideoURLs.slice(0, 2)) { // Limit to 2 videos
        try {
          const transcript = await this.transcribeFromUrl(url);
          promptLines.push(`- Video: ${transcript.substring(0, 500)}...`);
        } catch (e: any) {
          this.logger.warn(`Failed to transcribe reference video: ${e.message}`);
        }
      }
    }

    // Add vibe hints
    if (dto.desiredVibes?.length) {
      promptLines.push('', `Suggested vibes (incorporate these): ${dto.desiredVibes.join(', ')}`);
    }

    // Add custom instructions
    if (dto.customInstructions) {
      promptLines.push('', 'Additional Instructions:', dto.customInstructions);
    }

    promptLines.push(
      '',
      'Output as strict JSON:',
      '{',
      '  "variants": [',
      '    {',
      '      "vibe": "playful | authoritative | empathetic | high-energy | calm",',
      '      "hook": "...",',
      '      "main": "...",',
      '      "cta": "..."',
      '    }',
      '  ]',
      '}'
    );

    await this.addRichMessageToThread(coachID, threadID, [
      { type: 'text', text: promptLines.join('\n') }
    ]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);

    try {
      const parsed = JSON.parse(raw) as { variants: ScriptVariant[] };
      if (!parsed?.variants?.length) throw new Error('No variants');

      // Persist the run
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
            create: parsed.variants.map((v, idx) => ({
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
      this.logger.error('Invalid JSON from assistant:', raw);
      throw new BadRequestException('Assistant did not return valid JSON for script variants');
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
      `Regenerate ONLY the ${request.section} for variant ${request.variantIndex}.`,
      'Keep topic and facts consistent with the transcript or prior context in this thread.',
      "Keep the coach's voice and boundaries.",
    ];
    if (request.constraints) prompt.push(`Change request: ${request.constraints}`);
    prompt.push('Return JSON: { "variantIndex": N, "section": "hook|main|cta", "value": "..." }');

    await this.addRichMessageToThread(coachID, threadID, [{ type: 'text', text: prompt.join('\n') }]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);

    try {
      const parsed = JSON.parse(raw) as RegenerationResponse;
      if (!parsed || typeof parsed.value !== 'string') throw new Error('Malformed');

      // ✅ UPDATE THE VARIANT IN DATABASE
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

    } catch {
      this.logger.error('Invalid JSON from assistant:', raw);
      throw new BadRequestException('Assistant did not return valid JSON for regeneration');
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

    // Update run to mark as media upload
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

  async generateFromContentPiece(
    coachID: string,
    threadID: string,
    contentPieceID: string,
    options?: { desiredVibes?: ScriptVibe[]; extraContext?: string }
  ): Promise<ScriptVariantsResponse> {
    await this.getCoachConfig(coachID);
    await this.enableContentSuggestionMode(coachID);

    // Get the content piece
    const contentPiece = await this.prisma.contentPiece.findFirst({
      where: {id: contentPieceID, coachID}
    });

    if (!contentPiece) {
      throw new NotFoundException('Content piece not found');
    }

    let transcript = '';

    // Check if we need to transcribe from URL
    if (contentPiece.url && contentPiece.contentType === 'video') {
      try {
        transcript = await this.transcribeFromUrl(contentPiece.url);
      } catch (e: any) {
        this.logger.warn(`Failed to transcribe from URL, using metadata: ${e.message}`);
        // Fallback to description
        transcript = this.buildTranscriptFromMetadata(contentPiece);
      }
    } else {
      // Use description and metadata
      transcript = this.buildTranscriptFromMetadata(contentPiece);
    }

    // Create run with sourceType = 'content_piece'
    const result = await this.generateVideoContentIdeas(coachID, threadID, transcript, options);

    // Update the run to reference the content piece
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
      // Download the video
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download video');

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], {type: response.headers.get('content-type') || 'video/mp4'});

      // Convert to File
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
