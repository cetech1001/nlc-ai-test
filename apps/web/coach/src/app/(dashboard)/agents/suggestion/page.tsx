'use client'

import React, {useEffect, useState} from 'react';
import {
  CategoryList,
  TopPerformingContentSuggestion,
  GradientButton,
  sdkClient,
  ScriptRunCard,
  ScriptRunCardSkeleton
} from '@/lib';
import { PageHeader } from "@nlc-ai/web-shared";
import { GenerateIdeaModal } from '@/lib/components/suggestion/generate-idea.modal';
import {toast} from "sonner";
// import {useRouter} from "next/navigation";

// Type definitions
interface ContentCardData {
  id: string;
  image: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  duration: string;
  time: string;
  date: string;
  impressions: number;
  engagement: number;
}

interface CategoryData {
  name: string;
  views: number;
  percentage: number;
}

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

const ContentSuggestion: React.FC = () => {
  // const router = useRouter();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Sample data for analytics
  const contentCards: ContentCardData[] = [
    {
      id: '1',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/2243659c97ad2ff34e81a10b4e97c210303b7063',
      platform: 'instagram',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    },
    {
      id: '2',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/d5d81c69f3ce25c2b751c1f700146fb93ccbee95',
      platform: 'facebook',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    },
    {
      id: '3',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/92549a03151793d3c4fc834ded69306d5bf431b5',
      platform: 'tiktok',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    },
    {
      id: '4',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/666029de4905c2850ecdd930f83aca94a8a7366c',
      platform: 'instagram',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    }
  ];

  const categoryData: CategoryData[] = [
    { name: 'Controversial', views: 11121, percentage: 82 },
    { name: 'Informative', views: 3150, percentage: 33 },
    { name: 'Conversational', views: 8352, percentage: 76 },
    { name: 'Entertainment', views: 5280, percentage: 55 },
    { name: 'Case Studies', views: 4375, percentage: 41 }
  ];

  const [scriptRuns, setScriptRuns] = useState<ScriptRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScriptRuns();
  }, []);

  const fetchScriptRuns = async () => {
    try {
      setIsLoading(true);
      const data = await sdkClient.agents.contentSuggestion.getScriptRuns({ limit: 20 });
      setScriptRuns(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load script runs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewIdea = () => {
    setIsGenerateModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto py-4 px-4">
      <PageHeader title={'Content Suggestion Agent'}/>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Content Categories */}
          <CategoryList
            categories={categoryData}
            className="w-full xl:w-auto xl:flex-shrink-0"
          />

          {/* Top Performing Content */}
          <TopPerformingContentSuggestion
            contentCards={contentCards}
            className="w-full"
          />
        </div>
      </div>

      {/* Script Runs Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-medium leading-[25.6px]">
              Generated Scripts
            </h2>
            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              AI-generated content scripts based on your style and successful content patterns.
            </p>
          </div>

          <GradientButton
            onClick={handleGenerateNewIdea}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Generate New Script
          </GradientButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
          {isLoading && [1, 2, 3, 4, 5, 6].map((_, index) =>
            <ScriptRunCardSkeleton key={index}/>)}
          {!isLoading && scriptRuns.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
              <div className="relative">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[#F9F9F9] font-inter text-lg font-semibold mb-2">
                      No Scripts Yet
                    </h3>
                    <p className="text-[#C5C5C5] font-inter text-sm max-w-md">
                      Generate your first AI-powered content script by clicking the button above.
                      Our AI will analyze your style and create multiple script variants for you to choose from.
                    </p>
                  </div>
                  <GradientButton
                    onClick={handleGenerateNewIdea}
                    className="mt-4"
                  >
                    Create Your First Script
                  </GradientButton>
                </div>
              </div>
            </div>
          )}
          {!isLoading && scriptRuns.map((run) => (
            <ScriptRunCard
              key={run.id}
              run={run}
              className="w-full"
            />
          ))}
        </div>
      </div>

      <GenerateIdeaModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
    </div>
  );
};

export default ContentSuggestion;
