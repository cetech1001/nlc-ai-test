'use client'

import React, { useState, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sdkClient } from "@/lib";
import { ClientRetentionAgentData } from '@nlc-ai/sdk-analytics';
import { Star, Info } from "lucide-react";

const ClientRetentionAgentPage = () => {
  const [data, setData] = useState<ClientRetentionAgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const coachID = 'current-coach-id';
      const analyticsData = await sdkClient.analytics.getClientRetentionAgentData(coachID);
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
        <SurveyResponseRateCard
          data={data.surveyTrendData}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          isLoading={isLoading}
        />
        <ClientEngagementCard
          total={data.clientEngagementLevel}
          breakdown={data.clientEngagementBreakdown}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <ChurnReductionCard value={data.churnReduction} isLoading={isLoading} />
        <ClientSatisfactionCard value={data.clientSatisfactionTrends} isLoading={isLoading} />
        <SuccessStoriesCard value={data.successStories} isLoading={isLoading} />
        <TopRetentionTemplatesCard templates={data.retentionTemplates} isLoading={isLoading} />
      </div>
    </div>
  );
};

// Survey Response Rate Card with line chart
const SurveyResponseRateCard = ({ data, selectedPeriod, setSelectedPeriod, isLoading }: {
  data: any[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  isLoading: boolean;
}) => {
  const responseRate = data.length > 0 ? data[data.length - 1].responseRate : 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
          <h3 className="text-stone-50 text-lg font-medium">Survey Response Rate</h3>
          <div className="flex items-center gap-3">
            {["This Week", "Last Week", "Custom"].map((period, index, array) => (
              <React.Fragment key={period}>
                <button
                  onClick={() => setSelectedPeriod(period)}
                  className={`text-sm transition-colors whitespace-nowrap ${
                    selectedPeriod === period
                      ? "text-fuchsia-400 font-medium"
                      : "text-stone-300 hover:text-stone-50"
                  }`}
                >
                  {period}
                </button>
                {index < array.length - 1 && (
                  <div className="w-3 h-0 border-t-[0.5px] border-white/30 rotate-90" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="text-stone-300 text-sm mb-6">
          {responseRate}% of average clients of clients responded this week.
        </p>

        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="surveyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C084FC" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#581C87" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A3A3A3", fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
                formatter={(value) => [`${value}%`, "Response Rate"]}
              />
              <Line
                type="monotone"
                dataKey="responseRate"
                stroke="#C084FC"
                strokeWidth={3}
                dot={{ fill: "#C084FC", strokeWidth: 2, r: 4 }}
                fill="url(#surveyGradient)"
                activeDot={{
                  r: 6,
                  fill: "#C084FC",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Highlighted data point */}
        <div className="bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-fuchsia-400 rounded-full" />
            <span className="text-fuchsia-400 text-sm font-medium">Jun 10, 2025</span>
          </div>
          <div className="text-white text-lg font-semibold">55%</div>
        </div>
      </div>
    </div>
  );
};

// Client Engagement Level Card with donut chart
const ClientEngagementCard = ({ total, breakdown, isLoading }: {
  total: number;
  breakdown: any;
  isLoading: boolean;
}) => {
  const activePercentage = total > 0 ? (breakdown.activeClients / total) * 100 : 0;
  // const atRiskPercentage = total > 0 ? (breakdown.atRiskClients / total) * 100 : 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Client Engagement Level</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">{total.toLocaleString()}</div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="rgb(64 64 64 / 0.3)"
                strokeWidth="12"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="url(#engagementGradient)"
                strokeWidth="12"
                strokeDasharray={`${activePercentage * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-50 text-lg font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">{breakdown.activeClients.toLocaleString()}</span>
            <span className="text-stone-300">Active Clients</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-orange-400">{breakdown.atRiskClients.toLocaleString()}</span>
            <span className="text-stone-300">At-Risk Clients</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{breakdown.inactiveClients.toLocaleString()}</span>
            <span className="text-stone-300">Inactive Clients</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Churn Reduction Card
const ChurnReductionCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
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
        <h3 className="text-stone-50 text-lg font-medium mb-2">Churn Reduction</h3>
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
                stroke="url(#churnGradient)"
                strokeWidth="12"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="churnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

// Client Satisfaction Trends Card
const ClientSatisfactionCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-medium mb-2">Client Satisfaction Trends</h3>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="flex items-center justify-center">
            <Star className="w-16 h-16 text-yellow-400 fill-current" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-stone-50 text-4xl font-semibold mb-2">{value.toFixed(1)}</div>
          <p className="text-stone-400 text-sm">Average rating</p>
        </div>
      </div>
    </div>
  );
};

// Success Stories Card
const SuccessStoriesCard = ({ value, isLoading }: { value: number; isLoading: boolean }) => {
  const semicircleCircumference = Math.PI * 50;
  const targetOffset = semicircleCircumference - (value / 1000) * semicircleCircumference; // Assuming max 1000
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
        <h3 className="text-stone-50 text-lg font-medium mb-2">Success Stories</h3>
        <p className="text-stone-400 text-sm mb-6">
          Number of positive testimonials gathered.
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
                stroke="url(#successGradient)"
                strokeWidth="12"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

// Top Client Retention Templates Card
const TopRetentionTemplatesCard = ({ templates, isLoading }: {
  templates: any[];
  isLoading: boolean;
}) => {
  const maxRetentions = templates.length > 0 ? Math.max(...templates.map(t => t.retentions)) : 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-stone-50 text-lg font-medium">Top 3 Client Retention Templates</h3>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="text-stone-50 text-4xl font-semibold mb-6">
          {templates.reduce((sum, t) => sum + t.retentions, 0).toLocaleString()}
        </div>

        <div className="space-y-3 mb-6">
          {templates.map((template, index) => (
            <div key={template.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-400">{template.retentions} Retentions</span>
                <span className="text-stone-300">{template.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end gap-2" style={{ height: '80px' }}>
          {templates.map((template, index) => (
            <div key={template.name} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t transition-all duration-1000"
                style={{
                  height: maxRetentions > 0 ? `${(template.retentions / maxRetentions) * 60}px` : '5px',
                  transitionDelay: `${index * 200}ms`
                }}
              />
              <span className="text-stone-300 text-xs text-center">
                {template.name.includes('FS') ? template.name : template.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientRetentionAgentPage;
