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
import { StatCard } from "@/app/(dashboard)/home/components/stat-card";
import {DataTable, TableAction} from "@/app/(dashboard)/components/data-table";
import { useRouter } from "next/navigation";
import {coachColumns, coachesData, revenueData} from "@/app/data";

export default function AdminDashboard() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("Year");

  // Generate sample data for different time periods
  const weekData = [
    { period: "Sun", revenue: 19000 },
    { period: "Mon", revenue: 12000 },
    { period: "Tue", revenue: 15000 },
    { period: "Wed", revenue: 18000 },
    { period: "Thu", revenue: 14000 },
    { period: "Fri", revenue: 22000 },
    { period: "Sat", revenue: 25000 },
  ];

  const monthData = [
    { period: "Week 1", revenue: 85000 },
    { period: "Week 2", revenue: 92000 },
    { period: "Week 3", revenue: 78000 },
    { period: "Week 4", revenue: 98000 },
  ];

  // Function to get chart data based on selected time period
  const getChartData = () => {
    switch (timePeriod) {
      case "Week":
        return weekData;
      case "Month":
        return monthData;
      case "Year":
      default:
        return revenueData;
    }
  };

  // Function to get growth description based on time period
  const getGrowthDescription = () => {
    switch (timePeriod) {
      case "Week":
        return "Your earnings has grown 8.5% since last week";
      case "Month":
        return "Your earnings has grown 12.3% since last month";
      case "Year":
      default:
        return "Your earnings has grown 33.16% since last year";
    }
  };

  const handleRowAction = (action: string, coach: any) => {
    if (action === 'payment') {
      router.push('/coaches/make-payment');
    } else if (action === 'view') {
      console.log('Viewing coach:', coach.name);
    }
  };

  const actions: TableAction[] = [
    {
      label: 'Make Payment',
      action: 'payment',
      variant: 'primary',
    }
  ];

  const currentChartData = getChartData();

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
              <div className="min-w-0 w-full sm:w-80">
                <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed mb-1.5">
                  Your Revenue
                </h2>
                <p className="text-stone-300 text-sm font-normal leading-tight sm:leading-relaxed">
                  {getGrowthDescription()}
                </p>
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-5 flex-shrink-0">
                {["Week", "Month", "Year"].map((period, index, array) => (
                  <React.Fragment key={period}>
                    <button
                      onClick={() => setTimePeriod(period)}
                      className={`text-sm font-normal leading-relaxed transition-colors whitespace-nowrap ${
                        timePeriod === period
                          ? "text-fuchsia-400 font-bold"
                          : "text-stone-300 hover:text-stone-50"
                      }`}
                    >
                      {period}
                    </button>
                    {index < array.length - 1 && (
                      <div className="w-3 sm:w-4 h-0 border-t-[0.5px] border-white rotate-90" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="h-40 sm:h-48 lg:h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 0
                  }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity={0.2}/>
                      <stop offset="50%" stopColor="#7B21BA" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#581C87" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#A3A3A3",
                      fontSize: 12
                    }}
                    interval={0}
                    angle={currentChartData.length > 7 ? -45 : 0}
                    textAnchor={currentChartData.length > 7 ? "end" : "middle"}
                    height={currentChartData.length > 7 ? 60 : 30}
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
                    type="linear"
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
          <button
            onClick={() => router.push('/coaches')}
            className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors self-start sm:self-auto"
          >
            View All
          </button>
        </div>

        <DataTable
          columns={coachColumns}
          data={coachesData}
          onRowAction={handleRowAction}
          actions={actions}
          showMobileCards={true}
          emptyMessage="No coaches found"
        />
      </div>
    </div>
  );
}
