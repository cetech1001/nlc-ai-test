'use client'

import React, {useCallback, useEffect, useState} from 'react';
import {useMessagingWebSocket} from '../hooks';
import {ConversationResponse, DirectMessageResponse} from '@nlc-ai/sdk-messages';
import {toast} from 'sonner';
import {UserProfile, UserType} from "@nlc-ai/types";
import {ConversationListSkeleton} from "./skeletons";
import {NLCClient} from "@nlc-ai/sdk-main";
import {getOtherParticipant} from "./helpers";
import {ConversationItem} from "./conversation-list/conversation-item";
import {ConversationListHeader} from "./conversation-list/conversation-list-header";
import {EmptyState} from "./conversation-list/empty-state";

interface ConversationListProps {
  sdkClient: NLCClient;
  user?: UserProfile | null;
  selectedConversationID?: string;
  onConversationSelectAction: (conversation: ConversationResponse) => void;
  onBackClick?: () => void;
}

interface ConversationWithMeta extends Omit<ConversationResponse, 'metadata'> {
  metadata: {
    displayName: string;
    displayAvatar: string;
    lastMessage: string;
    unreadCount: number;
    contactType: 'admin' | 'client' | 'community';
    otherParticipantID: string;
    otherParticipantType: UserType;
  }
}

interface PresenceData {
  isOnline: boolean;
  lastSeen: Date | null;
}

export const ConversationList: React.FC<ConversationListProps> = ({
                                                                    sdkClient,
                                                                    selectedConversationID,
                                                                    onConversationSelectAction,
                                                                    onBackClick,
                                                                    user,
                                                                  }) => {
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [participantPresence, setParticipantPresence] = useState<Map<string, PresenceData>>(new Map());

  // WebSocket event handlers
  const handleNewMessage = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === data.conversationID) {
          const updatedMessages = [...(conv.messages || []), data.message];
          const currentUserKey = `${user?.type}:${user?.id}`;
          const isMessageFromCurrentUser = data.message.senderID === user?.id && data.message.senderType === user?.type;
          const isConversationSelected = selectedConversationID === data.conversationID;

          let newUnreadCount = (conv.unreadCount as Record<string, number>)[currentUserKey] || 0;
          if (!isMessageFromCurrentUser && !isConversationSelected) {
            newUnreadCount += 1;
          }

          return {
            ...conv,
            messages: updatedMessages,
            lastMessageAt: data.message.createdAt,
            unreadCount: {
              ...conv.unreadCount,
              [currentUserKey]: newUnreadCount
            },
            metadata: {
              ...conv.metadata,
              lastMessage: data.message.content,
              unreadCount: newUnreadCount
            }
          };
        }
        return conv;
      }).sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
    });
  }, [user?.id, user?.type, selectedConversationID]);

  const handleMessagesRead = useCallback((data: { conversationID: string; messageIDs: string[]; readerID: string; readerType: string }) => {
    if (data.readerID === user?.id && data.readerType === user?.type) {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === data.conversationID) {
            const currentUserKey = `${user.type}:${user.id}`;
            return {
              ...conv,
              unreadCount: {
                ...conv.unreadCount,
                [currentUserKey]: 0
              },
              metadata: {
                ...conv.metadata,
                unreadCount: 0
              }
            };
          }
          return conv;
        });
      });
    }
  }, [user?.id, user?.type]);

  const handleError = useCallback((error: any) => {
    console.error('🚫 WebSocket error in conversation list:', error);
  }, []);

  const { isConnected } = useMessagingWebSocket({
    user,
    enabled: !!user,
    onNewMessage: handleNewMessage,
    onMessagesRead: handleMessagesRead,
    onError: handleError,
  });

  // Load conversations
  useEffect(() => {
    loadConversations();

    const pollInterval = setInterval(() => {
      loadConversations(true);
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [user]);

  // Reset unread count when a conversation is selected
  useEffect(() => {
    if (selectedConversationID) {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === selectedConversationID) {
            const currentUserKey = `${user?.type}:${user?.id}`;
            return {
              ...conv,
              unreadCount: {
                ...conv.unreadCount,
                [currentUserKey]: 0
              },
              metadata: {
                ...conv.metadata,
                unreadCount: 0
              }
            };
          }
          return conv;
        });
      });
    }
  }, [selectedConversationID, user?.id, user?.type]);

  // Check presence for all participants
  useEffect(() => {
    if (!conversations.length) return;

    const checkPresence = async () => {
      const participantsToCheck = new Map<string, UserType>();

      conversations.forEach(conv => {
        // @ts-expect-error idk
        const { userID, userType } = conv.metadata;
        if (userID && userID !== 'unassigned') {
          participantsToCheck.set(userID, userType);
        }
      });

      if (participantsToCheck.size > 0) {
        try {
          const users = Array.from(participantsToCheck.entries()).map(([userID, userType]) => ({
            userID,
            userType
          }));

          const result = await sdkClient.messages.presence.checkBatchOnlineStatus(users);

          const presenceMap = new Map();
          result.users.forEach(u => {
            const key = `${u.userType}:${u.userID}`;
            presenceMap.set(key, {
              isOnline: u.isOnline,
              lastSeen: null,
            });
          });

          setParticipantPresence(presenceMap);
        } catch (error) {
          console.error('Failed to check batch presence:', error);
        }
      }
    };

    checkPresence();
    const interval = setInterval(checkPresence, 30000);

    return () => clearInterval(interval);
  }, [conversations, sdkClient]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      const response = await sdkClient.messages.getConversations({
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

      const sortedConversations = conversationsWithMeta.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(sortedConversations);
    } catch (error: any) {
      if (!silent) {
        toast.error('Failed to load conversations');
        console.error('Failed to load conversations:', error);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const getConversationMetadata = async (conversation: ConversationResponse) => {
    if (conversation.type === 'direct' && user) {
      const { userID, userType } = getOtherParticipant(
        conversation.participantIDs,
        conversation.participantTypes,
        conversation.metadata,
        user,
      );

      try {
        const userInfo = await sdkClient.users.profiles.lookupUserProfile(userID, userType);

        return {
          displayName: `${userInfo.firstName} ${userInfo.lastName}`,
          displayAvatar: userInfo.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.firstName} ${userInfo.lastName}`,
          lastMessage: getLastMessage(conversation),
          unreadCount: getUserUnreadCount(conversation),
          contactType: getContactType(userType),
          otherParticipantID: userID,
          otherParticipantType: userType,
        };
      } catch (error) {
        return {
          displayName: userType === UserType.ADMIN ? 'Admin Support' : 'Unknown User',
          displayAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userType === UserType.ADMIN ? 'Admin Support' : 'Unknown User'}`,
          lastMessage: getLastMessage(conversation),
          unreadCount: getUserUnreadCount(conversation),
          contactType: getContactType(userType),
          otherParticipantID: userID,
          otherParticipantType: userType,
        };
      }
    }

    return {
      displayName: conversation.name || 'Group Chat',
      displayAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=Group`,
      lastMessage: getLastMessage(conversation),
      unreadCount: getUserUnreadCount(conversation),
      contactType: 'community' as const,
      otherParticipantID: '',
      otherParticipantType: UserType.COACH,
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

  const filteredConversations = conversations.filter(conv =>
    conv.metadata.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  return (
    <div className="w-80 border-r border-neutral-700 flex flex-col">
      <ConversationListHeader
        isConnected={isConnected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBackClick={onBackClick}
      />

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          filteredConversations.map(conversation => {
            const presenceKey = `${conversation.metadata.otherParticipantType}:${conversation.metadata.otherParticipantID}`;
            const presence = participantPresence.get(presenceKey);

            return (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationID === conversation.id}
                presence={presence}
                onClick={() => onConversationSelectAction(conversation as any)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
