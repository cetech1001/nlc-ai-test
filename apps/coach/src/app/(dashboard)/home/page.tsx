'use client'

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Info,
  Play,
  FileText,
  Flag,
  Trophy,
  Phone,
  Star,
} from "lucide-react";
import { StatCard } from "@nlc-ai/shared";

// Mock data
const revenueData = [
  { date: 'Jun 07', revenue: 4500 },
  { date: 'Jun 08', revenue: 4200 },
  { date: 'Jun 09', revenue: 4800 },
  { date: 'Jun 10', revenue: 5500 },
  { date: 'Jun 11', revenue: 5200 },
  { date: 'Jun 12', revenue: 5800 },
  { date: 'Jun 13', revenue: 6000 }
];

const topPerformingContent = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    duration: "01:20",
    time: "08:57 PM",
    date: "14 APR",
    impressions: "11,121",
    engagement: "7,180",
    platform: "instagram"
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    duration: "01:20",
    time: "08:57 PM",
    date: "14 APR",
    impressions: "11,121",
    engagement: "7,180",
    platform: "facebook"
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1609902726285-00668009f004?w=400&h=300&fit=crop",
    duration: "01:20",
    time: "08:57 PM",
    date: "14 APR",
    impressions: "11,121",
    engagement: "7,180",
    platform: "tiktok"
  }
];

const ItemsNeedingReview = () => {
  const items = [
    { icon: FileText, label: "Drafts", count: 3, color: "text-purple-400" },
    { icon: Flag, label: "Flagged Clients", count: 2, color: "text-red-400" },
    { icon: Trophy, label: "Testimonial Approval", count: 1, color: "text-yellow-400" }
  ];

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-6">Items Needing Review</h3>

        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-stone-300 text-sm">{item.label}</span>
              </div>
              <span className="text-white text-lg font-semibold">{item.count}</span>
            </div>
          ))}
        </div>

        <button className="text-stone-400 text-sm hover:text-stone-300 transition-colors">
          View All Actions
        </button>
      </div>
    </div>
  );
};

const CourseCompletionRate = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-stone-50 text-xl font-medium leading-relaxed">
            Leads to Follow Up
          </h3>
        </div>

        <div className="space-y-2 text-stone-300 text-sm">
          <p>2 leads opened last email.</p>
          <p>1 booked a call.</p>
          <p>1 ghosted again.</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialOpportunity = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-stone-50 text-xl font-medium leading-relaxed">
            New Testimonial Opportunity
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-stone-300 text-sm mb-4">
            Rachel: "This changed everything for me."
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Approve for Social
          </button>
          <div className="flex gap-3">
            <button className="flex-1 bg-neutral-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors">
              Edit
            </button>
            <button className="flex-1 bg-neutral-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors">
              Save for Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RevenueChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Custom");

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden h-full">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-64 h-64 -left-12 top-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-stone-50 text-xl font-medium leading-relaxed mb-2">
              Revenue Growth
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              +23.5% increase from last month.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {["This Week", "Last Week", "Custom"].map((period, index, array) => (
              <React.Fragment key={period}>
                <button
                  onClick={() => setSelectedPeriod(period)}
                  className={`text-sm font-normal leading-relaxed transition-colors whitespace-nowrap ${
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

        <div className="flex-1 relative min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C084FC" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#581C87" stopOpacity={0.05}/>
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
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#C084FC"
                strokeWidth={3}
                dot={false}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 6,
                  fill: "#C084FC",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-[#7B21BA] text-white px-3 py-2 rounded-lg text-sm font-medium relative">
              Jun 10, 2025
              <div className="text-center text-lg font-bold">$5,500</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#7B21BA]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResponseTimeSaved = () => {
  return (
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-2">
            Response Time Saved This Week
          </h3>
          <button className="text-stone-400 hover:text-stone-300">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-stone-50 text-4xl font-semibold mb-2">534 Hrs</div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">Consumed Through Platform</span>
            <span className="text-white text-sm font-medium">1,238</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 h-3 rounded-full shadow-lg" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">Would Have Been Consumed Manually</span>
            <span className="text-white text-sm font-medium">1,832</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full shadow-lg" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopPerformingContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Year");

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden h-full">
      <div className="absolute w-32 h-32 lg:w-64 lg:h-64 -left-8 -top-8 lg:-left-16 lg:-top-16 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[80px] lg:blur-[112px]" />
      <div className="absolute w-24 h-24 lg:w-48 lg:h-48 -right-6 -bottom-6 lg:-right-12 lg:-bottom-12 opacity-40 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[60px] lg:blur-[80px]" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between mb-6">
          <div>
            <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-1">
              Top Performing Content
            </h3>
            <p className="text-stone-300 text-sm">What works best for your viewers</p>
          </div>

          <div className="flex items-center gap-3">
            {["Week", "Month", "Year"].map((period, index, array) => (
              <React.Fragment key={period}>
                <button
                  onClick={() => setSelectedPeriod(period)}
                  className={`text-sm font-normal leading-relaxed transition-colors whitespace-nowrap ${
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {topPerformingContent.map((content) => (
            <div key={content.id} className="relative group cursor-pointer bg-neutral-800/50 rounded-xl overflow-hidden border border-neutral-700/50 hover:border-fuchsia-400/30 transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={content.thumbnail}
                  alt="Content thumbnail"
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 left-2">
                  {content.platform === 'instagram' && (
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs">📷</span>
                    </div>
                  )}
                  {content.platform === 'facebook' && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">f</span>
                    </div>
                  )}
                  {content.platform === 'tiktok' && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center shadow-lg border border-white/20">
                      <span className="text-white text-xs">🎵</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  {content.duration}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                  {content.time} {content.date}
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-stone-400 block">Impressions</span>
                      <div className="text-white font-medium">{content.impressions}</div>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Engagement</span>
                      <div className="text-white font-medium">{content.engagement}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CoachDashboard() {
  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Total Clients"
          value="4,629"
          description="Number Of enrolled students or active clients"
        />
        <StatCard
          title="Coach Confidence Score"
          value="85%"
          description="Accuracy of AI outputs based on coach approval/edit history"
        />
        <div className={"hidden sm:block"}>
          <ItemsNeedingReview />
        </div>
      </div>
      <div className={"sm:hidden"}>
        <ItemsNeedingReview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 h-full">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <ResponseTimeSaved />
        </div>
      </div>

      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TestimonialOpportunity />
          <div className={"flex flex-col gap-3"}>
            <CourseCompletionRate />
            <StatCard
              title="Leads Captured Weekly"
              value="32"
              description=""
            />
          </div>
        </div>
        <TopPerformingContent />
      </div>
    </div>
  );
}
