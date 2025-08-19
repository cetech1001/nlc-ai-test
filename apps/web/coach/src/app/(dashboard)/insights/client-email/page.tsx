'use client'

import { useState, useEffect } from 'react';
import { sdkClient } from "@/lib";
import { ClientEmailAgentData } from '@nlc-ai/sdk-analytics';
import { Info } from "lucide-react";

const ClientEmailAgentPage = () => {
  const [data, setData] = useState<ClientEmailAgentData | null>(null);
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
      const analyticsData = await sdkClient.analytics.getClientEmailAgentData(coachID);
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <TotalEmailProcessedCard
          value={data.totalEmailProcessed}
          breakdown={data.emailProcessingBreakdown}
          outcomes={data.approvalOutcomes}
        />
        <ResponseTimeSavedCard
          value={data.responseTimeSaved}
          data={data.responseTimeData}
          isLoading={isLoading}
        />
        <AccuracyToneMatchCard
          value={data.accuracyToneMatch}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <ApprovalOutcomesCard
          breakdown={data.emailProcessingBreakdown}
          efficiency={data.approvalOutcomesEfficiency}
          outcomes={data.approvalOutcomes}
        />
        <ToneMatchCard
          percentage={data.toneMatch}
          data={data.toneMatchData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Total Email Processed Card with donut chart
const TotalEmailProcessedCard = ({ value, breakdown, outcomes }: {
  value: number;
  breakdown: ClientEmailAgentData['emailProcessingBreakdown'];
  outcomes: ClientEmailAgentData['approvalOutcomes'];
}) => {
  const maxValue = Math.max(outcomes.mailsSentAsIs, outcomes.mailsSentWithEdits, outcomes.mailResponsesDeleted);
  const total = breakdown.manuallyApproved + breakdown.flaggedForReview + breakdown.rejected;
  const approvedPercentage = total > 0 ? (breakdown.manuallyApproved / total) * 100 : 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Total Email Processed</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{value.toLocaleString()}</div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="rgb(64 64 64 / 0.3)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="url(#emailGradient)"
                strokeWidth="12"
                strokeDasharray={`${approvedPercentage * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="emailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-50 text-lg font-semibold">Emails</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-red-400">{outcomes.mailResponsesDeleted.toLocaleString()}</span>
            <span className="text-stone-300">Mail Responses Deleted/Regenerated</span>
          </div>
        </div>

        <div className="flex justify-between items-end gap-2" style={{ height: '120px' }}>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(outcomes.mailsSentAsIs / maxValue) * 100}px` : '10px' }}
            />
            <span className="text-stone-300 text-xs">As-Is</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-fuchsia-500 to-purple-500 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(outcomes.mailsSentWithEdits / maxValue) * 100}px` : '10px' }}
            />
            <span className="text-stone-300 text-xs">Edits</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(outcomes.mailResponsesDeleted / maxValue) * 100}px` : '10px' }}
            />
            <span className="text-stone-300 text-xs">Regenerated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tone Match Card with horizontal bars
const ToneMatchCard = ({ percentage, data, isLoading }: {
  percentage: number;
  data: any;
  isLoading: boolean;
}) => {
  const total = data.responsesRatedAbove3 + data.responsesRatedBelow3;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Tone Match</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-300">Above 3 Stars</span>
              <span className="text-purple-400">{data.responsesRatedAbove3.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: total > 0 ? `${(data.responsesRatedAbove3 / total) * 100}%` : '0%' }}
              >
                {data.responsesRatedAbove3 > 0 && (
                  <span className="text-white text-xs font-medium">{data.responsesRatedAbove3}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-300">Below 3 Stars</span>
              <span className="text-gray-400">{data.responsesRatedBelow3.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-gray-600 to-gray-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: total > 0 ? `${(data.responsesRatedBelow3 / total) * 100}%` : '0%' }}
              >
                {data.responsesRatedBelow3 > 0 && (
                  <span className="text-white text-xs font-medium">{data.responsesRatedBelow3}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEmailAgentPage;

// Response Time Saved Card with bar chart
const ResponseTimeSavedCard = ({ value, data, isLoading }: {
  value: number;
  data: any;
  isLoading: boolean;
}) => {
  const maxValue = Math.max(data.consumedThroughPlatform, data.wouldHaveBeenConsumedManually);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Response Time Saved</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{value} Hrs</div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-stone-300">{data.consumedThroughPlatform} Hrs</span>
              <span className="text-stone-400">Consumed Through Platform</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: maxValue > 0 ? `${(data.consumedThroughPlatform / maxValue) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-stone-300">{data.wouldHaveBeenConsumedManually} Hrs</span>
              <span className="text-stone-400">Would Have Been Consumed Manually</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: maxValue > 0 ? `${(data.wouldHaveBeenConsumedManually / maxValue) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Accuracy & Tone Match Card with semicircle
const AccuracyToneMatchCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
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
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Accuracy & Tone-Match</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

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
                stroke="url(#accuracyGradient)"
                strokeWidth="12"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-50 text-2xl font-semibold">{value}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Approval Outcomes Card with bar chart
const ApprovalOutcomesCard = ({ breakdown, efficiency, outcomes }: {
  breakdown: ClientEmailAgentData['emailProcessingBreakdown']
  efficiency: number;
  outcomes: any;
}) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Approval Outcomes Efficiency</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{efficiency}%</div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{outcomes.mailsSentAsIs.toLocaleString()}</span>
            <span className="text-stone-300">Mails Sent As-Is</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{outcomes.mailsSentWithEdits.toLocaleString()}</span>
            <span className="text-stone-300">Mails Sent With Some Edits</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{breakdown.manuallyApproved.toLocaleString()}</span>
            <span className="text-stone-300">Manually Approved</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{breakdown.flaggedForReview.toLocaleString()}</span>
            <span className="text-stone-300">Flagged for Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};
