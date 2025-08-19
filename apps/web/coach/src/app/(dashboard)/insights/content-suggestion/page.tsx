'use client'

import React, { useState, useEffect } from 'react';
import { sdkClient } from "@/lib";
import { ContentCreationAgentData } from '@nlc-ai/sdk-analytics';
import { Clock, ThumbsUp, Share, MessageCircle } from "lucide-react";

const ContentCreationAgentPage = () => {
  const [data, setData] = useState<ContentCreationAgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState("Engagement");

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const coachID = 'current-coach-id';
      const analyticsData = await sdkClient.analytics.getContentCreationAgentData(coachID);
      setData(analyticsData);
    } catch (err: any) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error || !data) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
        <div className="text-center p-8">
          <p className="text-red-400 mb-4">{error || 'Failed to load analytics'}</p>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <StyleEfficiencyCard
          engagement={data.averageEngagement}
        />
        <SocialMediaGrowthCard
          percentage={data.socialMediaGrowth}
          growthData={data.socialGrowthData}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <ViralityFactorCard value={data.viralityFactor} isLoading={isLoading} />
        <EfficiencyBoostCard
          percentage={data.efficiencyBoost}
          efficiencyData={data.efficiencyData}
          isLoading={isLoading}
        />
        <AverageEngagementCard
          styles={data.contentStyles}
        />
      </div>
    </div>
  );
};

// Style Efficiency Card with horizontal bars
const StyleEfficiencyCard = ({ engagement }: {
  engagement: ContentCreationAgentData['averageEngagement']
}) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Average Engagement</h3>
        <p className="text-stone-400 text-sm mb-6">
          How your content is performing
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-purple-400" />
              <span className="text-stone-300 text-sm">Likes</span>
            </div>
            <span className="text-white text-lg font-semibold">{engagement.likes.toLocaleString()}</span>
          </div>

          <div className="w-full bg-neutral-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-1 rounded-full w-full" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Share className="w-4 h-4 text-fuchsia-400" />
              <span className="text-stone-300 text-sm">Shares</span>
            </div>
            <span className="text-white text-lg font-semibold">{engagement.shares.toLocaleString()}</span>
          </div>

          <div className="w-full bg-neutral-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-1 rounded-full w-3/4" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-violet-400" />
              <span className="text-stone-300 text-sm">Comments</span>
            </div>
            <span className="text-white text-lg font-semibold">{engagement.comments.toLocaleString()}</span>
          </div>

          <div className="w-full bg-neutral-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-1 rounded-full w-1/2" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-stone-300 text-sm">Best Time To Post</span>
            </div>
            <span className="text-green-400 text-lg font-semibold">{engagement.bestTimeToPost}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreationAgentPage;

// Social Media Growth Card with bar chart and tabs
const SocialMediaGrowthCard = ({ percentage, growthData, selectedTab, setSelectedTab, isLoading }: {
  percentage: number;
  growthData: any[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  isLoading: boolean;
}) => {
  const maxFollowers = growthData.length > 0 ? Math.max(...growthData.map(d => d.followers)) : 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
          <div>
            <h3 className="text-stone-50 text-lg font-medium mb-1">Social Media Growth</h3>
            <p className="text-stone-400 text-sm">Increase in followers and engagement.</p>
          </div>
          <div className="flex items-center gap-3">
            {["Engagement", "Followers"].map((tab, index, array) => (
              <React.Fragment key={tab}>
                <button
                  onClick={() => setSelectedTab(tab)}
                  className={`text-sm transition-colors whitespace-nowrap ${
                    selectedTab === tab
                      ? "text-fuchsia-400 font-medium"
                      : "text-stone-300 hover:text-stone-50"
                  }`}
                >
                  {tab}
                </button>
                {index < array.length - 1 && (
                  <div className="w-3 h-0 border-t-[0.5px] border-white/30 rotate-90" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        {/* Follower count display */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 rounded-lg p-3 w-fit">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-fuchsia-400 rounded-full" />
              <span className="text-fuchsia-400 text-sm font-medium">250 Followers</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end gap-1" style={{ height: '120px' }}>
          {growthData.map((month, index) => (
            <div key={month.month} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t transition-all duration-1000"
                style={{
                  height: maxFollowers > 0 ? `${(month.followers / maxFollowers) * 100}px` : '5px',
                  transitionDelay: `${index * 100}ms`
                }}
              />
              <span className="text-stone-300 text-xs">{month.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Virality Factor Card with semicircle
const ViralityFactorCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
  const semicircleCircumference = Math.PI * 50;
  const targetOffset = semicircleCircumference - (value / 100) * semicircleCircumference;
  const [strokeOffset, setStrokeOffset] = useState(semicircleCircumference);

  useEffect(() => {
    setStrokeOffset(targetOffset);
  }, [targetOffset]);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Virality Factor</h3>
        <p className="text-stone-400 text-sm mb-6">
          Number of posts that exceeded average engagement by 2x or more.
        </p>

        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-20">
            <svg className="w-full h-full" viewBox="0 0 120 60">
              <path
                d="M 10 50 A 50 50 0 0 1 110 50"
                fill="transparent"
                stroke="rgb(64 64 64 / 0.3)"
                strokeWidth="12"
              />
              <path
                d="M 10 50 A 50 50 0 0 1 110 50"
                fill="transparent"
                stroke="url(#viralGradient)"
                strokeWidth="12"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="viralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-50 text-2xl font-semibold">{value}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Efficiency Boost Card with horizontal bars
const EfficiencyBoostCard = ({ percentage, efficiencyData, isLoading }: {
  percentage: number;
  efficiencyData: any;
  isLoading: boolean;
}) => {
  const maxTime = Math.max(efficiencyData.timeSaved, efficiencyData.manualTimeRequirement);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Efficiency Boost</h3>
        <p className="text-stone-400 text-sm mb-6">
          Time saved on content ideation and creation.
        </p>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{efficiencyData.timeSaved} Hrs</span>
            <span className="text-stone-300">Saved through our platform</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{efficiencyData.manualTimeRequirement} Hrs</span>
            <span className="text-stone-300">Would have taken manually</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: maxTime > 0 ? `${(efficiencyData.timeSaved / maxTime) * 100}%` : '0%' }}
              >
                <span className="text-white text-xs font-medium">Time Saved</span>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-gray-600 to-gray-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: maxTime > 0 ? `${(efficiencyData.manualTimeRequirement / maxTime) * 100}%` : '0%' }}
              >
                <span className="text-white text-xs font-medium">Manual Time Requirement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Average Engagement Card with metrics
const AverageEngagementCard = ({ styles }: {
  styles: ContentCreationAgentData['styleEfficiency']
}) => {
  const maxViews = styles.length > 0 ? Math.max(...styles.map(s => s.views)) : 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Style Efficiency</h3>
        <p className="text-stone-400 text-sm mb-6">
          The data is based on the number of view each category gets
        </p>

        <div className="space-y-4">
          {styles.map((style, index) => (
            <div key={style.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-300">{style.category}</span>
                <span className="text-purple-400">{style.views.toLocaleString()} views</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: maxViews > 0 ? `${(style.views / maxViews) * 100}%` : '0%',
                    transitionDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
