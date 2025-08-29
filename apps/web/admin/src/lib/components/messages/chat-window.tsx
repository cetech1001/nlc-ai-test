'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Info,
  MoreVertical,
  Send,
  Smile,
  UserCircle,
  Users,
  Shield,
  Paperclip,
  ArrowLeft
} from 'lucide-react';
import { sdkClient } from '@/lib/sdk-client';
import { useMessagingWebSocket } from '@/lib/hooks';
import { ConversationResponse, DirectMessageResponse, MessageType } from '@nlc-ai/sdk-messaging';
import { toast } from 'sonner';
import { useAuth } from "@nlc-ai/web-auth";
import { UserType } from "@nlc-ai/sdk-users";

interface ChatWindowProps {
  conversation: ConversationResponse | null;
  onBack?: () => void;
}

interface Participant {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
  isOnline: boolean;
  email?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                        conversation,
                                                        onBack,
                                                      }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket event handlers - use useCallback to prevent re-renders
  const handleNewMessage = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    console.log('📨 New message received:', data);

    if (data.conversationID === conversation?.id) {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) {
          console.log('Message already exists, skipping:', data.message.id);
          return prev;
        }

        console.log('Adding new message to state:', data.message.id);
        const newMessages = [...prev, data.message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        return newMessages;
      });

      // Auto-mark as read if message is not from current user
      if (data.message.senderID !== user?.id || data.message.senderType !== user?.type) {
        console.log('Auto-marking message as read:', data.message.id);
        setTimeout(() => {
          markMessageAsRead([data.message.id]);
        }, 1000);
      }
    }
  }, [conversation?.id, user?.id, user?.type]);

  const handleMessageUpdated = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    console.log('✏️ Message updated:', data);

    if (data.conversationID === conversation?.id) {
      setMessages(prev =>
        prev.map(msg => msg.id === data.message.id ? data.message : msg)
      );
    }
  }, [conversation?.id]);

  const handleMessageDeleted = useCallback((data: { conversationID: string; messageID: string }) => {
    console.log('🗑️ Message deleted:', data);

    if (data.conversationID === conversation?.id) {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageID));
    }
  }, [conversation?.id]);

  const handleMessagesRead = useCallback((data: { conversationID: string; messageIDs: string[]; readerID: string; readerType: string }) => {
    console.log('👁️ Messages read:', data);

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

  const handleUserTyping = useCallback((data: { userID: string; userType: string; conversationID: string; isTyping: boolean }) => {
    console.log('👀 User typing:', data);
    // The typing state is managed by the hook itself
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('🚫 WebSocket error:', error);
    toast.error('Connection error - messages may not update in real-time');
  }, []);

  // WebSocket integration
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    getTypingUsers,
  } = useMessagingWebSocket({
    enabled: !!conversation,
    onNewMessage: handleNewMessage,
    onMessageUpdated: handleMessageUpdated,
    onMessageDeleted: handleMessageDeleted,
    onMessagesRead: handleMessagesRead,
    onUserTyping: handleUserTyping,
    onError: handleError,
  });

  const typingUsers = conversation ? getTypingUsers(conversation.id) : [];
  const isTyping = typingUsers.length > 0;

  // Load initial messages when conversation changes
  useEffect(() => {
    if (conversation) {
      console.log('🔄 Loading messages for conversation:', conversation.id);
      loadMessages();
    }
  }, [conversation?.id]);

  // Join/leave conversation when connection status changes
  useEffect(() => {
    if (conversation && isConnected) {
      console.log('🚪 Joining conversation via WebSocket:', conversation.id);
      joinConversation(conversation.id);

      return () => {
        console.log('🚪 Leaving conversation:', conversation.id);
        leaveConversation(conversation.id);
      };
    }
    return () => {};
  }, [conversation?.id, isConnected, joinConversation, leaveConversation]);

  // Get other participant info when conversation or user changes
  useEffect(() => {
    if (user?.id && conversation) {
      getOtherParticipant();
    }
  }, [user?.id, conversation?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      console.log('📥 Loading messages from API for conversation:', conversation.id);

      const response = await sdkClient.messaging.getMessages(conversation.id, {
        page: 1,
        limit: 50,
      });

      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      console.log('📥 Loaded messages:', sortedMessages.length);
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

    // Send typing indicator
    if (value.trim() && !typingTimeout) {
      console.log('⌨️ Sending typing start');
      sendTypingStatus(conversation.id, true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const newTimeout = setTimeout(() => {
      console.log('⌨️ Sending typing stop');
      sendTypingStatus(conversation.id, false);
      setTypingTimeout(null);
    }, 1000);

    setTypingTimeout(newTimeout);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    console.log('📤 Sending message:', messageContent);

    // Clear typing status
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    if (isConnected) {
      sendTypingStatus(conversation.id, false);
    }

    try {
      // Send the message - WebSocket will handle real-time updates
      const sentMessage = await sdkClient.messaging.sendMessage(conversation.id, {
        type: MessageType.TEXT,
        content: messageContent,
      });

      console.log('✅ Message sent successfully:', sentMessage.id);

    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      setInputMessage(messageContent); // Restore message on error
    }
  };

  const markMessageAsRead = async (messageIDs: string[]) => {
    try {
      await sdkClient.messaging.markAsRead({ messageIDs });
      console.log('👁️ Marked messages as read:', messageIDs);
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

  const getOtherParticipant = async () => {
    if (!conversation || conversation.type !== 'direct') return null;

    // Find the non-admin participant
    let otherUserID = '';
    let otherUserType: UserType = UserType.coach;

    for (let i = 0; i < conversation.participantIDs.length; i++) {
      if (conversation.participantIDs[i] !== user?.id || conversation.participantTypes[i] !== 'admin') {
        otherUserID = conversation.participantIDs[i];
        otherUserType = conversation.participantTypes[i] as UserType;
        break;
      }
    }

    try {
      const participant = await sdkClient.users.profile.lookupProfile(otherUserType, otherUserID);

      setOtherParticipant({
        id: participant.id,
        type: otherUserType,
        name: participant.firstName + ' ' + participant.lastName,
        avatar: participant.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${participant.firstName}${participant.lastName}`,
        isOnline: isConnected, // Use WebSocket connection status as proxy
        email: participant.email,
      });
    } catch (error) {
      console.error('❌ Failed to load participant info:', error);
    }

    return;
  };

  const isCurrentUserMessage = (message: DirectMessageResponse) => {
    return message.senderID === user?.id && message.senderType === user?.type;
  };

  const getParticipantTypeIcon = (userType: UserType) => {
    switch (userType) {
      case UserType.coach:
        return <UserCircle className="w-4 h-4 text-blue-400" />;
      case UserType.client:
        return <Users className="w-4 h-4 text-green-400" />;
      default:
        return <Shield className="w-4 h-4 text-purple-400" />;
    }
  };

  const getParticipantTypeLabel = (userType: UserType) => {
    switch (userType) {
      case UserType.coach: return 'Coach';
      case UserType.client: return 'Client';
      case UserType.admin: return 'Admin';
      default: return '';
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">💬</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-stone-400">Choose from coaches, clients, or start a new conversation</p>
          {!isConnected && (
            <p className="text-red-400 text-sm mt-2">⚠️ Real-time updates unavailable</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50 lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {otherParticipant && (
            <>
              <div className="relative">
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                />
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  {otherParticipant.name}
                  {getParticipantTypeIcon(otherParticipant.type)}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-stone-500'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-stone-500">
                    {getParticipantTypeLabel(otherParticipant.type)}
                  </span>
                  {otherParticipant.email && (
                    <>
                      <span className="text-stone-500">•</span>
                      <span className="text-xs text-stone-500">{otherParticipant.email}</span>
                    </>
                  )}
                  {!isConnected && (
                    <>
                      <span className="text-stone-500">•</span>
                      <span className="text-xs text-red-400">Offline mode</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {otherParticipant?.type === UserType.coach ? (
                <UserCircle className="w-8 h-8 text-white" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            <h4 className="text-white font-medium mb-2">Admin Support Chat</h4>
            <p className="text-stone-400 text-sm">
              Start a conversation with {otherParticipant?.name}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isCurrentUserMessage(message) ? 'order-2' : 'order-1'}`}>
                <div className="text-xs text-stone-500 mb-1">
                  {isCurrentUserMessage(message) ? 'You' : otherParticipant?.name}
                  {message.senderType === 'admin' && ' (Admin Support)'}
                  • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.isRead && isCurrentUserMessage(message) && (
                    <span className="ml-2 text-blue-400">✓</span>
                  )}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  isCurrentUserMessage(message)
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-br-md'
                    : 'bg-neutral-700/80 text-white rounded-bl-md'
                }`}>
                  <div className="whitespace-pre-line">{message.content}</div>
                  {message.isEdited && (
                    <div className="text-xs opacity-60 mt-1">(edited)</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl rounded-bl-md bg-neutral-700/80 text-white">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-neutral-700">
        <div className="flex items-center gap-3">
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${otherParticipant?.name || 'user'}...`}
              className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-purple-500 resize-none max-h-32"
              rows={1}
            />
          </div>
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-stone-500 text-center flex-1">
            Administrative support chat - messages are monitored
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
