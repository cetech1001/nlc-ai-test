import React from "react";

export const DailyStreak = () => {
  return (
    <div className="glass-card rounded-4xl w-full h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[400px] overflow-hidden">
      <div className="absolute -left-11 -bottom-13 w-56 h-56 bg-streak-gradient opacity-50 blur-[112.55px] rounded-full" />
      <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 lg:p-6">
        <div>
          <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">Daily Streak</h3>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-foreground leading-none">18</span>
              <span className="text-xs sm:text-sm text-muted-foreground pb-0.5 sm:pb-1">days</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Finish lessons to keep streak</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            {['', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => (
              <div key={index} className="w-6 sm:w-[30px] text-center text-xs sm:text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between items-center">
              <div className="w-6 sm:w-[30px] text-center text-xs sm:text-sm text-muted-foreground">W1</div>
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
            </div>

            <div className="flex justify-between items-center">
              <div className="w-6 sm:w-[30px] text-center text-xs sm:text-sm text-muted-foreground">W2</div>
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
            </div>

            <div className="flex justify-between items-center">
              <div className="w-6 sm:w-[30px] text-center text-xs sm:text-sm text-muted-foreground">W3</div>
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
            </div>

            <div className="flex justify-between items-center">
              <div className="w-6 sm:w-[30px] text-center text-xs sm:text-sm text-muted-foreground">W4</div>
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gradient-purple" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
              <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20" />
            </div>

            <div className="flex justify-between items-center">
              <div className="w-6 sm:w-[30px] text-center text-xs sm:text-sm text-muted-foreground">W5</div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded bg-gray-500/20 relative flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white/34" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11 7V4.5C11 3.70435 10.6839 2.94129 10.1213 2.37868C9.55871 1.81607 8.79565 1.5 8 1.5C7.20435 1.5 6.44129 1.81607 5.87868 2.37868C5.31607 2.94129 5 3.70435 5 4.5V7M4.5 14.5H11.5C11.8978 14.5 12.2794 14.342 12.5607 14.0607C12.842 13.7794 13 13.3978 13 13V8.5C13 8.10218 12.842 7.72064 12.5607 7.43934C12.2794 7.15804 11.8978 7 11.5 7H4.5C4.10218 7 3.72064 7.15804 3.43934 7.43934C3.15804 7.72064 3 8.10218 3 8.5V13C3 13.3978 3.15804 13.7794 3.43934 14.0607C3.72064 14.342 4.10218 14.5 4.5 14.5Z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
