'use client';

import React, { useEffect, useState } from 'react';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';

interface ActivityHeatmapData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  userID?: string;
  className?: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
                                                                  userID,
                                                                  className = '',
                                                                }) => {
  const [data, setData] = useState<ActivityHeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    if (userID) {
      fetchHeatmapData();
    }
  }, [userID]);

  const fetchHeatmapData = async () => {
    setIsLoading(true);
    try {
      // Get data for the last year
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const result =
        await sdkClient.auth.activity.getUserHeatmap(
          userID!,
          startDate.toISOString(),
          endDate.toISOString()
        );

      setData(result);
    } catch (e: any) {
      toast.error('Failed to load activity data');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getContributionLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800',
      'bg-purple-200 dark:bg-purple-900/30',
      'bg-purple-400 dark:bg-purple-700/50',
      'bg-purple-600 dark:bg-purple-600/70',
      'bg-purple-800 dark:bg-purple-500',
    ];
    return colors[level];
  };

  // Generate all days for the past year
  const generateYearGrid = () => {
    const grid: { date: string; count: number }[] = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const dataMap = new Map(data.map((d) => [d.date, d.count]));

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      grid.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
    }

    return grid;
  };

  // Group by weeks
  const groupByWeeks = (days: { date: string; count: number }[]) => {
    const weeks: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    // Pad the beginning to start on Sunday
    const firstDay = new Date(days[0]?.date || new Date());
    const dayOfWeek = firstDay.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0 });
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad the last week
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({ date: '', count: 0 });
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Activity</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const yearGrid = generateYearGrid();
  const weeks = groupByWeeks(yearGrid);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Activity</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex gap-1 mb-2 ml-8">
          {months.map((month, idx) => (
            <div
              key={idx}
              className="text-xs text-gray-500"
              style={{ width: `${(weeks.length / 12) * 100}%` }}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 text-xs text-gray-500 pt-1">
            <div className="h-3">Sun</div>
            <div className="h-3">Mon</div>
            <div className="h-3">Tue</div>
            <div className="h-3">Wed</div>
            <div className="h-3">Thu</div>
            <div className="h-3">Fri</div>
            <div className="h-3">Sat</div>
          </div>

          {/* Grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-3 h-3 rounded-sm transition-all duration-200 ${
                      day.date
                        ? `${getLevelColor(getContributionLevel(day.count))} cursor-pointer hover:ring-2 hover:ring-purple-500 hover:ring-offset-1`
                        : 'bg-transparent'
                    }`}
                    onMouseEnter={() =>
                      day.date && setHoveredDay({ date: day.date, count: day.count })
                    }
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
            <div className="font-semibold">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'login' : 'logins'}
            </div>
            <div className="text-gray-300">{formatDate(hoveredDay.date)}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-foreground">{data.length}</span> days with activity in
          the last year
        </div>
      </div>
    </div>
  );
};
