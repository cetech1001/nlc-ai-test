'use client'

import { useState, useEffect } from 'react';
import { sdkClient } from "@/lib";
import { CoachReplicaAgentData } from '@nlc-ai/sdk-analytics';
import { Calendar, TrendingUp, MessageCircle, ThumbsUp, ThumbsDown, Info } from "lucide-react";

const CoachReplicaAgentPage = () => {
  const [data, setData] = useState<CoachReplicaAgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const coachID = 'current-coach-id';
      const analyticsData = await sdkClient.analytics.getCoachReplicaAgentData(coachID);
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <AppointmentSettingCard value={data.appointmentSettingEfficiency} isLoading={isLoading} />
        <TotalClientInteractionsCard value={data.totalClientInteractions} isLoading={isLoading} />
        <HighestLeadsCapturedCard month={data.highestLeadsCapturedIn} isLoading={isLoading} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <LeadCaptureRateCard
          rate={data.leadCaptureRate}
          isLoading={isLoading}
        />
        <ClientInteractionQualityCard
          percentage={data.clientInteractionQuality}
          qualityData={data.interactionQualityData}
          isLoading={isLoading}
        />
        <ConversionMetricsCard
          percentage={data.conversionMetrics}
          conversionData={data.conversionData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Appointment Setting Efficiency Card
const AppointmentSettingCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Appointment Setting Efficiency</h3>
        <p className="text-stone-400 text-sm mb-8">
          Number of calls booked directly through the agent.
        </p>

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="text-stone-50 text-4xl font-semibold">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Total Client Interactions Card
const TotalClientInteractionsCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Total Client Interactions</h3>
        <p className="text-stone-400 text-sm mb-8">
          Number of interactions by all clients on your replica.
        </p>

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-stone-50 text-4xl font-semibold">{value.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Highest Leads Captured Card
const HighestLeadsCapturedCard = ({ month, isLoading }: { month: string; isLoading: boolean }) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Highest Leads Captured In</h3>
        <p className="text-stone-400 text-sm mb-8">
          Maximum leads captured month in this year
        </p>

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-stone-50 text-4xl font-semibold">{month}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lead Capture Rate Card with semicircle
const LeadCaptureRateCard = ({ rate, isLoading }: { rate: number; isLoading: boolean }) => {
  const semicircleCircumference = Math.PI * 50;
  const targetOffset = semicircleCircumference - (rate / 100) * semicircleCircumference;
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
        <h3 className="text-stone-50 text-lg font-medium mb-2">Lead Capture Rate</h3>
        <p className="text-stone-400 text-sm mb-6">
          Number of leads captured via the chatbot.
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
                stroke="url(#captureGradient)"
                strokeWidth="12"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="captureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-50 text-2xl font-semibold">{rate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Interaction Quality Card with bar chart
const ClientInteractionQualityCard = ({ percentage, qualityData, isLoading }: {
  percentage: number;
  qualityData: any;
  isLoading: boolean;
}) => {
  // const total = qualityData.likesOnChatInteractions + qualityData.dislikesOnChatInteractions;
  const maxValue = Math.max(qualityData.likesOnChatInteractions, qualityData.dislikesOnChatInteractions);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Client Interaction Quality</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-green-400">{qualityData.likesOnChatInteractions.toLocaleString()}</span>
            <span className="text-stone-300">Likes On Chat Interactions</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-400">{qualityData.dislikesOnChatInteractions.toLocaleString()}</span>
            <span className="text-stone-300">Dislikes On Chat Interactions</span>
          </div>
        </div>

        <div className="flex justify-between items-end gap-2" style={{ height: '100px' }}>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(qualityData.likesOnChatInteractions / maxValue) * 80}px` : '10px' }}
            />
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-green-400" />
              <span className="text-stone-300 text-xs">Likes</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(qualityData.dislikesOnChatInteractions / maxValue) * 80}px` : '10px' }}
            />
            <div className="flex items-center gap-1">
              <ThumbsDown className="w-3 h-3 text-red-400" />
              <span className="text-stone-300 text-xs">Dislikes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Conversion Metrics Card with horizontal bars
const ConversionMetricsCard = ({ percentage, conversionData, isLoading }: {
  percentage: number;
  conversionData: any;
  isLoading: boolean;
}) => {
  const total = conversionData.leadsConverted + conversionData.totalLeadsCaptured;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Conversion Metrics</h3>
        <p className="text-stone-400 text-sm mb-6">
          Leads captured versus those that convert to paying clients.
        </p>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{conversionData.leadsConverted.toLocaleString()}</span>
            <span className="text-stone-300">Leads Converted</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{conversionData.totalLeadsCaptured.toLocaleString()}</span>
            <span className="text-stone-300">Total Leads Captured</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: total > 0 ? `${(conversionData.leadsConverted / total) * 100}%` : '0%' }}
              >
                <span className="text-white text-xs font-medium">Leads Converted</span>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: total > 0 ? `${(conversionData.totalLeadsCaptured / total) * 100}%` : '0%' }}
              >
                <span className="text-white text-xs font-medium">Total Leads Captured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachReplicaAgentPage;
