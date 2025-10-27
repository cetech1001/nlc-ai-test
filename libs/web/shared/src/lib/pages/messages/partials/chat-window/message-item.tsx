'use client'

import React from 'react';
import {User} from 'lucide-react';
import {DirectMessageResponse} from '@nlc-ai/sdk-messages';

interface MessageItemProps {
  message: DirectMessageResponse;
  isCurrentUser: boolean;
  isGrouped: boolean;
  otherParticipantName?: string;
  isAdminMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
                                                          message,
                                                          isCurrentUser,
                                                          isGrouped,
                                                          otherParticipantName,
                                                          isAdminMessage,
                                                        }) => {
  const isOptimistic = message.id.startsWith('optimistic-');

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${isGrouped ? 'mt-1' : 'mt-4'}`}>
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          {/* Show header only for non-grouped messages */}
          {!isGrouped && (
            <div className={`text-xs text-stone-500 mb-1 flex items-center gap-2 ${
              isCurrentUser ? 'justify-end' : 'justify-start'
            }`}>
              <span className="font-medium">
                {isAdminMessage ? 'Admin Support' :
                  isCurrentUser ? 'You' : otherParticipantName}
              </span>
              <span>•</span>
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOptimistic && (
                <>
                  <span>•</span>
                  <span className="text-stone-400">Sending...</span>
                </>
              )}
              {message.isRead && isCurrentUser && !isOptimistic && (
                <>
                  <span>•</span>
                  <span className="text-blue-400">Read</span>
                </>
              )}
            </div>
          )}

          <div className={`p-3 text-sm leading-relaxed transition-opacity shadow-lg ${
            isOptimistic ? 'opacity-70' : 'opacity-100'
          } ${
            isCurrentUser
              ? `bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white ${
                isGrouped ? 'rounded-2xl' : 'rounded-2xl rounded-br-md'
              }`
              : isAdminMessage
                ? `bg-gradient-to-r from-purple-600 to-blue-600 text-white ${
                  isGrouped ? 'rounded-2xl' : 'rounded-2xl rounded-bl-md'
                }`
                : `bg-neutral-700/80 text-white backdrop-blur-sm ${
                  isGrouped ? 'rounded-2xl' : 'rounded-2xl rounded-bl-md'
                }`
          }`}>
            {isAdminMessage && !isGrouped && (
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <User className="w-3 h-3" />
                <span className="text-xs font-medium">Support Team</span>
              </div>
            )}
            <div className="whitespace-pre-line">{message.content}</div>
            {message.isEdited && (
              <div className="text-xs opacity-60 mt-1">(edited)</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
