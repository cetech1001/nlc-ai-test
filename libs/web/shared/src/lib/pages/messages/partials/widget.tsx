import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2, Headphones, User } from 'lucide-react';
import { useMessagingWebSocket } from '../hooks';
import { DirectMessageResponse, ConversationResponse, MessageType } from '@nlc-ai/sdk-messages';
import { toast } from 'sonner';
import {UserProfile, UserType} from "@nlc-ai/types";
import {NLCClient} from "@nlc-ai/sdk-main";

interface ChatPopupWidgetProps {
  sdkClient: NLCClient;
  user?: UserProfile | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ChatPopupWidget: React.FC<ChatPopupWidgetProps> = ({
                                                                  sdkClient,
                                                                  isOpen: controlledIsOpen,
                                                                  onToggle,
                                                                  user
                                                                }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  // WebSocket event handlers
  const handleNewMessage = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    if (data.conversationID === conversation?.id) {
      setMessages(prev => {
        // Check if message already exists (including optimistic messages)
        const exists = prev.some(msg =>
          msg.id === data.message.id ||
          (msg.id.startsWith('optimistic-') && msg.content === data.message.content && msg.senderID === data.message.senderID)
        );

        if (exists) {
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

      // Auto-mark as read if message is not from current user
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
    // Typing indicators managed by the hook
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
    user,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeSupportConversation();
    }
  }, [isOpen]);

  // Handle unread count
  useEffect(() => {
    if (!conversation) {
      setUnreadCount(0);
      return;
    }

    if (isOpen) {
      // Reset unread count when widget is opened
      setUnreadCount(0);

      // Mark unread messages as read
      const unreadMessages = messages.filter(msg =>
        !msg.isRead &&
        msg.senderID !== user?.id &&
        msg.senderType !== user?.type
      );

      if (unreadMessages.length > 0) {
        markMessageAsRead(unreadMessages.map(msg => msg.id));
      }
    } else {
      // Calculate unread count from conversation data when widget is closed
      const currentUserKey = `${user?.type}:${user?.id}`;
      const count = (conversation.unreadCount as Record<string, number>)[currentUserKey] || 0;
      setUnreadCount(count);
    }
  }, [isOpen, conversation?.id, conversation?.unreadCount, messages, user?.id, user?.type]);

  // Join/leave conversation when connection status changes
  useEffect(() => {
    if (conversation && isConnected) {
      console.log('🚪 Widget joining conversation via WebSocket:', conversation.id);
      joinConversation(conversation.id);

      return () => {
        console.log('🚪 Widget leaving conversation:', conversation.id);
        leaveConversation(conversation.id);
      };
    }
    return () => { /* empty */ };
  }, [conversation?.id, isConnected, joinConversation, leaveConversation]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const initializeSupportConversation = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // First check if we already have an admin conversation
      const conversations = await sdkClient.messages.getConversations({
        page: 1,
        limit: 50,
      });

      const adminConversation = conversations.data.find(conv =>
        conv.type === 'direct' &&
        conv.participantTypes.includes(UserType.ADMIN)
      );

      if (adminConversation) {
        setConversation(adminConversation);
        await loadMessages(adminConversation.id);
      } else {
        const newConversation = await sdkClient.messages.createConversation({
          type: 'direct',
          participantIDs: [UserType.ADMIN],
          participantTypes: [UserType.ADMIN],
        });

        setConversation(newConversation);
        await loadMessages(newConversation.id);
      }
    } catch (error: any) {
      console.error('Failed to initialize support conversation:', error);
      toast.error('Failed to connect to support');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationID: string) => {
    try {
      const response = await sdkClient.messages.getMessages(conversationID, {
        limit: 50,
        page: 1
      });

      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load message history');
    }
  };

  const handleInputChange = (value: string) => {
    setInputMessage(value);

    if (!conversation || !isConnected) return;

    // Send typing indicator
    if (value.trim() && !typingTimeout) {
      sendTypingStatus(conversation.id, true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const newTimeout = setTimeout(() => {
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

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setInputMessage('');

    // Clear typing status
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
      });

      // Replace optimistic message with real message
      setMessages(prev =>
        prev.map(msg => msg.id === tempID ? sentMessage : msg)
      );

      console.log('✅ Widget message sent successfully:', sentMessage.id);
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

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUserMessage = (message: DirectMessageResponse) => {
    return message.senderID === user?.id && message.senderType === user?.type;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggle}
          className="relative w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full shadow-lg shadow-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/60 transition-all duration-300 flex items-center justify-center group hover:scale-105"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          {unreadCount > 0 ? (
            <div className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-pulse"
                 title={`${unreadCount} unread messages`}>
              <span className="text-white text-xs font-bold px-1.5">{unreadCount > 99 ? '99+' : unreadCount}</span>
            </div>
          ) : (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"
                 title="Support available"></div>
          )}

          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`w-96 bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-700/50 shadow-2xl transition-all duration-300 overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[36rem]'
      }`}>
        {/* Glow Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute w-40 h-40 -right-10 -top-10 bg-gradient-to-l from-fuchsia-500/20 via-fuchsia-600/20 to-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute w-40 h-40 -left-10 -bottom-10 bg-gradient-to-r from-violet-500/20 via-purple-600/20 to-fuchsia-600/20 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-neutral-700/50 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Admin Support</h3>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50"
              aria-label={isMinimized ? "Expand messaging" : "Minimize messaging"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggle}
              className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="relative z-10 flex-1 p-4 space-y-3 overflow-y-auto" style={{ height: 'calc(36rem - 4rem - 7rem)' }}>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500 mb-3"></div>
                  <span className="text-stone-400 text-sm">Connecting to support...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/30">
                    <Headphones className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Welcome to Admin Support!</h4>
                  <p className="text-stone-400 text-sm px-4">How can we help you today? Our support team is here to assist with any questions or issues.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isUserMessage = isCurrentUserMessage(message);
                  const isOptimistic = message.id.startsWith('optimistic-');

                  return (
                    <div key={message.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${isUserMessage ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed transition-opacity shadow-lg ${
                          isOptimistic ? 'opacity-70' : 'opacity-100'
                        } ${
                          isUserMessage
                            ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-br-md shadow-fuchsia-500/30'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-bl-md shadow-purple-500/30'
                        }`}>
                          {!isUserMessage && (
                            <div className="flex items-center gap-2 mb-1.5 opacity-90">
                              <User className="w-3 h-3" />
                              <span className="text-xs font-medium">Admin Support</span>
                            </div>
                          )}
                          <div className="whitespace-pre-line">{message.content}</div>
                          {message.isEdited && (
                            <div className="text-xs opacity-60 mt-1">(edited)</div>
                          )}
                        </div>
                        <div className={`text-xs text-stone-500 mt-1 flex items-center gap-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {isUserMessage && message.isRead && !isOptimistic && (
                            <span className="text-blue-400">✓</span>
                          )}
                          {isOptimistic && (
                            <span className="text-stone-400">Sending...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-2xl rounded-bl-md shadow-lg shadow-purple-500/30">
                    <div className="flex items-center gap-2 mb-1.5 opacity-90">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">Admin Support</span>
                    </div>
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
            <div className="relative z-10 p-4 border-t border-neutral-700/50 bg-gradient-to-r from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe your question or issue..."
                    disabled={isLoading}
                    className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 resize-none max-h-24 disabled:opacity-50 backdrop-blur-sm"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-stone-500 mt-2 text-center">
                Direct line to admin support • Real-time messaging
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
