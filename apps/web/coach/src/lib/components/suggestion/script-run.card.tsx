'use client'

import React from 'react';
import {GlassCard} from "@/lib/components/suggestion/glass-card";
import {useRouter} from "next/navigation";
import { Clock, Sparkles, Eye } from "lucide-react";

interface ScriptVariant {
  index: number;
  vibe: 'playful' | 'authoritative' | 'empathetic' | 'high-energy' | 'calm';
  hook: string;
  main: string;
  cta: string;
}

interface ScriptRun {
  id: string;
  coachID: string;
  threadID: string;
  sourceType: string;
  sourceReference?: string;
  transcriptText: string;
  desiredVibes: string[];
  extraContext?: string;
  variants: ScriptVariant[];
  createdAt: Date;
  updatedAt: Date;
}

interface ScriptRunCardProps {
  run: ScriptRun;
  className?: string;
}

const VIBE_COLORS = {
  playful: 'from-pink-500 to-purple-500',
  authoritative: 'from-blue-600 to-indigo-700',
  empathetic: 'from-green-500 to-teal-600',
  'high-energy': 'from-orange-500 to-red-600',
  calm: 'from-cyan-400 to-blue-500',
};

const VIBE_LABELS = {
  playful: '🎉',
  authoritative: '👔',
  empathetic: '💝',
  'high-energy': '⚡',
  calm: '🧘',
};

const SOURCE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  'manual_idea': { label: 'Manual Input', icon: '✍️' },
  'content_piece': { label: 'From Content', icon: '📹' },
  'media_upload': { label: 'Media Upload', icon: '📤' },
  'transcript': { label: 'From Transcript', icon: '📝' },
};

export const ScriptRunCard: React.FC<ScriptRunCardProps> = ({ run, className = '' }) => {
  const router = useRouter();

  const sourceInfo = SOURCE_TYPE_LABELS[run.sourceType] || { label: 'Unknown', icon: '❓' };

  // Get first variant's hook as preview
  const previewHook = run.variants[0]?.hook || 'No preview available';

  // Calculate relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <GlassCard
      className={`w-full max-w-[570px] hover:border-purple-500/50 transition-all cursor-pointer ${className}`}
      glowOrbs={[
        {
          size: 200,
          position: 'bottom-left',
          color: 'pink'
        }
      ]}
      onClick={() => router.push(`/agents/suggestion/script/${run.id}`)}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{sourceInfo.icon}</span>
              <span className="text-[#C5C5C5] font-inter text-xs font-medium uppercase tracking-wide">
                {sourceInfo.label}
              </span>
            </div>
            <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl font-semibold leading-tight line-clamp-2">
              {run.transcriptText.substring(0, 60)}...
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[#C5C5C5] text-xs whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            <span>{getRelativeTime(run.createdAt)}</span>
          </div>
        </div>

        {/* Preview Hook */}
        <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-[12px] p-3">
          <p className="text-[#F9F9F9] font-inter text-sm leading-relaxed line-clamp-2">
            "{previewHook}"
          </p>
        </div>

        {/* Variants Preview */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#C5C5C5] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">{run.variants.length} Variants:</span>
          </div>
          {run.variants.slice(0, 3).map((variant, idx) => (
            <div
              key={idx}
              className={`px-2 py-1 rounded-md bg-gradient-to-r ${VIBE_COLORS[variant.vibe]} bg-opacity-20 border border-opacity-30 text-xs flex items-center gap-1`}
              style={{
                borderColor: 'currentColor',
                opacity: 0.9
              }}
            >
              <span>{VIBE_LABELS[variant.vibe]}</span>
              <span className="text-white/90 font-medium capitalize">{variant.vibe}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
          <div className="flex flex-col gap-1">
            {run.desiredVibes.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-[#C5C5C5]">
                <span className="font-medium">Target:</span>
                <span>{run.desiredVibes.join(', ')}</span>
              </div>
            )}
            {run.extraContext && (
              <div className="flex items-center gap-1 text-xs text-[#C5C5C5]">
                <span className="opacity-60 italic line-clamp-1">"{run.extraContext}"</span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/agents/suggestion/script/${run.id}`);
            }}
            className="flex items-center gap-1.5 text-[#DF69FF] font-inter text-sm font-bold hover:text-[#B339D4] transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Scripts</span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export const ScriptRunCardSkeleton: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-[30px] overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute w-32 h-32 -left-4 -bottom-8 bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-600 rounded-full blur-[40px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-neutral-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-neutral-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-full bg-neutral-700 rounded animate-pulse mb-2" />
            <div className="h-6 w-3/4 bg-neutral-700 rounded animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-neutral-700 rounded animate-pulse" />
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-[12px] p-3">
          <div className="h-4 w-full bg-neutral-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-5/6 bg-neutral-700 rounded animate-pulse" />
        </div>

        {/* Variants */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse" />
          <div className="h-6 w-20 bg-neutral-700 rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-neutral-700 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-neutral-700 rounded-full animate-pulse" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
          <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse" />
          <div className="h-8 w-24 bg-neutral-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};
