'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { PublicChatClient } from '@nlc-ai/sdk-agents';
import {ChatbotCustomizationClient} from "@nlc-ai/sdk-users";
import {ChatbotCustomization} from "@nlc-ai/types";

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
  customizationClient: ChatbotCustomizationClient;
}

interface SessionThread {
  threadID: string;
  createdAt: number;
  coachID: string;
}

const SESSION_DURATION = 60 * 60 * 1000;
const SESSION_KEY = 'nlc_chat_session';

export const StandaloneChatPage: React.FC<StandaloneChatProps> = ({
  coachID,
  publicChatClient,
  customizationClient
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadID, setThreadID] = useState<string | null>(null);
  const [coachName, setCoachName] = useState<string>('Coach');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Partial<ChatbotCustomization>>({});

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

  const getSessionThread = (): SessionThread | null => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const session: SessionThread = JSON.parse(stored);

      if (session.coachID !== coachID) {
        clearSessionThread();
        return null;
      }

      const now = Date.now();
      const age = now - session.createdAt;

      if (age > SESSION_DURATION) {
        clearSessionThread();
        return null;
      }

      return session;
    } catch (err) {
      console.error('Failed to parse session:', err);
      clearSessionThread();
      return null;
    }
  };

  const saveSessionThread = (threadID: string) => {
    const session: SessionThread = {
      threadID,
      createdAt: Date.now(),
      coachID
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const clearSessionThread = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  const initializeChat = async () => {
    try {
      const info = await publicChatClient.getChatbotInfo();
      setCoachName(info.coachName);

      const options = await customizationClient.getPublicCustomization(coachID);
      setOptions(options);

      const existingSession = getSessionThread();

      let activeThreadID: string;
      let shouldLoadMessages = false;

      if (existingSession) {
        activeThreadID = existingSession.threadID;
        shouldLoadMessages = true;
      } else {
        const thread = await publicChatClient.createThread();
        activeThreadID = thread.threadID;
        saveSessionThread(activeThreadID);
      }

      setThreadID(activeThreadID);

      if (shouldLoadMessages) {
        const messages = await publicChatClient.getThreadMessages(activeThreadID);

        if (messages.length > 0) {
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: options.greeting!,
              timestamp: new Date()
            },
            ...messages.map(m => ({
              id: m.id,
              role: m.role,
              timestamp: new Date(m.createdAt),
              content: m.content,
            })),
          ]);
        } else {
          showGreeting(options.greeting!);
        }
      } else {
        showGreeting(options.greeting!);
      }

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to connect to chatbot. Please try refreshing the page.');
    }
  };

  const showGreeting = (greeting: string) => {
    const greetingMsg: Message = {
      id: '1',
      role: 'assistant',
      content: greeting,
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
      content: '',
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

  if (error) {
    return (
      <div className="relative flex flex-col w-full h-[97vh] bg-[#0A0A0A] px-4 overflow-hidden">
        <div className="absolute -left-[273px] -top-[209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />
        <div className="flex items-center justify-center h-full z-10">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full h-[97vh] bg-[#0A0A0A] px-4 overflow-hidden">
      {/*<div className="absolute -left-[273px] -top-[209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />*/}
      {/*<div className="absolute right-[168px] bottom-[-209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />*/}

      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-8 py-10 h-[140px] z-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex-shrink-0 overflow-hidden">
            {options.avatarUrl ? (
              <img
                src={options.avatarUrl}
                alt={coachName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {coachName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <h1 className="text-[#F9F9F9] text-2xl lg:text-4xl font-semibold tracking-tight">
              {coachName}
            </h1>
            <p className="text-[#C5C5C5] text-base lg:text-xl tracking-tight">
              Chat Assistant
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="relative w-[94px] h-20 hidden lg:block">
          {!options.logoUrl ? (
            <>
              <svg
                className="absolute left-0 top-1.5 w-[90px] h-[74px]"
                viewBox="0 0 91 74"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0)">
                  <path
                    d="M21.8203 37.161C21.8203 37.161 33.2806 27.0057 42.3097 51.3692C51.3388 75.7327 71.2167 31.0321 71.2167 31.0321C71.2167 31.0321 60.2712 53.0633 46.2708 21.4616C32.2704 -10.1401 21.8203 37.1586 21.8203 37.1586V37.161Z"
                    fill="url(#paint0_linear)"
                  />
                  <path
                    d="M0 73.9998C0 73.9998 32.6675 7.86239 46.2691 21.464C46.2691 21.464 34.4028 -10.4036 18.5342 28.3977C2.6657 67.199 0 73.9998 0 73.9998Z"
                    fill="url(#paint1_linear)"
                  />
                  <path
                    d="M90.1767 0.283203C90.1767 0.283203 55.4887 65.3814 42.3125 51.3689C42.3125 51.3689 53.1928 83.5869 70.248 45.2932C87.3007 6.997 90.1767 0.283203 90.1767 0.283203Z"
                    fill="url(#paint2_linear)"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear"
                    x1="31.3957"
                    y1="22.7096"
                    x2="52.9279"
                    y2="51.4192"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#521A79" />
                    <stop offset="0.490385" stopColor="#E587FF" />
                    <stop offset="1" stopColor="#6839A8" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear"
                    x1="3.70982"
                    y1="70.9008"
                    x2="64.2067"
                    y2="28.1455"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.0192308" stopColor="#FEBEFA" />
                    <stop offset="0.346154" stopColor="#B339D4" />
                    <stop offset="0.653846" stopColor="#7B21BA" />
                    <stop offset="1" stopColor="#7B26F0" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear"
                    x1="39.601"
                    y1="79.1033"
                    x2="106.647"
                    y2="39.7725"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.0192308" stopColor="#FEBEFA" />
                    <stop offset="0.346154" stopColor="#B339D4" />
                    <stop offset="0.653846" stopColor="#7B21BA" />
                    <stop offset="1" stopColor="#7B26F0" />
                  </linearGradient>
                  <clipPath id="clip0">
                    <rect width="90.1722" height="73.7164" fill="white" transform="translate(0 0.283203)" />
                  </clipPath>
                </defs>
              </svg>
              <svg
                className="absolute right-0 top-0 w-[7px] h-[8px]"
                viewBox="0 0 8 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip1)">
                  <path
                    d="M0.515625 5.07522L7.53152 0L7.5436 8.07927L5.35884 4.57253L0.515625 5.07522Z"
                    fill="url(#paint3_linear)"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint3_linear"
                    x1="4.7963"
                    y1="8.07927"
                    x2="7.71884"
                    y2="1.11999"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.0192308" stopColor="#FEBEFA" />
                    <stop offset="0.346154" stopColor="#B339D4" />
                    <stop offset="0.653846" stopColor="#7B21BA" />
                    <stop offset="1" stopColor="#7B26F0" />
                  </linearGradient>
                  <clipPath id="clip1">
                    <rect width="7.02798" height="8.07927" fill="white" transform="translate(0.515625)" />
                  </clipPath>
                </defs>
              </svg>
            </>
          ) : (
            <img src={options.logoUrl} alt={`${coachName}'s logo`}/>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6 z-10 custom-scrollbar">
        <div className="flex flex-col gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-2.5 max-w-full ${
                message.role === 'assistant' ? "items-start" : "items-end ml-auto"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[#C5C5C5] text-xs">
                  {message.role === 'assistant' ? coachName : 'You'}
                </span>
                <div className="w-1 h-1 rounded-full bg-[#D9D9D9]" />
                <span className="text-[#C5C5C5] text-xs">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div
                className={`flex px-5 py-2.5 justify-center items-center rounded-[10px] ${
                  message.role === 'assistant'
                    ? "bg-[#1A1A1A]"
                    : "bg-[rgba(223,105,255,0.08)]"
                }`}
              >
                <p className="text-[#C5C5C5] text-base lg:text-lg whitespace-pre-line">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-1 h-4 ml-1 bg-purple-400 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-center justify-center px-6 lg:px-8 pb-12 z-10">
        <div className="flex w-full min-h-[50px] max-h-16 px-5 py-2.5 justify-between items-center rounded-[10px] border border-[rgba(255,255,255,0.3)] bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5 flex-1">
            <button className="flex p-2.5 items-center justify-center rounded-full bg-[#1B1511]">
              <Paperclip className="w-3.5 h-3.5 text-white/50" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading || !threadID}
              className="flex-1 bg-transparent text-white text-base leading-5 placeholder:text-white/50 outline-none"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !threadID}
            className="flex p-2.5 items-center justify-center rounded-full bg-gradient-to-r from-[#B339D4] via-[#7B21BA] to-[#7B26F0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6 text-[#F9F9F9] fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
