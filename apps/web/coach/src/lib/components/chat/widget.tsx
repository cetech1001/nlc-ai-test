'use client'

import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatPopupWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ChatPopupWidget: React.FC<ChatPopupWidgetProps> = ({
                                                                  isOpen: controlledIsOpen,
                                                                  onToggle
                                                                }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi, how may I help?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const responses = [
      "Great question! 🚀 Next Level Coach AI helps coaches like you automate key tasks like:\n\n• Email responses and follow-ups\n• Personalized client check-ins\n• AI-driven content suggestions\n• Real-time engagement analytics\n\nWould you like to learn more about any of these features?",
      "I'd be happy to help you with that! As your AI assistant, I can support you in growing your coaching business through intelligent automation.",
      "That sounds amazing! How do I get started?",
      "I understand you're looking to optimize your coaching workflow. Let me suggest some strategies that could help you achieve better results.",
      "Absolutely! I'm here to support your coaching journey. What specific challenge are you facing right now?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggle}
          className="w-14 h-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`w-96 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[32rem]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Next Level Coach AI</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-stone-400 text-xs">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggle}
              className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto h-80">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      message.isUser
                        ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-br-md'
                        : 'bg-neutral-700/80 text-white rounded-bl-md'
                    }`}>
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                    <div className={`text-xs text-stone-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-700/80 text-white p-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-neutral-700">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 resize-none max-h-20"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-stone-500 mt-2 text-center">
                Powered by Next Level Coach AI
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
