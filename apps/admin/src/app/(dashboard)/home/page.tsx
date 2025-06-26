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
/*import {
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";*/
import { StatCard } from "@/app/(dashboard)/components/stat-card";
// import { useRouter } from "next/navigation";
import { coachesData, revenueData } from "@/app/data";

export default function AdminDashboard() {
  // const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("Year");

  const handleMakePayment = (coach: any) => {
    // Router functionality would go here
    console.log('Making payment for:', coach.name);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
              <div className="min-w-0 w-80">
                <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed mb-1.5">
                  Your Revenue
                </h2>
                <p className="text-stone-300 text-sm font-normal leading-tight sm:leading-relaxed">
                  Your earnings has grown 33.16% since last year
                </p>
              </div>
              <div className="flex items-center justify-end gap-5 flex-shrink-0">
                {["Week", "Month", "Year"].map((period, index, array) => (
                  <React.Fragment key={period}>
                    <button
                      onClick={() => setTimePeriod(period)}
                      className={`text-sm font-normal leading-relaxed transition-colors ${
                        timePeriod === period
                          ? "text-fuchsia-400 font-bold"
                          : "text-stone-300 hover:text-stone-50"
                      }`}
                    >
                      {period}
                    </button>
                    {index < array.length - 1 && (
                      <div className="w-4 h-0 border-t-[0.5px] border-white rotate-90" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="h-40 sm:h-48 lg:h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity={0.2}/>
                      <stop offset="50%" stopColor="#7B21BA" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#581C87" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A3A3A3", fontSize: 14 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #404040",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7B21BA"
                    strokeWidth={3.46}
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
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCard title="Total Coaches" value="565" />
          <StatCard title="All Time Revenue" value="$718,240" />
          <StatCard title="Inactive Coaches" value="20" />
          <StatCard title="Monthly Revenue" value="$50,880" />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-xl sm:text-2xl font-semibold leading-relaxed">
            Recently Joined Coaches
          </h2>
          <button className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors self-start sm:self-auto">
            View All
          </button>
        </div>

        <div className="block sm:hidden">
          <div className="space-y-4">
            {coachesData.map((coach) => (
              <div key={coach.id} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-stone-50 font-medium text-base leading-tight truncate">{coach.name}</h3>
                      <p className="text-stone-300 text-sm leading-tight mt-0.5">{coach.id}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span
                        className={`text-sm font-medium whitespace-nowrap ${
                          coach.status === "Active"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {coach.status}
                      </span>
                      {/*<ChevronDown className="w-4 h-4 text-stone-50" />*/}
                    </div>
                  </div>
                  <div className="text-stone-300 text-sm leading-tight space-y-1">
                    <p className="truncate">{coach.email}</p>
                    <p className="text-xs">
                      <span className="text-stone-400">{coach.dateJoined}</span>
                      <span className="text-stone-500 mx-1">•</span>
                      <span className="text-stone-300">{coach.plan}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleMakePayment(coach)}
                    className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors"
                  >
                    Make Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:block relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-56 h-56 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]`}
                style={{
                  left: `${-46 + i * 290}px`,
                  top: i === 0 ? '-80px' : '-40px',
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="h-16 rounded-tl-[30px] rounded-tr-[30px] flex items-center bg-[#7B21BA] px-6">
              <div className="w-full grid grid-cols-7 gap-4 text-sm lg:text-base">
                <div className="text-stone-50 font-semibold leading-relaxed">User ID</div>
                <div className="text-stone-50 font-semibold leading-relaxed">Name</div>
                <div className="text-stone-50 font-semibold leading-relaxed">Email</div>
                <div className="text-stone-50 font-semibold leading-relaxed">Date Joined</div>
                <div className="text-stone-50 font-semibold leading-relaxed">Plan</div>
                <div className="text-stone-50 font-semibold leading-relaxed">Status</div>
                <div className="text-stone-50 font-semibold leading-relaxed text-right">Actions</div>
              </div>
            </div>

            <div className="divide-y divide-neutral-700">
              {coachesData.map((coach, index) => (
                <div key={coach.id} className="h-16 flex items-center px-6 hover:bg-black/10 transition-colors">
                  <div className="w-full grid grid-cols-7 gap-4 items-center text-sm lg:text-base">
                    <div className="text-stone-50 font-normal leading-relaxed">{coach.id}</div>
                    <div className="text-stone-50 font-normal leading-relaxed truncate">{coach.name}</div>
                    <div className="text-stone-50 font-normal leading-relaxed truncate">{coach.email}</div>
                    <div className="text-stone-50 font-normal leading-relaxed whitespace-nowrap">{coach.dateJoined}</div>
                    <div className="text-stone-50 font-normal leading-relaxed">{coach.plan}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-normal leading-relaxed ${
                          coach.status === "Active"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {coach.status}
                      </span>
                      {/*<ChevronDown className="w-4 h-4 text-stone-50" />*/}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMakePayment(coach)}
                        className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
                      >
                        Make Payment
                      </button>
                      {/*<button className="text-stone-50 hover:text-stone-300 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>*/}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
