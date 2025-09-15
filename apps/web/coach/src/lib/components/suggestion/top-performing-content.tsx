'use client'

import React, { useState } from 'react';
import {GlassCard} from "@/lib/components/suggestion/glass-card";
import {ContentCard} from "@/lib/components/suggestion/content-card";

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

interface TopPerformingContentProps {
  contentCards: ContentCardData[];
  className?: string;
}

export const TopPerformingContentSuggestion: React.FC<TopPerformingContentProps> = ({
                                                                     contentCards,
                                                                     className = ''
                                                                   }) => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<'week' | 'month' | 'year'>('year');

  return (
    <GlassCard
      className={`flex-1 ${className}`}
      glowOrbs={[
        {
          size: 252,
          position: 'top-right',
          color: 'purple'
        },
        {
          size: 252,
          position: 'top-left',
          color: 'purple'
        }
      ]}
    >
      <div className="flex flex-col gap-[30px]">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-[6px]">
            <h3 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-semibold leading-[25.6px]">
              Top Performing Content
            </h3>
            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px] max-w-[235px]">
              What works best for your viewers
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-sm">
            {(['week', 'month', 'year'] as const).map((filter, index) => (
              <React.Fragment key={filter}>
                <button
                  onClick={() => setActiveTimeFilter(filter)}
                  className={`font-inter leading-[25.6px] transition-colors ${
                    activeTimeFilter === filter
                      ? 'text-[#DF69FF] font-bold'
                      : 'text-[#C5C5C5] font-normal hover:text-[#DF69FF]'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
                {index < 2 && (
                  <div className="w-[0.5px] h-4 bg-white"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-2">
          {contentCards.map((card) => (
            <ContentCard
              key={card.id}
              content={card}
              className="flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
