'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number; isFuture: boolean } | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0); // 0 = current month, 1 = one month back, etc.

  useEffect(() => {
    if (userID) {
      fetchHeatmapData();
    }
  }, [userID, currentOffset]);

  const getDateRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() - currentOffset;

    // Create dates for the target month
    const targetDate = new Date(year, month, 1);
    const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    return { startDate, endDate, today };
  };

  const fetchHeatmapData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const result = await sdkClient.auth.activity.getUserHeatmap(
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

  const getLevelColor = (level: number, isFuture: boolean): string => {
    if (isFuture) {
      return 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200/30 dark:border-gray-800/30';
    }

    const colors = [
      'bg-gray-100 dark:bg-gray-800/50',
      'bg-purple-200 dark:bg-purple-900/30',
      'bg-purple-400 dark:bg-purple-700/50',
      'bg-purple-600 dark:bg-purple-600/70',
      'bg-purple-800 dark:bg-purple-500',
    ];
    return colors[level];
  };

  const generateMonthGrid = useMemo(() => {
    const { startDate, endDate, today } = getDateRange();
    const grid: { date: string; count: number; isFuture: boolean }[] = [];

    const dataMap = new Map(data.map((d) => [d.date, d.count]));

    // Normalize today to midnight for fair comparison
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Generate all days in the month
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const currentMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      const isFuture = currentMidnight > todayMidnight;

      grid.push({
        date: dateStr,
        count: isFuture ? 0 : (dataMap.get(dateStr) || 0),
        isFuture,
      });

      current.setDate(current.getDate() + 1);
    }

    return grid;
  }, [data, currentOffset]);

  const groupByWeeks = (days: { date: string; count: number; isFuture: boolean }[]) => {
    const weeks: { date: string; count: number; isFuture: boolean }[][] = [];
    let currentWeek: { date: string; count: number; isFuture: boolean }[] = [];

    if (days.length === 0) return weeks;

    const firstDay = new Date(days[0].date);
    const dayOfWeek = firstDay.getDay();

    // Pad the beginning to start on Sunday
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0, isFuture: false });
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
      currentWeek.push({ date: '', count: 0, isFuture: false });
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

  const getPeriodLabel = () => {
    const { startDate } = getDateRange();
    return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevious = () => {
    setCurrentOffset(prev => prev + 1);
  };

  const handleNext = () => {
    setCurrentOffset(prev => Math.max(0, prev - 1));
  };

  if (isLoading) {
    return (
      <div className={`glass-card rounded-[30px] p-6 md:p-8 relative overflow-hidden ${className}`}>
        <div className="absolute -left-7 -bottom-32 w-[267px] h-[267px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 opacity-40 blur-[112.55px] rounded-full" />
        <div className="absolute -right-7 -top-20 w-[200px] h-[200px] bg-gradient-to-r from-purple-400 via-purple-600 to-fuchsia-500 opacity-30 blur-[100px] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Activity</h3>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const weeks = groupByWeeks(generateMonthGrid);
  const totalLogins = data.reduce((sum, d) => sum + d.count, 0);
  const daysWithActivity = data.filter(d => d.count > 0).length;

  return (
    <div className={`glass-card rounded-[30px] p-6 md:p-8 relative overflow-hidden ${className}`}>
      {/* Background glow orbs */}
      <div className="absolute -left-7 -bottom-32 w-[267px] h-[267px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute -right-7 -top-20 w-[200px] h-[200px] bg-gradient-to-r from-purple-400 via-purple-600 to-fuchsia-500 opacity-30 blur-[100px] rounded-full" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Activity</h3>
            <p className="text-sm text-foreground/60">{getPeriodLabel()}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-foreground/60">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(level, false)}`}
                />
              ))}
              <span>More</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors text-foreground/60 hover:text-foreground"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentOffset === 0}
                className="p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Heatmap grid */}
          <div className="flex gap-1.5 sm:gap-2 md:gap-3">
            {/* Day labels */}
            <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 text-[10px] sm:text-xs text-foreground/50 pt-1">
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Sun</div>
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Mon</div>
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Tue</div>
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Wed</div>
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Thu</div>
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Fri</div>
              <div className="h-5 sm:h-6 md:h-8 lg:h-10 flex items-center">Sat</div>
            </div>

            {/* Grid */}
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 flex-1 justify-between">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 flex-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={`w-full h-5 sm:h-6 md:h-8 lg:h-10 rounded transition-all duration-200 ${
                        day.date
                          ? `${getLevelColor(getContributionLevel(day.count), day.isFuture)} ${!day.isFuture ? 'cursor-pointer hover:ring-2 hover:ring-purple-500 hover:ring-offset-1 hover:scale-105' : 'cursor-default'}`
                          : 'bg-transparent'
                      }`}
                      onMouseEnter={(e) => {
                        if (day.date) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            date: day.date,
                            count: day.count,
                            isFuture: day.isFuture,
                            x: rect.left + rect.width / 2,
                            y: rect.top
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <div
              className="fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
              style={{
                left: `${hoveredDay.x}px`,
                top: `${hoveredDay.y - 60}px`,
                transform: 'translateX(-50%)'
              }}
            >
              {hoveredDay.isFuture ? (
                <div className="font-semibold text-gray-400">Future date</div>
              ) : (
                <>
                  <div className="font-semibold">
                    {hoveredDay.count} {hoveredDay.count === 1 ? 'login' : 'logins'}
                  </div>
                  <div className="text-gray-300">{formatDate(hoveredDay.date)}</div>
                </>
              )}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-gray-200/10 dark:border-gray-700/20">
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
            <div>
              <span className="font-medium text-foreground">{daysWithActivity}</span>
              <span className="text-foreground/60 ml-1">
                {daysWithActivity === 1 ? 'day' : 'days'} active
              </span>
            </div>
            <div>
              <span className="font-medium text-foreground">{totalLogins}</span>
              <span className="text-foreground/60 ml-1">
                total {totalLogins === 1 ? 'login' : 'logins'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile legend */}
        <div className="sm:hidden mt-4 flex items-center justify-center gap-2 text-xs text-foreground/60">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level, false)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
