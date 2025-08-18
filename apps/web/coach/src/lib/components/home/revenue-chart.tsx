import React, { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
}

interface IProps {
  data: RevenueData[];
  growth: number;
}

export const RevenueChart = ({ data, growth }: IProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("Custom");

  const hasRevenue = data.some(item => item.revenue > 0);
  // const maxRevenue = Math.max(...data.map(item => item.revenue));

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
              {hasRevenue ? `+${growth}% increase from last month.` : 'Track your revenue progress here.'}
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

        {hasRevenue ? (
          <div className="flex-1 relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
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
                  formatter={(value) => [`${value.toLocaleString()}`, "Revenue"]}
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
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="mb-4">
                <TrendingUp className="w-16 h-16 text-stone-600 mx-auto" />
              </div>
              <p className="text-stone-400 text-sm mb-2">
                No revenue data yet.
              </p>
              <p className="text-stone-500 text-xs">
                Connect your payment systems to track revenue growth.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
