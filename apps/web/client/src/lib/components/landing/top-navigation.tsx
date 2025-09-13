import React from "react";

export const TopNavigation = ({ community, onLoginClick }: any) => {
  return (
    <div className="border-b border-dark-500">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={community.logo}
                alt={community.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-white/10"
              />
              <span className="text-lg sm:text-xl font-semibold text-dark-900 truncate">{community.name}</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 9l5-4 5 4M7 16l5 4 5-4" />
              </svg>
            </div>
          </div>

          <button
            className="btn-secondary text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5"
            onClick={onLoginClick}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

