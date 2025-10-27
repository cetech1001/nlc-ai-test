'use client'

import React from 'react';
import {Search} from 'lucide-react';

interface ConversationListHeaderProps {
  isConnected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBackClick?: () => void;
}

export const ConversationListHeader: React.FC<ConversationListHeaderProps> = ({
                                                                                isConnected,
                                                                                searchQuery,
                                                                                onSearchChange,
                                                                                onBackClick,
                                                                              }) => {
  return (
    <div className="p-6 border-b border-neutral-700">
      <div className="flex items-center gap-3 mb-4">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <h1 className="text-white text-xl font-semibold">Messages</h1>
        {isConnected && (
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5
            text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500
            transition-colors"
          aria-label="Search conversations"
        />
      </div>
    </div>
  );
};
