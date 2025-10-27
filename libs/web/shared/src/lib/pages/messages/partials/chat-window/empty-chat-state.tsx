'use client'

import React from 'react';

export const EmptyChatState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -left-48 top-1/4 bg-gradient-to-r from-fuchsia-500/20
          via-purple-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-96 h-96 -right-48 bottom-1/4 bg-gradient-to-l from-violet-500/20
          via-purple-500/20 to-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDelay: '1s' }} />
      </div>

      <div className="text-center relative z-10">
        <div className="w-20 h-20 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full
          flex items-center justify-center mx-auto mb-6 shadow-lg shadow-fuchsia-500/50">
          <span className="text-white text-3xl">💬</span>
        </div>
        <h3 className="text-white text-xl font-semibold mb-3">Select a conversation</h3>
        <p className="text-stone-400 max-w-md">
          Choose from admin support, clients, or community members to start messaging
        </p>
      </div>
    </div>
  );
};
