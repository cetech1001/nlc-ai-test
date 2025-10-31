'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useMessagingWebSocket} from "../hooks";
import {ConversationResponse, DirectMessageResponse, MessageType} from '@nlc-ai/sdk-messages';
import {toast} from 'sonner';
import {UserProfile, UserType} from "@nlc-ai/types";
import {useRouter} from "next/navigation";
import {NLCClient} from "@nlc-ai/sdk-main";
import {getOtherParticipant} from "./helpers";
import {ChatWindowSkeleton} from './skeletons';
import {ChatHeader} from './chat-window/chat-header';
import {MessagesList} from './chat-window/messages-list';
import {MessageInput} from './chat-window/message-input';
import {EmptyChatState} from './chat-window/empty-chat-state';
import type { UploadedImage, UploadedVideo } from '../../../components';

interface ChatWindowProps {
  sdkClient: NLCClient;
  user?: UserProfile | null;
  conversation: ConversationResponse | null;
  isConvoLoading: boolean;
  onBack?: () => void;
}

interface Participant {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
}

interface PresenceData {
  isOnline: boolean;
  lastSeen: Date | null;
  status: 'online' | 'away' | 'offline';
}

interface AttachedFiles {
  images: UploadedImage[];
  videos: UploadedVideo[];
  documents: any[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                        sdkClient,
                                                        user,
                                                        conversation,
                                                        onBack,
                                                        isConvoLoading,
                                                      }) => {
  const router = useRouter();

  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(isConvoLoading);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [otherParticipantPresence, setOtherParticipantPresence] = useState<PresenceData | null>(null);
  const [isActivelyViewing, setIsActivelyViewing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFiles>({ images: [], videos: [], documents: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    if (data.conversationID === conversation?.id) {
      setMessages(prev => {
        const exists = prev.some(msg =>
          msg.id === data.message.id ||
          (msg.id.startsWith('optimistic-') && msg.content === data.message.content && msg.senderID === data.message.senderID)
        );

        if (exists) {
          return prev.map(msg =>
            (msg.id.startsWith('optimistic-') && msg.content === data.message.content && msg.senderID === data.message.senderID)
              ? data.message
              : msg
          );
        }

        return [...prev, data.message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      if (data.message.senderID !== user?.id || data.message.senderType !== user?.type) {
        setTimeout(() => {
          markMessageAsRead([data.message.id]);
        }, 1000);
      }
    }
  }, [conversation?.id, user?.id, user?.type]);

  const handleMessageUpdated = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    if (data.conversationID === conversation?.id) {
      setMessages(prev =>
        prev.map(msg => msg.id === data.message.id ? data.message : msg)
      );
    }
  }, [conversation?.id]);

  const handleMessageDeleted = useCallback((data: { conversationID: string; messageID: string }) => {
    if (data.conversationID === conversation?.id) {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageID));
    }
  }, [conversation?.id]);

  const handleMessagesRead = useCallback((data: { conversationID: string; messageIDs: string[]; readerID: string; readerType: string }) => {
    if (data.conversationID === conversation?.id) {
      setMessages(prev =>
        prev.map(msg => {
          if (data.messageIDs.includes(msg.id)) {
            return { ...msg, isRead: true, readAt: new Date().toISOString() as any };
          }
          return msg;
        })
      );
    }
  }, [conversation?.id]);

  const handleError = useCallback((error: any) => {
    console.error('🚫 WebSocket error:', error);
    toast.error('Connection error - messages may not update in real-time');
  }, []);

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    getTypingUsers,
  } = useMessagingWebSocket({
    user,
    enabled: !!conversation,
    onNewMessage: handleNewMessage,
    onMessageUpdated: handleMessageUpdated,
    onMessageDeleted: handleMessageDeleted,
    onMessagesRead: handleMessagesRead,
    onError: handleError,
  });

  const typingUsers = conversation ? getTypingUsers(conversation.id) : [];
  const isTyping = typingUsers.length > 0;

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation?.id]);

  // Join/leave conversation
  useEffect(() => {
    if (conversation && isConnected) {
      joinConversation(conversation.id);
      return () => {
        leaveConversation(conversation.id);
      };
    }
    return () => { /* empty */ };
  }, [conversation?.id, isConnected, joinConversation, leaveConversation]);

  // Get participant info
  useEffect(() => {
    if (user?.id && conversation) {
      fetchParticipantProfile();
    }
  }, [user?.id, conversation?.id]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Reset unread count when conversation opens
  useEffect(() => {
    if (conversation?.id && user?.id) {
      const resetUnreadCount = async () => {
        try {
          const unreadMessages = messages.filter(msg =>
            !msg.isRead &&
            msg.senderID !== user.id &&
            msg.senderType !== user.type
          );

          if (unreadMessages.length > 0) {
            await markMessageAsRead(unreadMessages.map(msg => msg.id));
          }
        } catch (error) {
          console.error('Failed to reset unread count:', error);
        }
      };

      resetUnreadCount();
    }
  }, [conversation?.id, user?.id]);

  // Check presence for other participant
  useEffect(() => {
    if (!otherParticipant?.id || !conversation?.id) return;

    const checkPresence = async () => {
      try {
        const status = await sdkClient.messages.presence.checkOnlineStatus(
          otherParticipant.id,
          otherParticipant.type
        );

        setOtherParticipantPresence({
          isOnline: status.isOnline,
          lastSeen: status.lastSeen ? new Date(status.lastSeen) : null,
          status: status.isOnline ? 'away' : 'offline'
        });
      } catch (error) {
        console.error('Failed to check presence:', error);
      }
    };

    checkPresence();
    const interval = setInterval(checkPresence, 15000);

    return () => clearInterval(interval);
  }, [otherParticipant?.id, otherParticipant?.type, conversation?.id, sdkClient]);

  // Detect active viewing from typing
  useEffect(() => {
    if (!conversation?.id) return;

    const otherUserTyping = typingUsers.some(
      u => u.userID === otherParticipant?.id && u.userType === otherParticipant?.type
    );

    if (otherUserTyping) {
      setIsActivelyViewing(true);

      const timeout = setTimeout(() => {
        setIsActivelyViewing(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
    return () => undefined;
  }, [typingUsers, conversation?.id, otherParticipant?.id, otherParticipant?.type]);

  // Detect active viewing from recent messages
  useEffect(() => {
    if (!messages.length) return;

    const latestMessage = messages[messages.length - 1];

    if (
      latestMessage.senderID === otherParticipant?.id &&
      latestMessage.senderType === otherParticipant?.type
    ) {
      const messageAge = Date.now() - new Date(latestMessage.createdAt).getTime();

      if (messageAge < 30000) {
        setIsActivelyViewing(true);

        const timeout = setTimeout(() => {
          setIsActivelyViewing(false);
        }, 30000);

        return () => clearTimeout(timeout);
      }
    }
    return () => undefined;
  }, [messages, otherParticipant?.id, otherParticipant?.type]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      const response = await sdkClient.messages.getMessages(conversation.id, {
        page: 1,
        limit: 50,
      });

      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
    } catch (error: any) {
      console.error('❌ Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (value: string) => {
    setInputMessage(value);

    if (!conversation || !isConnected) return;

    if (value.trim() && !typingTimeout) {
      sendTypingStatus(conversation.id, true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      sendTypingStatus(conversation.id, false);
      setTypingTimeout(null);
    }, 1000);

    setTypingTimeout(newTimeout);
  };

  const handleFileAttached = (files: AttachedFiles) => {
    setAttachedFiles(files);
  };

  const handleSendMessage = async () => {
    const hasText = inputMessage.trim();
    const hasFiles = attachedFiles.images.length > 0 || attachedFiles.videos.length > 0 || attachedFiles.documents.length > 0;

    if (!hasText && !hasFiles) return;
    if (!conversation || !user?.id) return;

    const messageContent = inputMessage.trim() || '📎 Attachment';
    const tempID = `optimistic-${Date.now()}-${Math.random()}`;

    // Collect all media URLs
    const mediaUrls: string[] = [
      ...attachedFiles.images.map(img => img.url),
      ...attachedFiles.videos.map(vid => vid.url),
      ...attachedFiles.documents.map(doc => doc.url),
    ];

    const optimisticMessage: DirectMessageResponse = {
      id: tempID,
      conversationID: conversation.id,
      senderID: user.id,
      senderType: user.type as any,
      type: MessageType.TEXT,
      content: messageContent,
      mediaUrls: mediaUrls,
      isRead: false,
      isEdited: false,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputMessage('');
    setAttachedFiles({ images: [], videos: [], documents: [] });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    if (isConnected) {
      sendTypingStatus(conversation.id, false);
    }

    try {
      const sentMessage = await sdkClient.messages.sendMessage(conversation.id, {
        type: MessageType.TEXT,
        content: messageContent,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });

      setMessages(prev =>
        prev.map(msg => msg.id === tempID ? sentMessage : msg)
      );
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempID));
      setInputMessage(messageContent);
      setAttachedFiles({ images: attachedFiles.images, videos: attachedFiles.videos, documents: attachedFiles.documents });
    }
  };

  const markMessageAsRead = async (messageIDs: string[]) => {
    try {
      await sdkClient.messages.markAsRead({ messageIDs });
    } catch (error) {
      console.error('❌ Failed to mark messages as read:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isAdminConversation = () => {
    if (!conversation) return false;
    return conversation.participantTypes.includes(UserType.ADMIN);
  };

  const fetchParticipantProfile = async () => {
    if (!conversation || conversation.type !== 'direct') return null;

    const { userID, userType } = getOtherParticipant(
      conversation.participantIDs,
      conversation.participantTypes,
      conversation.metadata,
      user
    );

    try {
      const participant = await sdkClient.users.profiles.lookupUserProfile(userID, userType);

      return setOtherParticipant({
        id: participant.id,
        type: userType,
        name: participant.firstName + ' ' + participant.lastName,
        avatar: participant.avatarUrl || '',
      });
    } catch (error) {
      console.error('❌ Failed to load participant info:', error);
    }
  };

  if (!conversation) {
    return <EmptyChatState />;
  }

  if (isLoading) {
    return <ChatWindowSkeleton/>
  }

  // Calculate final presence status
  const finalPresenceStatus = (() => {
    if (!otherParticipantPresence) {
      return { status: 'offline' as const, color: 'bg-gray-500', label: 'Offline' };
    }

    if (isActivelyViewing && otherParticipantPresence.isOnline) {
      return { status: 'online' as const, color: 'bg-green-500', label: 'Active now' };
    }

    if (otherParticipantPresence.isOnline) {
      return { status: 'away' as const, color: 'bg-yellow-500', label: 'Active on platform' };
    }

    return {
      status: 'offline' as const,
      color: 'bg-gray-500',
      label: 'Offline'
    };
  })();

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -left-48 top-1/4 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute w-96 h-96 -right-48 bottom-1/4 bg-gradient-to-l from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <ChatHeader
        otherParticipant={otherParticipant}
        presenceStatus={finalPresenceStatus}
        isConnected={isConnected}
        onBack={onBack}
        onProfileClick={() =>
          router.push(`/profile?userID=${otherParticipant?.id}&userType=${otherParticipant?.type}`)
        }
      />

      <MessagesList
        messages={messages}
        currentUserID={user?.id}
        currentUserType={user?.type}
        otherParticipant={otherParticipant}
        isTyping={isTyping}
        isAdminConversation={isAdminConversation()}
        messagesEndRef={messagesEndRef}
      />

      <MessageInput
        value={inputMessage}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isConnected={isConnected}
        isAdminConversation={isAdminConversation()}
        disabled={isLoading}
        sdkClient={sdkClient}
        onFileAttached={handleFileAttached}
      />
    </div>
  );
};
