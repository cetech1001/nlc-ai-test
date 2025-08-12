import { FC, useEffect, useState } from "react";
import { Skeleton } from "@nlc-ai/web-ui";
import { Info } from "lucide-react";

interface DayData {
  day: string;
  date: string;
  manualHours: number;
  savedHours: number;
}

interface IProps {
  isLoading?: boolean;
}

// Mock data for the week
const weekData: DayData[] = [
  { day: "Mon", date: "Feb 1", manualHours: 120, savedHours: 80 },
  { day: "Tue", date: "Feb 2", manualHours: 140, savedHours: 120 },
  { day: "Wed", date: "Feb 3", manualHours: 100, savedHours: 75 },
  { day: "Thu", date: "Feb 4", manualHours: 180, savedHours: 160 },
  { day: "Fri", date: "Feb 5", manualHours: 110, savedHours: 100 },
  { day: "Sat", date: "Feb 6", manualHours: 90, savedHours: 70 },
  { day: "Sun", date: "Feb 7", manualHours: 80, savedHours: 60 },
];

const TimeSavedWidgetSkeleton = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 h-full flex flex-col overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-4 rounded" />
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-2" />
        </div>

        <div className="flex-1 flex items-end justify-between gap-2 mb-4" style={{ height: '200px' }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton className="w-full bg-neutral-700 rounded" style={{ height: `${Math.random() * 100 + 50}px` }} />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TimeSavedWidget: FC<IProps> = ({ isLoading = false }) => {
  const [animatedData, setAnimatedData] = useState<DayData[]>(
    weekData.map(day => ({ ...day, manualHours: 0, savedHours: 0 }))
  );
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out animation
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const newAnimatedData = weekData.map(day => ({
          ...day,
          manualHours: Math.round(day.manualHours * easeOut),
          savedHours: Math.round(day.savedHours * easeOut),
        }));

        setAnimatedData(newAnimatedData);

        // Calculate total saved hours
        const total = newAnimatedData.reduce((acc, day) => acc + (day.manualHours - day.savedHours), 0);
        setTotalSaved(total);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isLoading]);

  if (isLoading) {
    return <TimeSavedWidgetSkeleton />;
  }

  const maxHours = Math.max(...weekData.map(day => day.manualHours));

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 h-full flex flex-col overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-1">
              Time Saved This Week
            </h3>
            <p className="text-stone-400 text-sm">Feb 1 - Feb 7, 2025</p>
          </div>
          <button className="text-stone-400 hover:text-stone-300 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-stone-50 text-4xl font-semibold mb-1">
            {totalSaved} Hrs
          </div>
          <p className="text-stone-400 text-sm">Total hours saved</p>
        </div>

        <div className="flex-1 flex items-end justify-between gap-2 mb-4" style={{ minHeight: '200px' }}>
          {animatedData.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex flex-col justify-end" style={{ height: '150px' }}>
                {/* Manual hours bar (background) */}
                <div
                  className="w-full bg-neutral-600/30 rounded-t transition-all duration-300 ease-out"
                  style={{
                    height: `${(day.manualHours / maxHours) * 150}px`,
                    transitionDelay: `${index * 100}ms`
                  }}
                />

                {/* Saved hours bar (foreground) */}
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-fuchsia-500 to-violet-500 rounded-t shadow-lg transition-all duration-300 ease-out"
                  style={{
                    height: `${(day.savedHours / maxHours) * 150}px`,
                    transitionDelay: `${index * 100 + 200}ms`
                  }}
                />
              </div>

              <span className="text-stone-300 text-xs font-medium">{day.day}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full"></div>
            <span className="text-stone-300">Saved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neutral-600/50 rounded-full"></div>
            <span className="text-stone-300">Would have taken</span>
          </div>
        </div>
      </div>
    </div>
  );
};
