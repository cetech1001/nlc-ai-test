'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Camera, Headphones, Info, MoreVertical, Phone, Send, Smile, User, Users, Video,} from 'lucide-react';
import {ChatWindowSkeleton, sdkClient, useMessagingWebSocket} from '@/lib';
import {ConversationResponse, DirectMessageResponse, MessageType} from '@nlc-ai/sdk-messaging';
import {toast} from 'sonner';
import {LoginResponse} from "@nlc-ai/web-auth";
import {UserType} from "@nlc-ai/sdk-users";

interface ChatWindowProps {
  user: LoginResponse['user'] | null;
  conversation: ConversationResponse | null;
  isConvoLoading: boolean;
  onBack?: () => void;
}

interface Participant {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
  isOnline: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                        user,
                                                        conversation,
                                                        onBack,
                                                        isConvoLoading,
                                                      }) => {
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(isConvoLoading);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    if (data.conversationID === conversation?.id) {
      setMessages(prev => {
        // Check if message already exists (including optimistic messages)
        const exists = prev.some(msg =>
          msg.id === data.message.id ||
          (msg.id.startsWith('optimistic-') && msg.content === data.message.content && msg.senderID === data.message.senderID)
        );

        if (exists) {
          console.log('Message exists, replacing optimistic with real:', data.message.id);
          // Replace optimistic message with real one
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

  const handleUserTyping = useCallback((data: { userID: string; userType: string; conversationID: string; isTyping: boolean }) => {
    // The typing state is managed by the hook itself
  }, []);

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

  useEffect(() => {
    if (conversation) {
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
  }, [messages, isTyping]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Add this after the existing useEffect hooks, around line 85
  useEffect(() => {
    // Reset unread count when conversation is opened
    if (conversation?.id && user?.id) {
      const resetUnreadCount = async () => {
        try {
          // Mark unread messages as read when opening conversation
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
    if (!inputMessage.trim() || !conversation || !user?.id) return;

    const messageContent = inputMessage.trim();
    const tempID = `optimistic-${Date.now()}-${Math.random()}`;

    // Create optimistic message for instant UI feedback
    const optimisticMessage: DirectMessageResponse = {
      id: tempID,
      conversationID: conversation.id,
      senderID: user.id,
      senderType: user.type as any,
      type: MessageType.TEXT,
      content: messageContent,
      mediaUrls: [],
      isRead: false,
      isEdited: false,
      createdAt: new Date(),
    };

    // Add optimistic message immediately for instant feedback
    setMessages(prev => [...prev, optimisticMessage]);
    setInputMessage('');

    console.log('📤 Sending message with optimistic update:', messageContent);

    // Clear typing status
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    if (isConnected) {
      sendTypingStatus(conversation.id, false);
    }

    try {
      // Send the message - WebSocket will handle real-time updates and replace optimistic message
      const sentMessage = await sdkClient.messaging.sendMessage(conversation.id, {
        type: MessageType.TEXT,
        content: messageContent,
      });

      // Replace optimistic message with real message
      setMessages(prev =>
        prev.map(msg => msg.id === tempID ? sentMessage : msg)
      );

      console.log('✅ Message sent successfully:', sentMessage.id);
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');

      // Remove optimistic message on error and restore input
      setMessages(prev => prev.filter(msg => msg.id !== tempID));
      setInputMessage(messageContent);
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

  const isAdminConversation = () => {
    if (!conversation) return false;
    return conversation.participantTypes.includes(UserType.ADMIN);
  };

  const getOtherParticipant = async () => {
    if (!conversation || conversation.type !== 'direct') return null;

    const userID = conversation.participantIDs[0] === user?.id ? conversation.participantIDs[1] : conversation.participantIDs[0];
    const userType = conversation.participantIDs[0] === user?.id ? conversation.participantTypes[1] : conversation.participantTypes[0];

    try {
      const participant = await sdkClient.users.profile.lookupProfile(userType, userID);

      setOtherParticipant({
        id: participant.id,
        type: userType,
        name: participant.firstName + ' ' + participant.lastName,
        avatar: participant.avatarUrl || '',
        isOnline: isConnected, // Use WebSocket connection status as proxy
      });
    } catch (error) {
      console.error('❌ Failed to load participant info:', error);
    } finally {
      return ;
    }
  };

  const isCurrentUserMessage = (message: DirectMessageResponse) => {
    return message.senderID === user?.id && message.senderType === user?.type;
  };

  const shouldGroupWithPrevious = (message: DirectMessageResponse, previousMessage: DirectMessageResponse | null) => {
    if (!previousMessage) return false;

    // Group if same sender and messages are within 2 minutes of each other
    const isSameSender = message.senderID === previousMessage.senderID && message.senderType === previousMessage.senderType;
    const timeDiff = new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
    const isWithinTimeLimit = timeDiff < 2 * 60 * 1000; // 2 minutes

    return isSameSender && isWithinTimeLimit;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">💬</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-stone-400">Choose from admin support, clients, or community members</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ChatWindowSkeleton/>
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
              ←
            </button>
          )}
          {otherParticipant && (
            <>
              <div className="relative">
                <img
                  src={otherParticipant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.name}`}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                />
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{otherParticipant.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-stone-500'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-stone-500 capitalize">
                    {otherParticipant.type}
                  </span>
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
          {!isAdminConversation() && (
            <>
              <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            {isAdminConversation() ? (
              <>
                <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-medium mb-2">Admin Support</h4>
                <p className="text-stone-400 text-sm">Get help with your account, features, or technical issues.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-medium mb-2">Start Conversation</h4>
                <p className="text-stone-400 text-sm">Send a message to {otherParticipant?.name}</p>
              </>
            )}
          </div>
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const isGrouped = shouldGroupWithPrevious(message, previousMessage);
            const isCurrentUser = isCurrentUserMessage(message);
            const isOptimistic = message.id.startsWith('optimistic-');

            return (
              <div key={message.id} className={`${isGrouped ? 'mt-1' : 'mt-4'}`}>
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    {/* Show header only for non-grouped messages */}
                    {!isGrouped && (
                      <div className={`text-xs text-stone-500 mb-1 flex items-center gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <span>
                          {message.senderType === 'admin' ? 'Admin Support' :
                            isCurrentUser ? 'You' : otherParticipant?.name}
                        </span>
                        <span>•</span>
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

                    <div className={`p-3 text-sm leading-relaxed transition-opacity ${
                      isOptimistic ? 'opacity-70' : 'opacity-100'
                    } ${
                      isCurrentUser
                        ? `bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white ${isGrouped ? 'rounded-2xl' : 'rounded-2xl rounded-br-md'}`
                        : message.senderType === 'admin'
                          ? `bg-gradient-to-r from-purple-600 to-blue-600 text-white ${isGrouped ? 'rounded-2xl' : 'rounded-2xl rounded-bl-md'}`
                          : `bg-neutral-700/80 text-white ${isGrouped ? 'rounded-2xl' : 'rounded-2xl rounded-bl-md'}`
                    }`}>
                      {message.senderType === 'admin' && !isGrouped && (
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
          })
        )}

        {isTyping && (
          <div className="mt-4">
            <div className="flex justify-start">
              <div className={`p-3 rounded-2xl rounded-bl-md ${
                isAdminConversation()
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                  : 'bg-neutral-700/80'
              } text-white`}>
                {isAdminConversation() && (
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
              {isAdminConversation() ? 'Admin support is typing...' : `${otherParticipant?.name} is typing...`}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-neutral-700">
        <div className="flex items-center gap-3">
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Camera className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isAdminConversation() ? 'Describe your issue or question...' : 'Type your message...'}
              className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 resize-none max-h-32"
              rows={1}
            />
          </div>
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          {isAdminConversation() && (
            <div className="text-xs text-stone-500 text-center flex-1">
              Direct line to admin support • Real-time messaging
            </div>
          )}
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
