'use client'

import { useState, useEffect } from 'react';
import { sdkClient } from "@/lib";
import { LeadFollowUpAgentData } from '@nlc-ai/sdk-analytics';
import { Info } from "lucide-react";

const LeadFollowUpAgentPage = () => {
  const [data, setData] = useState<LeadFollowUpAgentData | null>(null);
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
      const analyticsData = await sdkClient.analytics.getLeadFollowUpAgentData(coachID);
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
        <FollowUpSuccessRatesCard value={data.followUpSuccessRates} isLoading={isLoading} />
        <LeadConversionBoostCard
          percentage={data.leadConversionBoost}
          conversionData={data.conversionData}
          isLoading={isLoading}
        />
        <ResponseRateAfterFollowUpCard
          percentage={data.responseRateAfterFollowUp}
          responseData={data.responseData}
          conversionData={data.conversionData}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        <HighestConversionCoursesCard
          courses={data.courseConversions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Follow-up Success Rates Card with semicircle
const FollowUpSuccessRatesCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
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
        <h3 className="text-stone-50 text-lg font-medium mb-2">Follow-up Success Rates</h3>
        <p className="text-stone-400 text-sm mb-6">
          Percentage decrease in client drop-off after proactive outreach.
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
                stroke="url(#followUpGradient)"
                strokeWidth="12"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="followUpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{(value * 12.32).toFixed(0)}</span>
            <span className="text-stone-300">Leads Converted</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{(value * 18.32).toFixed(0)}</span>
            <span className="text-stone-300">Follow-up Emails Sent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lead Conversion Boost Card with bar chart
const LeadConversionBoostCard = ({ percentage, conversionData, isLoading }: {
  percentage: number;
  conversionData: any;
  isLoading: boolean;
}) => {
  const maxValue = Math.max(conversionData.leadsConverted, conversionData.followUpEmailsSent);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Lead Conversion Boost</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{conversionData.leadsConverted.toLocaleString()}</span>
            <span className="text-stone-300">Leads Converted</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{conversionData.followUpEmailsSent.toLocaleString()}</span>
            <span className="text-stone-300">Follow-up Emails Sent</span>
          </div>
        </div>

        <div className="flex justify-between items-end gap-2" style={{ height: '100px' }}>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(conversionData.leadsConverted / maxValue) * 80}px` : '10px' }}
            />
            <span className="text-stone-300 text-xs">Conversions</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className="w-full bg-gradient-to-t from-fuchsia-500 to-purple-500 rounded-t transition-all duration-1000"
              style={{ height: maxValue > 0 ? `${(conversionData.followUpEmailsSent / maxValue) * 80}px` : '10px' }}
            />
            <span className="text-stone-300 text-xs">Follow-Ups Sent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Response Rate After Follow-Up Card with horizontal bars
const ResponseRateAfterFollowUpCard = ({ percentage, responseData, conversionData }: {
  percentage: number;
  responseData: LeadFollowUpAgentData['responseData'];
  conversionData: LeadFollowUpAgentData['conversionData'];
  isLoading: boolean;
}) => {
  const total = responseData.responsesReceived + responseData.followUpsSent;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Response Rate After Follow-Up</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{percentage}%</div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{conversionData.leadsConverted.toLocaleString()}</span>
            <span className="text-stone-300">Leads Converted</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fuchsia-400">{conversionData.followUpEmailsSent.toLocaleString()}</span>
            <span className="text-stone-300">Follow-up Emails Sent</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-300">Responses Received</span>
              <span className="text-purple-400">{responseData.responsesReceived.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: total > 0 ? `${(responseData.responsesReceived / total) * 100}%` : '0%' }}
              >
                {responseData.responsesReceived > 0 && (
                  <span className="text-white text-xs font-medium">{responseData.responsesReceived}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-300">Follow-Ups Sent</span>
              <span className="text-fuchsia-400">{responseData.followUpsSent.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: total > 0 ? `${(responseData.followUpsSent / total) * 100}%` : '0%' }}
              >
                {responseData.followUpsSent > 0 && (
                  <span className="text-white text-xs font-medium">{responseData.followUpsSent}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Highest Conversion Courses Card with bar chart
const HighestConversionCoursesCard = ({ courses, isLoading }: {
  courses: any[];
  isLoading: boolean;
}) => {
  const maxConversions = courses.length > 0 ? Math.max(...courses.map(c => c.conversions)) : 0;
  const totalConversions = courses.reduce((sum, c) => sum + c.conversions, 0);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Highest Conversion Courses</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">
          {totalConversions.toLocaleString()}
        </div>

        <div className="space-y-3 mb-6">
          {courses.map((course, index) => (
            <div key={course.courseName}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-400">{course.conversions} Conversions</span>
                <span className="text-stone-300">{course.courseName}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end gap-2" style={{ height: '120px' }}>
          {courses.map((course, index) => (
            <div key={course.courseName} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t transition-all duration-1000"
                style={{
                  height: maxConversions > 0 ? `${(course.conversions / maxConversions) * 100}px` : '10px',
                  transitionDelay: `${index * 200}ms`
                }}
              />
              <span className="text-stone-300 text-xs text-center">
                {course.courseName.replace('Course ', 'C ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadFollowUpAgentPage;
