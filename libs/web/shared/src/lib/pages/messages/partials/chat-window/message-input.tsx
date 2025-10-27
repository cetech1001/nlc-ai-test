'use client'

import React from 'react';
import {Camera, Send, Smile} from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isConnected: boolean;
  isAdminConversation: boolean;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
                                                            value,
                                                            onChange,
                                                            onSend,
                                                            onKeyPress,
                                                            isConnected,
                                                            isAdminConversation,
                                                            disabled = false,
                                                          }) => {
  return (
    <div className="relative z-10 p-6 border-t border-neutral-700/50
      bg-gradient-to-r from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm">

      <div className="flex items-center gap-3">
        <button
          className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg
            hover:bg-neutral-700/50"
          aria-label="Attach image"
        >
          <Camera className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder={isAdminConversation ? 'Describe your issue or question...' : 'Type your message...'}
            disabled={disabled}
            className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3
              text-white placeholder:text-stone-400 text-sm focus:outline-none
              focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 resize-none max-h-32
              backdrop-blur-sm disabled:opacity-50"
            rows={1}
            aria-label="Message input"
          />
        </div>

        <button
          className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg
            hover:bg-neutral-700/50"
          aria-label="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl
            hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        {isAdminConversation && (
          <div className="text-xs text-stone-500 text-center flex-1">
            Direct line to admin support • Real-time messaging
          </div>
        )}
        <div className="flex items-center gap-2 text-xs ml-auto">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};
