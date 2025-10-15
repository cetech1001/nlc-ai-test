'use client'

import { TemplateFrame } from "@nlc-ai/web-shared";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@nlc-ai/web-ui";
import { Clock, TrendingUp, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { sdkClient } from "@/lib";

interface ScriptVariant {
  index: number;
  vibe: 'playful' | 'authoritative' | 'empathetic' | 'high-energy' | 'calm';
  hook: string;
  main: string;
  cta: string;
}

interface ScriptRun {
  id: string;
  sourceType: string;
  transcriptText: string;
  desiredVibes: string[];
  extraContext?: string;
  variants: ScriptVariant[];
  createdAt: Date;
}

type SectionType = 'hook' | 'main' | 'cta';

const VIBE_COLORS = {
  playful: 'from-pink-500 to-purple-500',
  authoritative: 'from-blue-600 to-indigo-700',
  empathetic: 'from-green-500 to-teal-600',
  'high-energy': 'from-orange-500 to-red-600',
  calm: 'from-cyan-400 to-blue-500',
};

const VIBE_LABELS = {
  playful: '🎉 Playful',
  authoritative: '👔 Authoritative',
  empathetic: '💝 Empathetic',
  'high-energy': '⚡ High Energy',
  calm: '🧘 Calm',
};

const ScriptSidebar: React.FC<{
  run: ScriptRun | null;
  isLoading: boolean;
  currentVariantIndex: number;
  onVariantChange: (index: number) => void;
}> = ({ run, isLoading, currentVariantIndex, onVariantChange }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!run) return null;

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4">
        <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
          Script Variants
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-[10px]">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Generated:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {new Date(run.createdAt).toLocaleDateString()} at {new Date(run.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
          Choose a Variant
        </span>
        {run.variants.map((variant, index) => (
          <button
            key={index}
            onClick={() => onVariantChange(index)}
            className={`relative overflow-hidden rounded-[15px] p-4 border-2 transition-all group ${
              currentVariantIndex === index
                ? 'border-purple-500 bg-gradient-to-r from-purple-900/30 to-violet-900/30'
                : 'border-neutral-600 bg-neutral-800/20 hover:border-purple-400/50'
            }`}
          >
            <div className="relative z-10 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold bg-gradient-to-r ${VIBE_COLORS[variant.vibe]} bg-clip-text text-transparent`}>
                  {VIBE_LABELS[variant.vibe]}
                </span>
                {currentVariantIndex === index && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-[#C5C5C5] text-xs line-clamp-2">
                {variant.hook}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Source Type
          </span>
        </div>
        <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px] capitalize">
          {run.sourceType.replace('_', ' ')}
        </span>
      </div>

      {run.desiredVibes.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
              Desired Vibes
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {run.desiredVibes.map((vibe, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-200 capitalize"
              >
                {vibe}
              </span>
            ))}
          </div>
        </div>
      )}

      {run.extraContext && (
        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Additional Context
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px] italic">
            "{run.extraContext}"
          </span>
        </div>
      )}
    </>
  );
};

const ScriptContent: React.FC<{
  run: ScriptRun | null;
  currentVariant: ScriptVariant | null;
  isLoading: boolean;
  onRegenerateSection: (section: SectionType) => void;
  isRegenerating: { [key: string]: boolean };
}> = ({
        run,
        currentVariant,
        isLoading,
        onRegenerateSection,
        isRegenerating
      }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-[30px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />

          <div className="flex flex-col gap-6">
            {['Hook', 'Main Content', 'Call to Action'].map((title, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-5 w-32" />
                <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-[15px] p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!run || !currentVariant) return null;

  const sections: { key: SectionType; label: string; content: string; color: string; dotColor: string }[] = [
    {
      key: 'hook',
      label: 'Hook',
      content: currentVariant.hook,
      color: 'from-purple-900/20 to-violet-900/20 border-purple-700/30',
      dotColor: 'bg-purple-500'
    },
    {
      key: 'main',
      label: 'Main Content',
      content: currentVariant.main,
      color: 'from-blue-900/20 to-cyan-900/20 border-blue-700/30',
      dotColor: 'bg-blue-500'
    },
    {
      key: 'cta',
      label: 'Call to Action',
      content: currentVariant.cta,
      color: 'from-green-900/20 to-emerald-900/20 border-green-700/30',
      dotColor: 'bg-green-500'
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-[30px] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${VIBE_COLORS[currentVariant.vibe]}`}>
            <span className="text-white text-sm font-semibold">
              {VIBE_LABELS[currentVariant.vibe]}
            </span>
          </div>
          <h2 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-semibold leading-tight">
            Script #{currentVariant.index + 1}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${section.dotColor} rounded-full`}></div>
                  <span className="text-[#F9F9F9] font-inter text-lg font-semibold leading-[25.6px]">
                    {section.label}
                  </span>
                </div>
                <button
                  onClick={() => onRegenerateSection(section.key)}
                  disabled={isRegenerating[section.key]}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50 rounded-lg text-[#C5C5C5] hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating[section.key] ? 'animate-spin' : ''}`} />
                  {isRegenerating[section.key] ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
              <div className={`bg-gradient-to-r ${section.color} border rounded-[15px] p-4 lg:p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-32 h-32 -right-4 -top-6 bg-gradient-to-l from-purple-400 via-purple-600 to-violet-600 rounded-full blur-[40px]" />
                </div>
                <p className="text-[#F9F9F9] font-inter text-sm sm:text-base font-normal leading-relaxed whitespace-pre-wrap relative z-10">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScriptRunPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const runID = params.runID as string;

  const [run, setRun] = useState<ScriptRun | null>(null);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (runID) {
      fetchRun();
    }
  }, [runID]);

  const fetchRun = async () => {
    try {
      setIsLoading(true);
      const data = await sdkClient.agents.contentSuggestion.getScriptRun(runID);
      setRun(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load script run');
      router.push('/agents/suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSection = async (section: SectionType) => {
    if (!run) return;

    const sectionKey = `${currentVariantIndex}-${section}`;

    try {
      setIsRegenerating(prev => ({ ...prev, [sectionKey]: true }));

      // Get the thread ID from the run
      const threadRes = await sdkClient.agents.coachReplica.createThread();

      const result = await sdkClient.agents.contentSuggestion.regenerateSection(
        threadRes.threadID,
        {
          variantIndex: currentVariantIndex,
          section,
        }
      );

      // Update the specific section in the current variant
      setRun(prev => {
        if (!prev) return prev;

        const updatedVariants = [...prev.variants];
        updatedVariants[currentVariantIndex] = {
          ...updatedVariants[currentVariantIndex],
          [section]: result.value,
        };

        return {
          ...prev,
          variants: updatedVariants,
        };
      });

      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} regenerated successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to regenerate ${section}`);
    } finally {
      setIsRegenerating(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const handleVariantNavigation = (direction: 'prev' | 'next') => {
    if (!run) return;

    if (direction === 'prev' && currentVariantIndex > 0) {
      setCurrentVariantIndex(prev => prev - 1);
    } else if (direction === 'next' && currentVariantIndex < run.variants.length - 1) {
      setCurrentVariantIndex(prev => prev + 1);
    }
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    toast.success('Save functionality to be implemented');
  };

  const handleDiscard = () => {
    router.push('/agents/suggestion');
  };

  const currentVariant = run?.variants[currentVariantIndex] || null;

  return (
    <TemplateFrame
      pageTitle="Content Script"
      onSave={handleSave}
      onDiscard={handleDiscard}
      sidebarComponent={
        <ScriptSidebar
          run={run}
          isLoading={isLoading}
          currentVariantIndex={currentVariantIndex}
          onVariantChange={setCurrentVariantIndex}
        />
      }
      mainComponent={
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Variant Navigation */}
          {!isLoading && run && run.variants.length > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[30px] py-4 border-b border-neutral-700">
              <button
                onClick={() => handleVariantNavigation('prev')}
                disabled={currentVariantIndex === 0}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50 rounded-lg text-[#C5C5C5] hover:text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-[#F9F9F9] font-inter text-sm font-medium">
                Variant {currentVariantIndex + 1} of {run.variants.length}
              </span>

              <button
                onClick={() => handleVariantNavigation('next')}
                disabled={currentVariantIndex === run.variants.length - 1}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-600 hover:border-purple-500/50 rounded-lg text-[#C5C5C5] hover:text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <ScriptContent
            run={run}
            currentVariant={currentVariant}
            isLoading={isLoading}
            onRegenerateSection={handleRegenerateSection}
            isRegenerating={isRegenerating}
          />
        </div>
      }
      displayActionButtons={!!(!isLoading && run)}
      saveButtonText="Save to Library"
      discardButtonText="Back to Suggestions"
    />
  );
};

export default ScriptRunPage;
