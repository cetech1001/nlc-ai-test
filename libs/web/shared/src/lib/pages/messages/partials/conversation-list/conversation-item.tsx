'use client'

import React from 'react';
import {Headphones} from 'lucide-react';
import {UserType} from "@nlc-ai/types";

interface ConversationItemProps {
  conversation: {
    id: string;
    lastMessageAt?: Date;
    metadata: {
      displayName: string;
      displayAvatar: string;
      lastMessage: string;
      unreadCount: number;
      contactType: 'admin' | 'client' | 'community';
      otherParticipantID: string;
      otherParticipantType: UserType;
    };
  };
  isSelected: boolean;
  presence?: {
    isOnline: boolean;
    lastSeen: Date | null;
  };
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
                                                                    conversation,
                                                                    isSelected,
                                                                    presence,
                                                                    onClick,
                                                                  }) => {
  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getContactTypeIcon = (type: 'admin' | 'client' | 'community') => {
    if (type === 'admin') {
      return (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-fuchsia-600 to-violet-600
          rounded-full border-2 border-neutral-900 flex items-center justify-center">
          <Headphones className="w-2 h-2 text-white" />
        </div>
      );
    }
    return null;
  };

  const getContactTypeLabel = (type: 'admin' | 'client' | 'community') => {
    switch (type) {
      case 'admin': return 'Support';
      case 'client': return 'Client';
      case 'community': return 'Community';
      default: return '';
    }
  };

  const getContactTypeDot = (type: 'admin' | 'client' | 'community') => {
    const colors = {
      admin: 'bg-fuchsia-400',
      client: 'bg-blue-400',
      community: 'bg-green-400'
    };
    return colors[type];
  };

  const presenceColor = presence?.isOnline ? 'bg-yellow-500' : 'bg-gray-500';
  const presenceLabel = presence?.isOnline ? 'Away' : 'Offline';

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${conversation.metadata.displayName}, ${
        conversation.metadata.unreadCount > 0
          ? `${conversation.metadata.unreadCount} unread messages`
          : 'no unread messages'
      }`}
      className={`relative flex items-center gap-3 p-4 border-b border-neutral-700/50
        hover:bg-gradient-to-r hover:from-neutral-800/40 hover:to-neutral-800/20
        transition-all duration-200 cursor-pointer group
        ${isSelected
        ? 'bg-gradient-to-r from-fuchsia-900/20 to-violet-900/20 border-l-2 border-l-fuchsia-500'
        : ''
      }`}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-fuchsia-500/5 to-transparent" />
      </div>

      {/* Avatar with presence */}
      <div className="relative flex-shrink-0 z-10">
        {conversation.metadata.displayAvatar ? (
          <img
            src={conversation.metadata.displayAvatar}
            alt={conversation.metadata.displayName}
            className="w-12 h-12 rounded-full object-cover border border-neutral-600
              group-hover:border-fuchsia-500/50 transition-colors"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center border border-neutral-600 group-hover:border-fuchsia-500/50 transition-colors">
            <span className="text-white font-semibold text-sm">
              {conversation.metadata.displayName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}

        {/* Presence indicator */}
        <div className="absolute -bottom-1 -right-1">
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 border-neutral-900 ${presenceColor}`}
            title={presenceLabel}
          />
        </div>

        {/* Contact type badge */}
        {getContactTypeIcon(conversation.metadata.contactType)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white text-sm font-medium truncate
            group-hover:text-fuchsia-400 transition-colors">
            {conversation.metadata.displayName}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-stone-500 text-xs">
              {formatTimestamp(conversation.lastMessageAt)}
            </span>
            {conversation.metadata.unreadCount > 0 && (
              <div className="min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-fuchsia-600 to-violet-600
                rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/50">
                <span className="text-white text-xs font-bold">
                  {conversation.metadata.unreadCount > 99 ? '99+' : conversation.metadata.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-stone-400 text-sm truncate mb-1">
          {conversation.metadata.lastMessage}
        </p>

        {/* Status row */}
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${getContactTypeDot(conversation.metadata.contactType)}`} />
          <span className="text-xs text-stone-500">
            {getContactTypeLabel(conversation.metadata.contactType)}
          </span>
          <span className="text-stone-600">•</span>
          <span className={`text-xs font-medium ${
            presence?.isOnline ? 'text-yellow-400' : 'text-stone-500'
          }`}>
            {presenceLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
