'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { PublicChatClient } from '@nlc-ai/sdk-agents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface StandaloneChatProps {
  coachID: string;
  publicChatClient: PublicChatClient;
}

interface SessionThread {
  threadID: string;
  createdAt: number;
  coachID: string;
}

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const SESSION_KEY = 'nlc_chat_session';

export const StandaloneChat: React.FC<StandaloneChatProps> = ({
                                                                coachID,
                                                                publicChatClient
                                                              }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadID, setThreadID] = useState<string | null>(null);
  const [coachName, setCoachName] = useState<string>('Coach');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageIDRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, [coachID]);

  // Get session thread from sessionStorage
  const getSessionThread = (): SessionThread | null => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const session: SessionThread = JSON.parse(stored);

      // Check if session is for the same coach
      if (session.coachID !== coachID) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      // Check if session has expired (older than 1 hour)
      const now = Date.now();
      const age = now - session.createdAt;

      if (age > SESSION_DURATION) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch (err) {
      console.error('Failed to parse session:', err);
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  };

  // Save thread to sessionStorage
  const saveSessionThread = (threadID: string) => {
    const session: SessionThread = {
      threadID,
      createdAt: Date.now(),
      coachID
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // Clear session thread
  const clearSessionThread = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  const initializeChat = async () => {
    try {
      const info = await publicChatClient.getChatbotInfo();
      setCoachName(info.coachName);

      const existingSession = getSessionThread();

      let activeThreadID: string;
      let shouldLoadMessages = false;

      if (existingSession) {
        console.log('Using existing session thread:', existingSession.threadID);
        activeThreadID = existingSession.threadID;
        shouldLoadMessages = true;
      } else {
        console.log('Creating new thread...');
        const thread = await publicChatClient.createThread();
        activeThreadID = thread.threadID;
        saveSessionThread(activeThreadID);
      }

      setThreadID(activeThreadID);

      if (shouldLoadMessages) {
        const messages = await publicChatClient.getThreadMessages(activeThreadID);

        if (messages.length > 0) {
          // const sortedMessages = [...messages].reverse();
          setMessages(messages.map(m => ({
            id: m.id,
            role: m.role,
            timestamp: new Date(m.createdAt),
            content: m.content,
          })));
        } else {
          showGreeting(info.coachName);
        }
      } else {
        showGreeting(info.coachName);
      }

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to connect to chatbot. Please try refreshing the page.');
    }
  };

  const showGreeting = (name: string) => {
    const greetingMsg: Message = {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm ${name}'s AI assistant. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([greetingMsg]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !threadID) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    const assistantMessageID = (Date.now() + 1).toString();
    streamingMessageIDRef.current = assistantMessageID;

    const assistantMessage: Message = {
      id: assistantMessageID,
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      await publicChatClient.streamMessage(
        threadID,
        messageToSend,
        (content: string) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageID
                ? { ...msg, content: msg.content + content }
                : msg
            )
          );
        },
        (fullContent: string) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageID
                ? { ...msg, content: fullContent, isStreaming: false }
                : msg
            )
          );
          setIsLoading(false);
          streamingMessageIDRef.current = null;
        },
        (error: Error) => {
          console.error('Streaming error:', error);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageID
                ? {
                  ...msg,
                  content: "I'm having trouble responding right now. Please try again in a moment.",
                  isStreaming: false
                }
                : msg
            )
          );
          setIsLoading(false);
          streamingMessageIDRef.current = null;
        }
      );

    } catch (err) {
      console.error('Failed to send message:', err);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageID
            ? {
              ...msg,
              content: "I'm having trouble responding right now. Please try again in a moment.",
              isStreaming: false
            }
            : msg
        )
      );
      setIsLoading(false);
      streamingMessageIDRef.current = null;
    }
  };

  const handleNewChat = () => {
    clearSessionThread();
    setMessages([]);
    setThreadID(null);
    initializeChat();
  };

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4">
        <div className="absolute w-96 h-96 -left-20 top-40 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
        <div className="absolute w-96 h-96 -right-20 bottom-40 opacity-20 bg-gradient-to-l from-purple-600 via-fuchsia-400 to-violet-600 rounded-full blur-[120px]" />

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center relative z-10">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden flex flex-col">
      <div className="absolute w-96 h-96 -left-20 top-40 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
      <div className="absolute w-96 h-96 -right-20 bottom-40 opacity-20 bg-gradient-to-l from-purple-600 via-fuchsia-400 to-violet-600 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col h-[93vh] max-w-4xl mx-auto w-full">
        <div className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">{coachName}</h1>
                <p className="text-white/80 text-xs">AI Assistant</p>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
              title="Start new conversation"
            >
              New Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                  : 'bg-gradient-to-br from-purple-600 to-fuchsia-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'bg-neutral-800/50 border border-neutral-700'
                } rounded-lg p-3`}>
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse" />
                    )}
                  </p>
                </div>
                <p className="text-stone-500 text-xs mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 p-4 bg-neutral-900/80 border-t border-neutral-700 backdrop-blur-sm">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-black/30 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-purple-500 focus:outline-none text-sm"
              disabled={isLoading || !threadID}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !threadID}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
