import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import {
  RegenerationRequest,
  RegenerationResponse,
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
      where: { type: 'COACH_REPLICA' as any },
    });
    if (!agent) throw new NotFoundException('Coach Replica Agent not found');

    const config = await this.prisma.coachAiAgent.findUnique({
      where: { coachID_agentID: { coachID, agentID: agent.id } },
    });
    if (!config?.assistantID || !config?.vectorStoreID) {
      throw new NotFoundException('Coach AI not initialized. Please initialize first.');
    }
    return { agentID: agent.id, assistantID: config.assistantID, vectorStoreID: config.vectorStoreID };
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
    const { assistantID, agentID } = await this.getCoachConfig(coachID);
    const assistant = await this.openai.beta.assistants.retrieve(assistantID);
    const hasAppendix = (assistant.instructions || '').includes('## VIDEO-TO-SCRIPTS MODE');
    if (hasAppendix) return { message: 'Content-suggestion mode already enabled.' };

    const newInstructions = `${assistant.instructions || ''}${this.buildVideoModeInstructionsAppendix()}`;
    await this.openai.beta.assistants.update(assistantID, { instructions: newInstructions });
    await this.prisma.coachAiAgent.update({
      where: { coachID_agentID: { coachID, agentID } },
      data: { instructions: newInstructions },
    });
    return { message: 'Content-suggestion mode enabled.' };
  }

  // ---- Thread helpers ----
  private async validateThread(coachID: string, threadID: string) {
    const thread = await this.prisma.agentThread.findFirst({ where: { coachID, openaiThreadID: threadID } });
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  async addRichMessageToThread(
    coachID: string,
    threadID: string,
    parts: Array<{ type: 'input_text'; text: string } | { type: 'image_file'; image_file: { file_id: string } }>
  ) {
    const thread = await this.validateThread(coachID, threadID);

    const flat = parts.map(p => (p.type === 'input_text' ? p.text : '[image_file]')).join('\n');
    await this.prisma.agentMessage.create({
      data: { coachID, role: 'user', threadID: thread.id, content: flat },
    });

    const msg = await this.openai.beta.threads.messages.create(threadID, {
      role: 'user',
      content: parts as any,
    });
    return { messageID: msg.id };
  }

  private async runAndGetLatestAssistantText(threadID: string, assistantID: string, timeoutMs = 60_000): Promise<string> {
    const started = Date.now();
    const run = await this.openai.beta.threads.runs.create(threadID, { assistant_id: assistantID });

    // poll
    while (true) {
      const r = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: threadID });
      if (r.status === 'completed') break;
      if (['failed', 'expired', 'cancelled'].includes(r.status as string)) {
        throw new BadRequestException(`Assistant run did not complete. Status: ${r.status}`);
      }
      if (Date.now() - started > timeoutMs) throw new BadRequestException('Assistant run timed out');
      await new Promise(res => setTimeout(res, 1000));
    }

    const list = await this.openai.beta.threads.messages.list(threadID, { order: 'desc', limit: 5 });
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
      const blob = new Blob([file.buffer], { type: file.mimetype });
      const f = new File([blob], file.originalname, { type: file.mimetype });

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
  async generateVideoContentIdeas(
    coachID: string,
    threadID: string,
    transcriptText: string,
    options?: { desiredVibes?: ScriptVibe[]; extraContext?: string }
  ): Promise<ScriptVariantsResponse> {
    const { assistantID } = await this.getCoachConfig(coachID);
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
      { type: 'input_text', text: promptLines.join('\n') },
      { type: 'input_text', text: `TRANSCRIPT:\n${transcriptText}` },
    ]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);
    try {
      const parsed = JSON.parse(raw) as ScriptVariantsResponse;
      if (!parsed?.variants?.length) throw new Error('No variants');
      return parsed;
    } catch {
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

    await this.addRichMessageToThread(coachID, threadID, [{ type: 'input_text', text: prompt.join('\n') }]);

    const raw = await this.runAndGetLatestAssistantText(threadID, assistantID);
    try {
      const parsed = JSON.parse(raw) as RegenerationResponse;
      if (!parsed || typeof parsed.value !== 'string') throw new Error('Malformed');
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
    return this.generateVideoContentIdeas(coachID, threadID, transcript, options);
  }
}
