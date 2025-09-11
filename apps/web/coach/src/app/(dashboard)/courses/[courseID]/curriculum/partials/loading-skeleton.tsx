import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>
      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
          <div className="w-32 h-8 bg-neutral-700 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    </div>
  );
};
