// File: apps/web/coach/src/lib/hooks/use-messaging-websocket.ts

import { useEffect, useRef, useState } from 'react';
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
  onUserTyping?: (data: { userID: string; userType: string; isTyping: boolean }) => void;
  onError?: (error: any) => void;
}

interface TypingUsers {
  [conversationID: string]: {
    [userKey: string]: {
      userID: string;
      userType: string;
      isTyping: boolean;
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

  useEffect(() => {
    if (!options.enabled || !token || !user) {
      console.log('WebSocket not enabled or missing auth:', {
        enabled: options.enabled,
        hasToken: !!token,
        hasUser: !!user
      });
      return;
    }

    // Connect to the API gateway which will proxy to messaging service
    const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    console.log('Connecting to WebSocket via gateway:', wsUrl);

    // Create socket connection through the gateway (no namespace here)
    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'], // Allow fallback
      path: '/api/messages/socket.io', // Custom path for the gateway
      forceNew: true,
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to messaging WebSocket via gateway');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setJoinedConversations(new Set());
      console.log('❌ Disconnected from messaging WebSocket:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🚫 WebSocket connection error:', error);
      options.onError?.(error);
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
    socket.on('user_typing', (data: { userID: string; userType: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const conversationID = 'current'; // You might need to track this per conversation
        const userKey = `${data.userType}:${data.userID}`;

        return {
          ...prev,
          [conversationID]: {
            ...prev[conversationID],
            [userKey]: {
              userID: data.userID,
              userType: data.userType,
              isTyping: data.isTyping,
            },
          },
        };
      });

      options.onUserTyping?.(data);
    });

    // Error handling
    socket.on('error', (error: any) => {
      console.error('💥 WebSocket error:', error);
      options.onError?.(error);
    });

    // Debugging: Log all events
    socket.onAny((eventName, ...args) => {
      console.log('🔊 WebSocket event:', eventName, args);
    });

    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [options.enabled, token, user?.id]);

  const joinConversation = (conversationID: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected, cannot join conversation');
      return;
    }

    if (joinedConversations.has(conversationID)) {
      console.log('ℹ️ Already joined conversation:', conversationID);
      return; // Already joined
    }

    console.log('🚪 Joining conversation:', conversationID);
    socketRef.current.emit('join_conversation', { conversationID });

    socketRef.current.once('joined_conversation', (data: { conversationID: string }) => {
      if (data.conversationID === conversationID) {
        setJoinedConversations(prev => new Set(prev).add(conversationID));
        console.log('✅ Successfully joined conversation:', conversationID);
      }
    });
  };

  const leaveConversation = (conversationID: string) => {
    if (!socketRef.current?.connected) {
      return;
    }

    console.log('🚪 Leaving conversation:', conversationID);
    socketRef.current.emit('leave_conversation', { conversationID });
    setJoinedConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(conversationID);
      return newSet;
    });
  };

  const sendTypingStatus = (conversationID: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('typing', { conversationID, isTyping });
  };

  const getTypingUsers = (conversationID: string) => {
    const conversationTyping = typingUsers[conversationID] || {};
    return Object.values(conversationTyping)
      .filter(user => user.isTyping && user.userID !== user?.userID)
      .map(user => ({ userID: user.userID, userType: user.userType }));
  };

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingStatus,
    getTypingUsers,
    joinedConversations: Array.from(joinedConversations),
  };
};
