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
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import {StatCard} from "@/app/(dashboard)/components/stat-card";
import {useRouter} from "next/navigation";
import {coachesData, revenueData} from "@/app/data";


export default function AdminDashboard() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("Year");

  return (
    <>
      <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] px-8 py-4 fixed top-0 left-64 right-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">Andrew Kramer</p>
              <p className="text-[#A0A0A0] text-xs">
                kramer.andrew@example.com
              </p>
            </div>
            <div className="w-8 h-8 bg-[#7B21BA] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AK</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 p-8 space-y-8 mt-[73px] overflow-y-auto">
        <div className={"flex gap-4"}>
          <div className="bg-[#1A1A1A] w-2/3 rounded-lg p-6 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-lg font-semibold mb-1">
                  Your Revenue
                </h2>
                <p className="text-[#A0A0A0] text-sm">
                  Your earnings has grown 40% since last year
                </p>
              </div>
              <div className="flex items-center gap-2">
                {["Week", "Month", "Year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A0A0A0", fontSize: 12 }}
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
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7B21BA"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#7B21BA" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-1/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Total Coaches" value="565" />
            <StatCard title="All Time Revenue" value="$718,240" />
            <StatCard title="Inactive Coaches" value="20" />
            <StatCard title="Monthly Revenue" value="$50,880" />
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
          <div className="p-6 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-semibold">
                Recently Joined Coaches
              </h2>
              <button className="text-[#7B21BA] text-sm font-medium hover:text-[#8B31CA] transition-colors">
                View All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  User ID
                </th>
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  Name
                </th>
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  Email
                </th>
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  Date Joined
                </th>
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  Subscription Plan
                </th>
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  Account Status
                </th>
                <th className="text-left text-[#A0A0A0] text-sm font-medium p-4">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody>
              {coachesData.map((coach, index) => (
                <tr
                  key={coach.id}
                  className="border-b border-[#2A2A2A] last:border-0"
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
                        className="text-[#7B21BA] text-sm font-medium hover:text-[#8B31CA] transition-colors">
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
      </main>
    </>
  );
}
