'use client'

import { TemplateFrame } from "@nlc-ai/web-shared";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@nlc-ai/web-ui";
import { Clock, Users, TrendingUp, Target, Sparkles, RotateCcw } from "lucide-react";
import { sdkClient } from "@/lib";

interface ContentSuggestion {
  id: string;
  title: string;
  originalIdea: string;
  script: {
    hook: string;
    mainContent: string;
    callToAction: string;
  };
  contentCategory: string;
  recommendedPlatforms: string[];
  bestPostingTimes: string[];
  estimatedEngagement: {
    min: number;
    max: number;
  };
  confidence: number;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

const ScriptSidebar: React.FC<{ suggestion: ContentSuggestion | null; isLoading: boolean }> = ({ suggestion, isLoading }) => {
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4">
        <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
          {suggestion.title}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-[10px]">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Generated:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {new Date(suggestion.createdAt).toLocaleDateString()} at {new Date(suggestion.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                Category
              </span>
            </div>
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              {suggestion.contentCategory}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div className="flex items-center gap-2 justify-end">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                Confidence
              </span>
            </div>
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                Est. Engagement
              </span>
            </div>
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              {suggestion.estimatedEngagement.min.toLocaleString()} - {suggestion.estimatedEngagement.max.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
              Best Posting Times
            </span>
          </div>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {suggestion.bestPostingTimes.join(', ')}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
              Recommended Platforms
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestion.recommendedPlatforms.map((platform) => (
              <span
                key={platform}
                className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-200 capitalize"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Original Idea
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px] italic">
            "{suggestion.originalIdea}"
          </span>
        </div>
      </div>
    </>
  );
};

const ScriptContent: React.FC<{ suggestion: ContentSuggestion | null; isLoading: boolean; onRegenerate: () => void }> = ({
                                                                                                                           suggestion,
                                                                                                                           isLoading,
                                                                                                                           onRegenerate
                                                                                                                         }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-[30px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-20" />
              <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-[15px] p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-32" />
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-[15px] p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-28" />
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-[15px] p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-[30px] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-semibold leading-tight">
            Content Script
          </h2>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-lg text-white text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Regenerate
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[#F9F9F9] font-inter text-lg font-semibold leading-[25.6px]">
                Hook
              </span>
            </div>
            <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-[15px] p-4 lg:p-6">
              <p className="text-[#F9F9F9] font-inter text-sm sm:text-base font-normal leading-relaxed whitespace-pre-wrap">
                {suggestion.script.hook}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[#F9F9F9] font-inter text-lg font-semibold leading-[25.6px]">
                Main Content
              </span>
            </div>
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-[15px] p-4 lg:p-6">
              <p className="text-[#F9F9F9] font-inter text-sm sm:text-base font-normal leading-relaxed whitespace-pre-wrap">
                {suggestion.script.mainContent}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[#F9F9F9] font-inter text-lg font-semibold leading-[25.6px]">
                Call to Action
              </span>
            </div>
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-[15px] p-4 lg:p-6">
              <p className="text-[#F9F9F9] font-inter text-sm sm:text-base font-normal leading-relaxed whitespace-pre-wrap">
                {suggestion.script.callToAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentScriptPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const suggestionID = params.suggestionID as string;

  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (suggestionID) {
      fetchSuggestion();
    }
  }, [suggestionID]);

  const fetchSuggestion = async () => {
    try {
      setIsLoading(true);
      const data = await sdkClient.agents.contentSuggestion.getSuggestion(suggestionID);
      setSuggestion(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load content suggestion');
      router.push('/agents/suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!suggestion) return;

    try {
      setIsRegenerating(true);
      const newSuggestion = await sdkClient.agents.contentSuggestion.regenerateContentSuggestion(suggestionID);
      toast.success('Content suggestion regenerated successfully!');
      router.push(`/agents/suggestion/script/${newSuggestion.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate content suggestion');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    if (!suggestion) return;

    try {
      // Here you could implement saving changes if the user made edits
      toast.success('Content script saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content script');
    }
  };

  const handleDiscard = () => {
    router.push('/agents/suggestion');
  };

  return (
    <TemplateFrame
      pageTitle={suggestion?.title || "Content Script"}
      onSave={handleSave}
      onDiscard={handleDiscard}
      sidebarComponent={
        <ScriptSidebar
          suggestion={suggestion}
          isLoading={isLoading}
        />
      }
      mainComponent={
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScriptContent
            suggestion={suggestion}
            isLoading={isLoading || isRegenerating}
            onRegenerate={handleRegenerate}
          />
        </div>
      }
      displayActionButtons={!isLoading && suggestion ? true : false}
      saveButtonText="Save Script"
      discardButtonText="Back to Suggestions"
    />
  );
};

export default ContentScriptPage;
