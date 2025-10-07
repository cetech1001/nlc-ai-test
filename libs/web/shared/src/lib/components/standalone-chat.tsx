'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StandaloneChatProps {
  coachID: string;
}

export const StandaloneChat: React.FC<StandaloneChatProps> = ({ coachID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadID, setThreadID] = useState<string | null>(null);
  const [coachName, setCoachName] = useState<string>('Coach');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, [coachID]);

  const initializeChat = async () => {
    try {
      // Get coach info
      const infoResponse = await fetch(`/api/public/chat/coach/${coachID}/info`);
      if (!infoResponse.ok) throw new Error('Coach not found');

      const infoData = await infoResponse.json();
      setCoachName(infoData.coachName);

      // Create thread
      const threadResponse = await fetch(`/api/public/chat/coach/${coachID}/thread/create`, {
        method: 'POST'
      });

      if (!threadResponse.ok) throw new Error('Failed to create chat');

      const threadData = await threadResponse.json();
      setThreadID(threadData.threadID);

      // Add greeting message
      const greetingMsg: Message = {
        id: '1',
        role: 'assistant',
        content: `Hi! I'm ${infoData.coachName}'s AI assistant. How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([greetingMsg]);

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to connect to chatbot. Please try refreshing the page.');
    }
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
    setInputValue('');
    setIsLoading(true);

    try {
      // Add message to thread
      await fetch(`/api/public/chat/coach/${coachID}/thread/${threadID}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue })
      });

      // Run assistant
      const runResponse = await fetch(`/api/public/chat/coach/${coachID}/thread/${threadID}/run`, {
        method: 'POST'
      });

      const runData = await runResponse.json();

      // Poll for completion
      let completed = false;
      let attempts = 0;

      while (!completed && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(
          `/api/public/chat/coach/${coachID}/thread/${threadID}/run/${runData.runID}/status`
        );

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          completed = true;

          // Get assistant's response
          const messagesResponse = await fetch(
            `/api/public/chat/coach/${coachID}/thread/${threadID}/messages`
          );

          const messagesData = await messagesResponse.json();

          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: messagesData.messages[0].content[0].text.value,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
        } else if (statusData.status === 'failed') {
          throw new Error('Assistant run failed');
        }

        attempts++;
      }

      if (!completed) {
        throw new Error('Request timed out');
      }

    } catch (err) {
      console.error('Failed to send message:', err);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute w-96 h-96 -left-20 top-40 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
      <div className="absolute w-96 h-96 -right-20 bottom-40 opacity-20 bg-gradient-to-l from-purple-600 via-fuchsia-400 to-violet-600 rounded-full blur-[120px]" />

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">{coachName}</h1>
              <p className="text-white/80 text-xs">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-stone-500 text-xs mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-neutral-900/80 border-t border-neutral-700 backdrop-blur-sm">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
