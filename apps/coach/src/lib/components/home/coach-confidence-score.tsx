import { FC, useState, useEffect } from "react";

interface IProps {
  title: string;
  value: number; // 0-100
  description?: string;
  isLoading?: boolean;
}

export const CoachConfidenceScore: FC<IProps> = ({
 title,
 value,
 description,
 isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        </div>
        <div className="relative z-10 animate-pulse">
          <div className="h-4 bg-neutral-700 rounded w-32 mb-4"></div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-32 h-32 bg-neutral-700 rounded-full"></div>
          </div>
          <div className="h-3 bg-neutral-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const semicircleCircumference = Math.PI * 50; // Half circle circumference
  const targetOffset = semicircleCircumference - (value / 100) * semicircleCircumference;
  const [strokeOffset, setStrokeOffset] = useState(semicircleCircumference);
  useEffect(() => {
    // Animate progress bar on mount
    setStrokeOffset(targetOffset);
  }, [targetOffset]);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
        <div>
          <h3 className="text-stone-300 text-sm sm:text-base font-medium leading-tight sm:leading-relaxed">
            {title}
          </h3>
          {description && (
            <p className="text-stone-400 text-xs leading-tight mb-4">
              {description}
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-end mt-auto pt-2">
          <div className="relative w-32 h-24 sm:w-36 sm:h-18 mb-2">
            <svg
              className="w-full h-full"
              viewBox="0 0 120 60"
            >
              {/* Background semi-circle */}
              <path
                d="M 10 50 A 50 50 0 0 1 110 50"
                fill="transparent"
                stroke="rgb(64 64 64 / 0.3)"
                strokeWidth="12"
                // strokeLinecap="round"
              />

              {/* Progress semi-circle */}
              <path
                d="M 10 50 A 50 50 0 0 1 110 50"
                fill="transparent"
                stroke="url(#gradient)"
                strokeWidth="12"
                // strokeLinecap="round"
                strokeDasharray={semicircleCircumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-50 text-2xl sm:text-3xl font-semibold">
                {value}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
