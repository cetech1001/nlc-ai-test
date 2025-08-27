import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@nlc-ai/web-auth';
import { DirectMessageResponse } from '@nlc-ai/sdk-messaging';
import { appConfig } from "@nlc-ai/web-shared";

interface UseMessagingWebSocketOptions {
  enabled?: boolean;
  onNewMessage?: (data: { conversationID: string; message: DirectMessageResponse }) => void;
  onMessageUpdated?: (data: { conversationID: string; message: DirectMessageResponse }) => void;
  onMessageDeleted?: (data: { conversationID: string; messageID: string }) => void;
  onMessagesRead?: (data: { conversationID: string; messageIDs: string[]; readerID: string; readerType: string }) => void;
  onUserTyping?: (data: { userID: string; userType: string; conversationID: string; isTyping: boolean }) => void;
  onError?: (error: any) => void;
}

interface TypingUsers {
  [conversationID: string]: {
    [userKey: string]: {
      userID: string;
      userType: string;
      isTyping: boolean;
      timestamp: number;
    };
  };
}

export const useMessagingWebSocket = (options: UseMessagingWebSocketOptions = {}) => {
  const { user } = useAuth();
  const token = localStorage.getItem(appConfig.auth.tokenKey);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUsers>({});
  const [joinedConversations, setJoinedConversations] = useState<Set<string>>(new Set());
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Clean up expired typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const updated: TypingUsers = {};
        let hasChanges = false;

        Object.keys(prev).forEach(conversationID => {
          updated[conversationID] = {};
          Object.keys(prev[conversationID]).forEach(userKey => {
            const user = prev[conversationID][userKey];
            // Remove typing indicators older than 3 seconds
            if (now - user.timestamp < 3000) {
              updated[conversationID][userKey] = user;
            } else {
              hasChanges = true;
            }
          });
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Stable callback functions using useCallback
  const joinConversation = useCallback((conversationID: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot join conversation');
      return;
    }

    if (joinedConversations.has(conversationID)) {
      console.log('ℹ️ Already joined conversation:', conversationID);
      return;
    }

    console.log('🚪 Joining conversation:', conversationID);
    socketRef.current.emit('join_conversation', { conversationID });
  }, [joinedConversations]);

  const leaveConversation = useCallback((conversationID: string) => {
    if (!socketRef.current?.connected) {
      return;
    }

    console.log('🚪 Leaving conversation:', conversationID);
    socketRef.current.emit('leave_conversation', { conversationID });
  }, []);

  const sendTypingStatus = useCallback((conversationID: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('typing', { conversationID, isTyping });
  }, []);

  const getTypingUsers = useCallback((conversationID: string) => {
    const conversationTyping = typingUsers[conversationID] || {};
    return Object.values(conversationTyping)
      .filter(typingUser => typingUser.isTyping && typingUser.userID !== user?.id)
      .map(typingUser => ({ userID: typingUser.userID, userType: typingUser.userType }));
  }, [typingUsers, user?.id]);

  useEffect(() => {
    if (!options.enabled || !token || !user) {
      console.log('WebSocket not enabled or missing auth:', {
        enabled: options.enabled,
        hasToken: !!token,
        hasUser: !!user
      });
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3000';

    console.log('🔌 Connecting to WebSocket via gateway:', apiUrl);

    const socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: '/api/messages/socket.io',
      forceNew: true,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionAttempts(0);
      console.log('✅ Connected to messaging WebSocket via gateway');
    });

    socket.on('connected', (data) => {
      console.log('🎉 Gateway connection established:', data);
    });

    socket.on('gateway_ready', (data) => {
      console.log('🚀 Gateway ready:', data);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setJoinedConversations(new Set());
      console.log('❌ Disconnected from messaging WebSocket:', reason);
    });

    socket.on('connect_error', (error) => {
      setConnectionAttempts(prev => prev + 1);
      console.error('🚫 WebSocket connection error:', error);
      options.onError?.(error);
    });

    socket.on('service_disconnected', (data) => {
      console.warn('⚠️ Service disconnected:', data);
      setIsConnected(false);
    });

    // Message events
    socket.on('new_message', (data: { conversationID: string; message: DirectMessageResponse }) => {
      console.log('📨 Received new message:', data);
      options.onNewMessage?.(data);
    });

    socket.on('message_updated', (data: { conversationID: string; message: DirectMessageResponse }) => {
      console.log('✏️ Message updated:', data);
      options.onMessageUpdated?.(data);
    });

    socket.on('message_deleted', (data: { conversationID: string; messageID: string }) => {
      console.log('🗑️ Message deleted:', data);
      options.onMessageDeleted?.(data);
    });

    socket.on('messages_read', (data: { conversationID: string; messageIDs: string[]; readerID: string; readerType: string }) => {
      console.log('👁️ Messages read:', data);
      options.onMessagesRead?.(data);
    });

    // Typing events
    socket.on('user_typing', (data: { userID: string; userType: string; conversationID: string; isTyping: boolean }) => {
      console.log('👀 User typing:', data);

      setTypingUsers(prev => {
        const userKey = `${data.userType}:${data.userID}`;
        const conversationTyping = prev[data.conversationID] || {};

        if (data.isTyping) {
          conversationTyping[userKey] = {
            userID: data.userID,
            userType: data.userType,
            isTyping: true,
            timestamp: Date.now(),
          };
        } else {
          delete conversationTyping[userKey];
        }

        return {
          ...prev,
          [data.conversationID]: conversationTyping,
        };
      });

      options.onUserTyping?.(data);
    });

    // Conversation events
    socket.on('joined_conversation', (data: { conversationID: string }) => {
      setJoinedConversations(prev => new Set(prev).add(data.conversationID));
      console.log('✅ Successfully joined conversation:', data.conversationID);
    });

    socket.on('left_conversation', (data: { conversationID: string }) => {
      setJoinedConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.conversationID);
        return newSet;
      });
      console.log('👋 Left conversation:', data.conversationID);
    });

    // Error handling
    socket.on('error', (error: any) => {
      console.error('💥 WebSocket error:', error);
      options.onError?.(error);
    });

    // Debugging: Log all events in development
    if (process.env.NODE_ENV === 'development') {
      socket.onAny((eventName, ...args) => {
        console.log('🔊 WebSocket event:', eventName, args);
      });
    }

    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [options.enabled, token, user?.id, options.onNewMessage, options.onMessageUpdated, options.onMessageDeleted, options.onMessagesRead, options.onUserTyping, options.onError]);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    getTypingUsers,
    joinedConversations: Array.from(joinedConversations),
    connectionAttempts,
  };
};
