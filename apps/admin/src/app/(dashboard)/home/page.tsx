'use client'

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { StatCard } from "@/app/(dashboard)/components/stat-card";
import { useRouter } from "next/navigation";
import { coachesData, revenueData } from "@/app/data";

export default function AdminDashboard() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("Year");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        {/* Revenue Chart Section - Reduced height */}
        <div className="flex-1 bg-[#1A1A1A] rounded-xl p-4 sm:p-6 border border-[#2A2A2A] min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="min-w-0">
              <h2 className="text-white text-lg font-semibold mb-1">
                Your Revenue
              </h2>
              <p className="text-[#A0A0A0] text-sm">
                Your earnings has grown 33.16% since last year
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {["Week", "Month", "Year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    timePeriod === period
                      ? "bg-[#7B21BA] text-white"
                      : "text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-40 sm:h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B21BA" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#7B21BA" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#7B21BA" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#A0A0A0", fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                  formatter={(value: any) => [
                    `$${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />

                {/* Area component with gradient fill */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7B21BA"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#7B21BA",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full xl:w-80 grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-1 gap-4 lg:gap-6">
          <StatCard title="Total Coaches" value="565" />
          <StatCard title="All Time Revenue" value="$718,240" />
          <StatCard title="Inactive Coaches" value="20" />
          <StatCard title="Monthly Revenue" value="$50,880" />
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#2A2A2A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-white text-lg font-semibold">
              Recently Joined Coaches
            </h2>
            <button className="text-[#7B21BA] text-sm font-medium hover:text-[#8B31CA] transition-colors self-start sm:self-auto">
              View All
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden">
          <div className="divide-y divide-[#2A2A2A]">
            {coachesData.map((coach, index) => (
              <div key={coach.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-sm">{coach.name}</h3>
                    <p className="text-[#A0A0A0] text-xs">{coach.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        coach.status === "Active"
                          ? "bg-green-900/20 text-green-400"
                          : "bg-red-900/20 text-red-400"
                      }`}
                    >
                      {coach.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#A0A0A0] space-y-1">
                  <p>{coach.email}</p>
                  <p>{coach.dateJoined} • {coach.plan}</p>
                </div>
                <button
                  onClick={() => router.push(`/make-payment?coach=${encodeURIComponent(coach.name)}&email=${encodeURIComponent(coach.email)}&date=${encodeURIComponent(coach.dateJoined)}&plan=${encodeURIComponent(coach.plan)}&status=${encodeURIComponent(coach.status)}`)}
                  className="text-[#7B21BA] text-sm font-medium hover:text-[#8B31CA] transition-colors"
                >
                  Make Payment
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="border-b border-[#2A2A2A]">
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                User ID
              </th>
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                Name
              </th>
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                Email
              </th>
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                Date Joined
              </th>
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                Subscription Plan
              </th>
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                Account Status
              </th>
              <th className="text-left text-[#A0A0A0] text-sm font-medium p-4 whitespace-nowrap">
                Actions
              </th>
            </tr>
            </thead>
            <tbody>
            {coachesData.map((coach, index) => (
              <tr
                key={coach.id}
                className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#0F0F0F] transition-colors"
              >
                <td className="p-4 text-white text-sm">{coach.id}</td>
                <td className="p-4 text-white text-sm font-medium">
                  {coach.name}
                </td>
                <td className="p-4 text-[#A0A0A0] text-sm">
                  {coach.email}
                </td>
                <td className="p-4 text-[#A0A0A0] text-sm">
                  {coach.dateJoined}
                </td>
                <td className="p-4 text-[#A0A0A0] text-sm">
                  {coach.plan}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          coach.status === "Active"
                            ? "bg-green-900/20 text-green-400"
                            : "bg-red-900/20 text-red-400"
                        }`}
                      >
                        {coach.status}
                      </span>
                    <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/make-payment?coach=${encodeURIComponent(coach.name)}&email=${encodeURIComponent(coach.email)}&date=${encodeURIComponent(coach.dateJoined)}&plan=${encodeURIComponent(coach.plan)}&status=${encodeURIComponent(coach.status)}`)}
                      className="text-[#7B21BA] text-sm font-medium hover:text-[#8B31CA] transition-colors"
                    >
                      Make Payment
                    </button>
                    <button className="text-[#A0A0A0] hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
