'use client'

import React from 'react';
import {Info} from 'lucide-react';
import {UserType} from "@nlc-ai/types";

interface ChatHeaderProps {
  otherParticipant: {
    id: string;
    name: string;
    type: UserType;
    avatar: string;
  } | null;
  presenceStatus: {
    status: 'online' | 'away' | 'offline';
    color: string;
    label: string;
  };
  isConnected: boolean;
  onBack?: () => void;
  onProfileClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
                                                        otherParticipant,
                                                        presenceStatus,
                                                        isConnected,
                                                        onBack,
                                                        onProfileClick,
                                                      }) => {
  return (
    <div className="relative z-10 flex items-center justify-between p-6 border-b border-neutral-700/50
      bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm">

      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg
              hover:bg-neutral-800/50 lg:hidden"
            aria-label="Go back"
          >
            ←
          </button>
        )}

        {otherParticipant && (
          <>
            <div className="relative">
              <img
                src={otherParticipant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.name}`}
                alt={otherParticipant.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-neutral-600 shadow-lg"
              />

              {/* Presence indicator */}
              <div className="absolute -bottom-1 -right-1">
                <div className={`w-4 h-4 rounded-full border-2 border-neutral-900
                  ${presenceStatus.color}
                  ${presenceStatus.status === 'online' ? 'animate-pulse' : ''}`}
                     title={presenceStatus.label}
                />
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg">
                {otherParticipant.name}
              </h3>

              <div className="flex items-center gap-2">
                {/* Presence status */}
                <span className={`text-xs font-medium ${
                  presenceStatus.status === 'online' ? 'text-green-400' :
                    presenceStatus.status === 'away' ? 'text-yellow-400' :
                      'text-stone-500'
                }`}>
                  {presenceStatus.label}
                </span>

                <span className="text-stone-500">•</span>

                <span className="text-xs text-stone-400 capitalize">
                  {otherParticipant.type}
                </span>

                {/* WebSocket connection status */}
                {!isConnected && (
                  <>
                    <span className="text-stone-500">•</span>
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Reconnecting...
                    </span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onProfileClick}
          className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg
            hover:bg-neutral-700/50"
          title="View profile"
          aria-label="View profile"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
