import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onBack }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>
      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-2xl font-bold">Error</h1>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={onBack}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
