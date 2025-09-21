'use client'

import React, { useState, useEffect } from 'react';
import { Search, Users, UserCircle, Plus } from 'lucide-react';
import { sdkClient } from '@/lib/sdk-client';
import { ConversationResponse } from '@nlc-ai/sdk-messages';
import { toast } from 'sonner';
import { UserType } from "@nlc-ai/types";
import { useAuth } from "@nlc-ai/web-auth";

interface ConversationListProps {
  selectedConversationID?: string;
  onConversationSelectAction: (conversation: ConversationResponse) => void;
  onNewConversation?: () => void;
}

interface ConversationWithMeta extends ConversationResponse {
  metadata: {
    displayName: string;
    displayAvatar: string;
    isOnline: boolean;
    lastMessage: string;
    unreadCount: number;
    contactType: 'coach' | 'client';
    userType: UserType;
  }
}

export const ConversationList: React.FC<ConversationListProps> = ({
                                                                    selectedConversationID,
                                                                    onConversationSelectAction,
                                                                    onNewConversation,
                                                                  }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'coach' | 'client'>('all');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await sdkClient.messaging.getConversations({
        page: 1,
        limit: 50,
      });

      // Transform conversations to include metadata
      const conversationsWithMeta: ConversationWithMeta[] = await Promise.all(
        response.data.map(async (conv) => {
          const meta = await getConversationMetadata(conv);
          return {
            ...conv,
            metadata: {
              ...meta
            },
          };
        })
      );

      // Sort by last message time
      conversationsWithMeta.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(conversationsWithMeta);
    } catch (error: any) {
      toast.error('Failed to load conversations');
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationMetadata = async (conversation: ConversationResponse) => {
    if (conversation.type === 'direct') {
      let otherUserID = '';
      let otherUserType: UserType = UserType.COACH;

      for (let i = 0; i < conversation.participantIDs.length; i++) {
        if (conversation.participantIDs[i] !== user?.id || conversation.participantTypes[i] !== 'admin') {
          otherUserID = conversation.participantIDs[i];
          otherUserType = conversation.participantTypes[i] as UserType;
          break;
        }
      }

      const userInfo = await sdkClient.users.profile.lookupProfile(otherUserType, otherUserID);

      return {
        displayName: userInfo.firstName + ' ' + userInfo.lastName,
        displayAvatar: userInfo.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.firstName}${userInfo.lastName}`,
        isOnline: true,
        lastMessage: getLastMessage(conversation),
        unreadCount: getUserUnreadCount(conversation),
        contactType: getContactType(otherUserType),
        userType: otherUserType,
      };
    }

    return {
      displayName: conversation.name || 'Group Chat',
      displayAvatar: '/api/placeholder/40/40',
      isOnline: true,
      lastMessage: getLastMessage(conversation),
      unreadCount: getUserUnreadCount(conversation),
      contactType: 'coach' as const,
      userType: UserType.COACH,
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
    const currentUserKey = `admin:${user?.id}`;
    return conversation.unreadCount[currentUserKey] || 0;
  };

  const getContactType = (userType: UserType) => {
    switch (userType) {
      case UserType.COACH: return 'coach' as const;
      case UserType.CLIENT: return 'client' as const;
      default: return 'coach' as const;
    }
  };

  const getContactTypeIcon = (type: 'coach' | 'client') => {
    switch (type) {
      case 'coach':
        return (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full border-2 border-black flex items-center justify-center">
            <UserCircle className="w-2 h-2 text-white" />
          </div>
        );
      case 'client':
        return (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
        );
    }
  };

  const getContactTypeLabel = (type: 'coach' | 'client') => {
    switch (type) {
      case 'coach': return 'Coach';
      case 'client': return 'Client';
      default: return '';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.metadata.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || conv.metadata.contactType === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Now';
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 border-r border-neutral-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-neutral-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-semibold">Messages</h1>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="p-2 text-purple-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-neutral-800/50 rounded-lg p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('coach')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'coach'
                ? 'bg-purple-600 text-white'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Coaches
          </button>
          <button
            onClick={() => setFilterType('client')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'client'
                ? 'bg-purple-600 text-white'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Clients
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {searchQuery && (
              <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
            )}
            {!searchQuery && onNewConversation && (
              <button
                onClick={onNewConversation}
                className="mt-3 text-purple-400 hover:text-white text-sm"
              >
                Start a new conversation
              </button>
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
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conversation.metadata.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-stone-400 text-sm truncate mt-1">{conversation.metadata.lastMessage}</p>
                <div className="flex items-center gap-1 mt-1">
                  {conversation.metadata.contactType === 'coach' ? (
                    <UserCircle className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Users className="w-3 h-3 text-green-400" />
                  )}
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
