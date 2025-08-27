import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2, Headphones, User } from 'lucide-react';
import { sdkClient } from '@/lib';
import { DirectMessageResponse, ConversationResponse, MessageType } from '../../../../../../../libs/sdk/messaging';

interface ChatPopupWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
  userID: string;
}

export const ChatPopupWidget: React.FC<ChatPopupWidgetProps> = ({
                                                                  isOpen: controlledIsOpen,
                                                                  onToggle,
                                                                  userID
                                                                }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeSupportConversation();
    }
  }, [isOpen]);

  const initializeSupportConversation = async () => {
    setIsLoading(true);
    try {
      const conv = await sdkClient.messaging.createSupportConversation();
      setConversation(conv);

      if (conv.id) {
        await loadMessages(conv.id);
      }
    } catch (error) {
      console.error('Failed to initialize support conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationID: string) => {
    try {
      const response = await sdkClient.messaging.getMessages(conversationID, {
        limit: 50,
        page: 1
      });
      setMessages(response.data.reverse()); // Reverse to show chronological order
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;

    const tempMessage: DirectMessageResponse = {
      id: `temp-${Date.now()}`,
      conversationID: conversation.id,
      senderID: userID,
      senderType: 'coach',
      type: MessageType.TEXT,
      content: inputMessage,
      mediaUrls: [],
      isRead: false,
      isEdited: false,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const newMessage = await sdkClient.messaging.sendMessage(conversation.id, {
        type: MessageType.TEXT,
        content: inputMessage.trim(),
      });

      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? newMessage : msg
      ));

      // Simulate admin response (in real app, this would come from WebSocket/SSE)
      setTimeout(() => {
        const adminResponse: DirectMessageResponse = {
          id: `admin-${Date.now()}`,
          conversationID: conversation.id,
          senderID: 'admin-1',
          senderType: 'admin',
          type: MessageType.TEXT,
          content: getAdminResponse(inputMessage.trim()),
          mediaUrls: [],
          isRead: false,
          isEdited: false,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, adminResponse]);
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setIsTyping(false);
    }
  };

  const getAdminResponse = (userInput: string): string => {
    const responses = [
      "Thanks for reaching out! I'm here to help you with any questions about Next Level Coach AI. What specific area can I assist you with?",
      "I understand your concern. Let me look into this for you and provide you with the best solution.",
      "That's a great question! Here's what I can tell you about that feature...",
      "I'd be happy to help you resolve this issue. Can you provide me with a bit more detail about what you're experiencing?",
      "Thank you for the feedback! We're always working to improve the platform. I'll make sure this gets to our development team."
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
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-neutral-700 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Admin Support</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-stone-400 text-xs">Available 24/7</span>
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
            <div className="relative z-10 flex-1 p-4 space-y-4 overflow-y-auto h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Welcome to Admin Support!</h4>
                  <p className="text-stone-400 text-sm">How can we help you today?</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderType === 'coach' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${message.senderType === 'coach' ? 'order-2' : 'order-1'}`}>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        message.senderType === 'coach'
                          ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-br-md'
                          : 'bg-neutral-700/80 text-white rounded-bl-md'
                      }`}>
                        {message.senderType === 'admin' && (
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3" />
                            <span className="text-xs opacity-75">Admin Support</span>
                          </div>
                        )}
                        <div className="whitespace-pre-line">{message.content}</div>
                        {message.isEdited && (
                          <div className="text-xs opacity-60 mt-1">(edited)</div>
                        )}
                      </div>
                      <div className={`text-xs text-stone-500 mt-1 ${message.senderType === 'coach' ? 'text-right' : 'text-left'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-700/80 text-white p-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs opacity-75">Admin Support</span>
                    </div>
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
            <div className="relative z-10 p-4 border-t border-neutral-700">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 resize-none max-h-20 disabled:opacity-50"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-stone-500 mt-2 text-center">
                Powered by Next Level Coach AI Support
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
