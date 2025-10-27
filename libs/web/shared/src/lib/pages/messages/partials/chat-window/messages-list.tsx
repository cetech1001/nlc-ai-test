'use client'

import React from 'react';
import {Headphones, Users} from 'lucide-react';
import {DirectMessageResponse} from '@nlc-ai/sdk-messages';
import {UserType} from "@nlc-ai/types";
import {MessageItem} from './message-item';
import {TypingIndicator} from './typing-indicator';

interface MessagesListProps {
  messages: DirectMessageResponse[];
  currentUserID?: string;
  currentUserType?: UserType;
  otherParticipant: {
    id: string;
    name: string;
    type: UserType;
    avatar: string;
  } | null;
  isTyping: boolean;
  isAdminConversation: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessagesList: React.FC<MessagesListProps> = ({
                                                            messages,
                                                            currentUserID,
                                                            currentUserType,
                                                            otherParticipant,
                                                            isTyping,
                                                            isAdminConversation,
                                                            messagesEndRef,
                                                          }) => {
  const isCurrentUserMessage = (message: DirectMessageResponse) => {
    return message.senderID === currentUserID && message.senderType === currentUserType;
  };

  const shouldGroupWithPrevious = (message: DirectMessageResponse, previousMessage: DirectMessageResponse | null) => {
    if (!previousMessage) return false;

    const isSameSender = message.senderID === previousMessage.senderID && message.senderType === previousMessage.senderType;
    const timeDiff = new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
    const isWithinTimeLimit = timeDiff < 2 * 60 * 1000;

    return isSameSender && isWithinTimeLimit;
  };

  if (messages.length === 0) {
    return (
      <div className="relative z-10 flex-1 p-6 flex items-center justify-center">
        <div className="text-center py-12">
          {isAdminConversation ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full
                flex items-center justify-center mx-auto mb-6 shadow-lg shadow-fuchsia-500/50">
                <Headphones className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-white font-semibold text-lg mb-3">Admin Support</h4>
              <p className="text-stone-400 text-sm max-w-md mx-auto">
                Get help with your account, features, or technical issues. Our support team is here to assist you.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full
                flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/50">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-white font-semibold text-lg mb-3">Start Conversation</h4>
              <p className="text-stone-400 text-sm max-w-md mx-auto">
                Send a message to {otherParticipant?.name} to begin your conversation
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 p-6 space-y-1 overflow-y-auto">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const isGrouped = shouldGroupWithPrevious(message, previousMessage);
        const isCurrentUser = isCurrentUserMessage(message);

        return (
          <MessageItem
            key={message.id}
            message={message}
            isCurrentUser={isCurrentUser}
            isGrouped={isGrouped}
            otherParticipantName={otherParticipant?.name}
            isAdminMessage={message.senderType === UserType.ADMIN}
          />
        );
      })}

      {isTyping && (
        <TypingIndicator
          isAdminConversation={isAdminConversation}
          otherParticipantName={otherParticipant?.name}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
