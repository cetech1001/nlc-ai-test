export type ScriptVibe = 'playful' | 'authoritative' | 'empathetic' | 'high-energy' | 'calm' | string;

export interface ScriptVariant {
  vibe: ScriptVibe;
  hook: string;   // ≤ 20 words
  main: string;   // 3–6 short spoken-style sentences
  cta: string;    // ≤ 20 words
}

export interface ScriptVariantsResponse {
  variants: ScriptVariant[];
}

export type ScriptSection = 'hook' | 'main' | 'cta';

export interface RegenerationRequest {
  variantIndex: number;
  section: ScriptSection;
  constraints?: string;
}

export interface RegenerationResponse {
  variantIndex: number;
  section: ScriptSection;
  value: string;
}
