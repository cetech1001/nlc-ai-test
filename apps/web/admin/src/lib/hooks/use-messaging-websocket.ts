import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@nlc-ai/web-auth';
import { DirectMessageResponse } from '@nlc-ai/sdk-messages';
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

interface TypingUser {
  userID: string;
  userType: string;
  isTyping: boolean;
  timestamp: number;
}

const TYPING_TIMEOUT = 3000;
const RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;

export const useMessagingWebSocket = (options: UseMessagingWebSocketOptions = {}) => {
  const { user } = useAuth();
  const token = localStorage.getItem(appConfig.auth.tokenKey);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, Map<string, TypingUser>>>(new Map());
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Clean up typing indicators periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const updated = new Map(prev);
        let hasChanges = false;

        updated.forEach((conversationTyping, conversationID) => {
          const updatedConversation = new Map(conversationTyping);

          updatedConversation.forEach((typingUser, userKey) => {
            if (now - typingUser.timestamp > TYPING_TIMEOUT) {
              updatedConversation.delete(userKey);
              hasChanges = true;
            }
          });

          if (updatedConversation.size === 0) {
            updated.delete(conversationID);
          } else {
            updated.set(conversationID, updatedConversation);
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Memoized callback functions
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionAttempts(0);

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const handleGatewayReady = useCallback((data: any) => {
    setIsReady(true);
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    setIsReady(false);

    // Clear typing states
    setTypingUsers(new Map());

    // Clear typing timeouts
    typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    typingTimeoutsRef.current.clear();
  }, []);

  const handleConnectError = useCallback((error: any) => {
    console.error('🚫 WebSocket connection error:', error);
    setConnectionAttempts(prev => {
      const attempts = prev + 1;

      // Implement exponential backoff
      if (attempts < RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY * Math.pow(2, attempts - 1);

        reconnectTimeoutRef.current = setTimeout(() => {
          socketRef.current?.connect();
        }, delay);
      } else {
        console.error('❌ Max reconnection attempts reached');
        options.onError?.(new Error('Failed to establish WebSocket connection'));
      }

      return attempts;
    });
  }, [options.onError]);

  const handleNewMessage = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    options.onNewMessage?.(data);
  }, [options.onNewMessage]);

  const handleMessageUpdated = useCallback((data: { conversationID: string; message: DirectMessageResponse }) => {
    options.onMessageUpdated?.(data);
  }, [options.onMessageUpdated]);

  const handleMessageDeleted = useCallback((data: { conversationID: string; messageID: string }) => {
    options.onMessageDeleted?.(data);
  }, [options.onMessageDeleted]);

  const handleMessagesRead = useCallback((data: { conversationID: string; messageIDs: string[]; readerID: string; readerType: string }) => {
    options.onMessagesRead?.(data);
  }, [options.onMessagesRead]);

  const handleUserTyping = useCallback((data: { userID: string; userType: string; conversationID: string; isTyping: boolean }) => {
    // Don't show typing for current user
    if (data.userID === user?.id && data.userType === user?.type) {
      return;
    }


    const userKey = `${data.userType}:${data.userID}`;

    setTypingUsers(prev => {
      const updated = new Map(prev);
      const conversationTyping = updated.get(data.conversationID) || new Map();

      if (data.isTyping) {
        conversationTyping.set(userKey, {
          userID: data.userID,
          userType: data.userType,
          isTyping: true,
          timestamp: Date.now(),
        });
      } else {
        conversationTyping.delete(userKey);
      }

      if (conversationTyping.size === 0) {
        updated.delete(data.conversationID);
      } else {
        updated.set(data.conversationID, conversationTyping);
      }

      return updated;
    });

    options.onUserTyping?.(data);
  }, [user?.id, user?.type, options.onUserTyping]);

  const handleError = useCallback((error: any) => {
    console.error('💥 WebSocket error:', error);
    options.onError?.(error);
  }, [options.onError]);

  // Public API functions
  const joinConversation = useCallback((conversationID: string) => {
    if (!socketRef.current?.connected || !isReady) {
      console.warn('⚠️ Cannot join conversation - not connected or ready');
      return false;
    }

    socketRef.current.emit('join_conversation', { conversationID });
    return true;
  }, [isReady]);

  const leaveConversation = useCallback((conversationID: string) => {
    if (!socketRef.current?.connected) {
      return false;
    }

    socketRef.current.emit('leave_conversation', { conversationID });

    // Clear typing state for this conversation
    setTypingUsers(prev => {
      const updated = new Map(prev);
      updated.delete(conversationID);
      return updated;
    });

    return true;
  }, []);

  const sendTypingStatus = useCallback((conversationID: string, isTyping: boolean) => {
    if (!socketRef.current?.connected || !isReady) {
      return false;
    }

    const timeoutKey = `${conversationID}:${user?.id}`;

    // Clear existing timeout
    const existingTimeout = typingTimeoutsRef.current.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeoutsRef.current.delete(timeoutKey);
    }

    // Send typing status
    socketRef.current.emit('typing', { conversationID, isTyping });

    // If typing, set timeout to automatically stop typing indicator
    if (isTyping) {
      const timeout = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('typing', { conversationID, isTyping: false });
        }
        typingTimeoutsRef.current.delete(timeoutKey);
      }, TYPING_TIMEOUT - 500); // Send stop slightly before cleanup

      typingTimeoutsRef.current.set(timeoutKey, timeout);
    }

    return true;
  }, [isReady, user?.id]);

  const getTypingUsers = useCallback((conversationID: string) => {
    const conversationTyping = typingUsers.get(conversationID);
    if (!conversationTyping) return [];

    return Array.from(conversationTyping.values())
      .filter(typingUser => typingUser.isTyping)
      .map(typingUser => ({
        userID: typingUser.userID,
        userType: typingUser.userType
      }));
  }, [typingUsers]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clear all timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    typingTimeoutsRef.current.clear();

    setIsConnected(false);
    setIsReady(false);
    setTypingUsers(new Map());
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!options.enabled || !token || !user) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3000';

    const socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: '/api/messages/socket.io',
      forceNew: true,
      timeout: 10000,
      reconnection: false, // We'll handle reconnection manually
      autoConnect: true,
    });

    socketRef.current = socket;

    // Register event handlers
    socket.on('connect', handleConnect);
    socket.on('gateway_ready', handleGatewayReady);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleError);

    // Connection success handlers
    socket.on('connected', (data: any) => {
    });

    socket.on('joined_conversation', (data: { conversationID: string }) => {
    });

    socket.on('left_conversation', (data: { conversationID: string }) => {
    });

    return disconnect;
  }, [
    options.enabled,
    token,
    user?.id,
    handleConnect,
    handleGatewayReady,
    handleDisconnect,
    handleConnectError,
    handleNewMessage,
    handleMessageUpdated,
    handleMessageDeleted,
    handleMessagesRead,
    handleUserTyping,
    handleError,
    disconnect
  ]);

  return {
    isConnected: isConnected && isReady,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    getTypingUsers,
    disconnect,
    connectionAttempts,
  };
};
