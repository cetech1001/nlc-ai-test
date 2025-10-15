import { BaseClient } from '@nlc-ai/sdk-core';

export interface ScriptVibe {
  id: string;
  vibe: 'playful' | 'authoritative' | 'empathetic' | 'high-energy' | 'calm';
  hook: string;
  main: string;
  cta: string;
}

export interface ScriptVariantsResponse {
  runID?: string;
  variants: ScriptVibe[];
}

export interface RegenerationRequest {
  variantIndex: number;
  section: 'hook' | 'main' | 'cta';
  constraints?: string;
}

export interface RegenerationResponse {
  variantIndex: number;
  section: 'hook' | 'main' | 'cta';
  value: string;
}

export class ContentSuggestionClient extends BaseClient {
  /**
   * Enable content suggestion mode for a coach
   */
  async enableContentSuggestionMode(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(
      'POST',
      '/enable'
    );
    return response.data!;
  }

  /**
   * Generate video script ideas from manual input with coach's knowledge
   */
  async generateFromManualIdea(
    threadID: string,
    data: {
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
      desiredVibes?: string[];
      referenceVideoURLs?: string[];
    }
  ): Promise<ScriptVariantsResponse> {
    const response = await this.request<ScriptVariantsResponse>(
      'POST',
      '/from-manual',
      {
        body: {
          threadID,
          idea: data.idea,
          contentType: data.contentType,
          category: data.category,
          targetPlatforms: data.targetPlatforms,
          customInstructions: data.customInstructions,
          videoDuration: data.videoOptions?.duration,
          videoStyle: data.videoOptions?.style,
          includeMusic: data.videoOptions?.includeMusic,
          includeCaptions: data.videoOptions?.includeCaptions,
          videoOrientation: data.videoOptions?.orientation,
          desiredVibes: data.desiredVibes,
        }
      }
    );
    return response.data!;
  }

  /**
   * Generate video script ideas from transcript text
   */
  async generateFromTranscript(
    threadID: string,
    transcriptText: string,
    options?: {
      desiredVibes?: string[];
      extraContext?: string;
    }
  ): Promise<ScriptVariantsResponse> {
    const response = await this.request<ScriptVariantsResponse>(
      'POST',
      '/from-transcript',
      {
        body: {
          threadID,
          transcriptText,
          desiredVibes: options?.desiredVibes,
          extraContext: options?.extraContext,
        }
      }
    );
    return response.data!;
  }

  /**
   * Generate video script ideas from uploaded media file
   */
  async generateFromMedia(
    threadID: string,
    file: File,
    options?: {
      desiredVibes?: string[];
      extraContext?: string;
    }
  ): Promise<ScriptVariantsResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('threadID', threadID);

    if (options?.desiredVibes) {
      formData.append('desiredVibes', JSON.stringify(options.desiredVibes));
    }
    if (options?.extraContext) {
      formData.append('extraContext', options.extraContext);
    }

    const response = await this.request<ScriptVariantsResponse>(
      'POST',
      '/from-media',
      { body: formData }
    );
    return response.data!;
  }

  /**
   * Generate video script ideas from existing ContentPiece
   */
  async generateFromContentPiece(
    contentPieceID: string,
    threadID: string,
    options?: {
      desiredVibes?: string[];
      extraContext?: string;
    }
  ): Promise<ScriptVariantsResponse> {
    const response = await this.request<ScriptVariantsResponse>(
      'POST',
      '/from-content-piece',
      {
        body: {
          contentPieceID,
          threadID,
          desiredVibes: options?.desiredVibes,
          extraContext: options?.extraContext,
        }
      }
    );
    return response.data!;
  }

  /**
   * Regenerate a specific section of a script variant
   */
  async regenerateSection(
    threadID: string,
    request: RegenerationRequest
  ): Promise<RegenerationResponse> {
    const response = await this.request<RegenerationResponse>(
      'POST',
      '/regen',
      {
        body: {
          threadID,
          variantIndex: request.variantIndex,
          section: request.section,
          constraints: request.constraints,
        }
      }
    );
    return response.data!;
  }
}
