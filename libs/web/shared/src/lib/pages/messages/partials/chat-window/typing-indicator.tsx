'use client'

import React from 'react';
import {User} from 'lucide-react';

interface TypingIndicatorProps {
  isAdminConversation: boolean;
  otherParticipantName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
                                                                  isAdminConversation,
                                                                  otherParticipantName,
                                                                }) => {
  return (
    <div className="mt-4">
      <div className="flex justify-start">
        <div className={`p-3 rounded-2xl rounded-bl-md shadow-lg ${
          isAdminConversation
            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
            : 'bg-neutral-700/80 backdrop-blur-sm'
        } text-white`}>
          {isAdminConversation && (
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <User className="w-3 h-3" />
              <span className="text-xs font-medium">Support Team</span>
            </div>
          )}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
      <div className="text-xs text-stone-500 mt-1">
        {isAdminConversation ? 'Admin support is typing...' : `${otherParticipantName} is typing...`}
      </div>
    </div>
  );
};
