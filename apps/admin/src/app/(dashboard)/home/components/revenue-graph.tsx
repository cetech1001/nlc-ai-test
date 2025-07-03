import React, { useState, useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const RevenueGraph = () => {
  const [timePeriod, setTimePeriod] = useState("Year");

  const chartData = useMemo(() => {
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

    const yearData = [
      { period: "Jan", revenue: 45000 },
      { period: "Feb", revenue: 52000 },
      { period: "Mar", revenue: 48000 },
      { period: "Apr", revenue: 61000 },
      { period: "May", revenue: 55000 },
      { period: "Jun", revenue: 67000 },
      { period: "Jul", revenue: 70000 },
      { period: "Aug", revenue: 62000 },
      { period: "Sep", revenue: 78000 },
      { period: "Oct", revenue: 85000 },
      { period: "Nov", revenue: 92000 },
      { period: "Dec", revenue: 98000 },
    ];

    return {
      Week: weekData,
      Month: monthData,
      Year: yearData,
    };
  }, []);

  const growthDescription = useMemo(() => {
    const descriptions = {
      Week: "Your earnings has grown 8.5% since last week",
      Month: "Your earnings has grown 12.3% since last month",
      Year: "Your earnings has grown 33.16% since last year",
    };
    return descriptions[timePeriod as keyof typeof descriptions];
  }, [timePeriod]);

  const handlePeriodChange = useCallback((period: string) => {
    requestAnimationFrame(() => {
      setTimePeriod(period);
    });
  }, []);

  const currentChartData = chartData[timePeriod as keyof typeof chartData];

  return (
    <div className="relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div className="min-w-0 w-full sm:w-80">
          <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed mb-1.5">
            Your Revenue
          </h2>
          <p className="text-stone-300 text-sm font-normal leading-tight sm:leading-relaxed">
            {growthDescription}
          </p>
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-5 flex-shrink-0">
          {["Week", "Month", "Year"].map((period, index, array) => (
            <React.Fragment key={period}>
              <button
                onClick={() => handlePeriodChange(period)}
                className={`text-sm font-normal leading-relaxed transition-all duration-200 ease-out whitespace-nowrap ${
                  timePeriod === period
                    ? "text-fuchsia-400 font-bold transform scale-105"
                    : "text-stone-300 hover:text-stone-50"
                }`}
                style={{
                  // Reduce paint operations on mobile
                  willChange: timePeriod === period ? 'auto' : 'transform',
                }}
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
              // Optimize tooltip performance
              animationDuration={150}
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
              // Optimize area animations
              animationDuration={300}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
