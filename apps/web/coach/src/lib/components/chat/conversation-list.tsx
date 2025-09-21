'use client'

import React, { useState, useEffect } from 'react';
import { Search, Headphones, Users } from 'lucide-react';
import { sdkClient } from '@/lib';
import { ConversationResponse } from '@nlc-ai/sdk-messages';
import { toast } from 'sonner';
import {UserType} from "@nlc-ai/types";
import {ConversationListSkeleton} from "@/lib/components/chat/skeletons";
import {LoginResponse} from "@nlc-ai/web-auth";

interface ConversationListProps {
  user: LoginResponse['user'] | null;
  selectedConversationID?: string;
  onConversationSelectAction: (conversation: ConversationResponse) => void;
  onBackClick?: () => void;
}

interface ConversationWithMeta extends ConversationResponse {
  metadata: {
    displayName: string;
    displayAvatar: string;
    isOnline: boolean;
    lastMessage: string;
    unreadCount: number;
    contactType: 'admin' | 'client' | 'community';
  }
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationID,
  onConversationSelectAction,
  onBackClick,
  user,
}) => {
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await sdkClient.messaging.getConversations({
        page: 1,
        limit: 50,
      });

      const conversationsWithMeta: ConversationWithMeta[] = await Promise.all(
        response.data.map(async (conv) => {
          const meta = await getConversationMetadata(conv);
          return {
            ...conv,
            metadata: meta,
          };
        })
      );

      setConversations(conversationsWithMeta);
    } catch (error: any) {
      toast.error('Failed to load conversations');
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationMetadata = async (conversation: ConversationResponse) => {
    if (conversation.type === 'direct' && user) {
      const otherUserID = conversation.participantIDs[0] === user?.id ? conversation.participantIDs[1] : conversation.participantIDs[0];
      const otherUserType = conversation.participantIDs[0] === user?.id ? conversation.participantTypes[1] : conversation.participantTypes[0];

      try {
        const userInfo = await sdkClient.users.profile.lookupProfile(otherUserType, otherUserID);

        return {
          displayName: `${userInfo.firstName} ${userInfo.lastName}`,
          displayAvatar: userInfo.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.firstName} ${userInfo.lastName}`,
          isOnline: true,
          lastMessage: getLastMessage(conversation),
          unreadCount: getUserUnreadCount(conversation),
          contactType: getContactType(otherUserType),
        };
      } catch (error) {
        return {
          displayName: otherUserType === UserType.ADMIN ? 'Admin Support' : 'Unknown User',
          displayAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=Unknown`,
          isOnline: false,
          lastMessage: getLastMessage(conversation),
          unreadCount: getUserUnreadCount(conversation),
          contactType: getContactType(otherUserType),
        };
      }
    }

    return {
      displayName: conversation.name || 'Group Chat',
      displayAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=Group`,
      isOnline: true,
      lastMessage: getLastMessage(conversation),
      unreadCount: getUserUnreadCount(conversation),
      contactType: 'community' as const,
    };
  };

  const getLastMessage = (conversation: ConversationResponse) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return lastMessage.content;
    }
    return 'No messages yet';
  };

  const getUserUnreadCount = (conversation: ConversationResponse) => {
    if (!user?.id || !user?.type) return 0;

    const currentUserKey = `${user.type}:${user.id}`;
    const count = (conversation.unreadCount as Record<string, number>)[currentUserKey] || 0;
    return Math.max(0, count);
  };

  const getContactType = (userType: string) => {
    switch (userType) {
      case UserType.ADMIN: return 'admin' as const;
      case UserType.CLIENT: return 'client' as const;
      default: return 'community' as const;
    }
  };

  const getContactTypeIcon = (type: 'admin' | 'client' | 'community') => {
    switch (type) {
      case 'admin':
        return (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full border-2 border-black flex items-center justify-center">
            <Headphones className="w-2 h-2 text-white" />
          </div>
        );
      case 'client':
        return (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black"></div>
        );
      case 'community':
        return (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
        );
    }
  };

  const getContactTypeLabel = (type: 'admin' | 'client' | 'community') => {
    switch (type) {
      case 'admin': return 'Support';
      case 'client': return 'Client';
      case 'community': return 'Community';
      default: return '';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.metadata.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  return (
    <div className="w-80 border-r border-neutral-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-3 mb-4">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
            >
              ←
            </button>
          )}
          <h1 className="text-white text-xl font-semibold">Messages</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">No conversations found</p>
            {searchQuery && (
              <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => onConversationSelectAction(conversation)}
              className={`flex items-center gap-3 p-4 border-b border-neutral-700/50 hover:bg-neutral-800/30 transition-colors cursor-pointer ${
                selectedConversationID === conversation.id ? 'bg-neutral-800/50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={conversation.metadata.displayAvatar}
                  alt={conversation.metadata.displayName}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-600"
                />
                {conversation.metadata.isOnline && getContactTypeIcon(conversation.metadata.contactType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-sm font-medium truncate">{conversation.metadata.displayName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-xs">{formatTimestamp(conversation.lastMessageAt)}</span>
                    {conversation.metadata.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-fuchsia-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conversation.metadata.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-stone-400 text-sm truncate mt-1">{conversation.metadata.lastMessage}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    conversation.metadata.contactType === 'admin' ? 'bg-fuchsia-400' :
                      conversation.metadata.contactType === 'client' ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                  <span className="text-xs text-stone-500">{getContactTypeLabel(conversation.metadata.contactType)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
