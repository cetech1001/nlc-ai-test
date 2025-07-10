import React, { useState, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { dashboardAPI } from "@nlc-ai/api-client";
import {RevenueGrowthData} from "@nlc-ai/types";

interface RevenueGraphProps {
  revenueData: RevenueGrowthData;
}

export const RevenueGraph = ({ revenueData: initialData }: RevenueGraphProps) => {
  const [timePeriod, setTimePeriod] = useState<"Week" | "Month" | "Year">("Year");
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(initialData);
  const chartRef = useRef<HTMLDivElement>(null);

  const getCurrentData = useCallback(() => {
    if (revenueData) {
      return revenueData.data;
    }
    return [];
  }, [timePeriod, revenueData]);

  const handlePeriodChange = useCallback(async (period: "Week" | "Month" | "Year") => {
    if (period === timePeriod || isLoading) return;

    if (chartRef.current) {
      chartRef.current.style.opacity = '0.7';
      chartRef.current.style.transition = 'opacity 200ms ease-out';
    }

    const periodKey = period.toLowerCase() as 'week' | 'month' | 'year';
    const isNotCurrentPeriod = period !== timePeriod;

     if (isNotCurrentPeriod) {
      try {
        setIsLoading(true);
        const newData = await dashboardAPI.getRevenueData(periodKey);
        setRevenueData(newData);
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    setTimeout(() => {
      setTimePeriod(period);

      requestAnimationFrame(() => {
        if (chartRef.current) {
          chartRef.current.style.opacity = '1';
        }
      });
    }, 100);
  }, [timePeriod, isLoading, revenueData]);

  const currentData = getCurrentData();

  const formatTooltip = useCallback((value: any, name: string) => {
    return [`${value.toLocaleString()}`, "Revenue"];
  }, []);

  return (
    <div className="relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div className="min-w-0 w-full sm:w-85">
          <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed mb-1.5">
            Your Revenue
          </h2>
          <p className="text-stone-300 text-sm font-normal leading-tight sm:leading-relaxed transition-all duration-300">
            {isLoading ? `Fetching revenue data...` : revenueData.growthDescription}
          </p>
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-5 flex-shrink-0">
          {(["Week", "Month", "Year"] as const).map((period, index, array) => (
            <React.Fragment key={period}>
              <button
                onClick={() => handlePeriodChange(period)}
                disabled={isLoading}
                className={`text-sm font-normal leading-relaxed transition-all duration-300 ease-out whitespace-nowrap disabled:opacity-50 ${
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

      <div
        ref={chartRef}
        className="h-40 sm:h-48 lg:h-56 relative transition-opacity duration-300 ease-out"
      >
        {currentData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-stone-400 text-center">
              <div className="text-lg mb-2">No revenue data available</div>
              <div className="text-sm">Data will appear here when transactions are processed</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentData}
              margin={{
                top: 10,
                right: 20,
                left: 20,
                bottom: 0
              }}
            >
              <defs>
                <linearGradient id={`revenueGradient-${timePeriod}`} x1="0" y1="0" x2="0" y2="1">
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
                angle={timePeriod === "Year" ? -45 : 0}
                textAnchor="middle"
                height={30}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #404040",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                formatter={formatTooltip}
                animationDuration={0}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7B21BA"
                strokeWidth={3.46}
                fill={`url(#revenueGradient-${timePeriod})`}
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#7B21BA",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
                animationBegin={0}
                animationDuration={400}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
