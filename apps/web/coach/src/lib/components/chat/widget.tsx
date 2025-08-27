// apps/web/coach/src/lib/components/chat/widget.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2, Headphones, User } from 'lucide-react';
import { sdkClient } from '@/lib';
import { DirectMessageResponse, ConversationResponse, MessageType } from '@nlc-ai/sdk-messaging';
import { toast } from 'sonner';

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
    } catch (error: any) {
      console.error('Failed to initialize support conversation:', error);
      toast.error('Failed to connect to support');
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

      // Sort messages chronologically
      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load message history');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;

    // Create optimistic message
    const tempMessage: DirectMessageResponse = {
      id: `temp-${Date.now()}`,
      conversationID: conversation.id,
      senderID: userID,
      senderType: 'coach',
      type: MessageType.TEXT,
      content: inputMessage.trim(),
      mediaUrls: [],
      isRead: false,
      isEdited: false,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageContent = inputMessage.trim();
    setInputMessage('');

    try {
      const newMessage = await sdkClient.messaging.sendMessage(conversation.id, {
        type: MessageType.TEXT,
        content: messageContent,
      });

      // Replace temp message with real message
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? newMessage : msg
      ));

      // Simulate admin response (in real app, this would come from WebSocket/SSE)
      simulateAdminResponse(messageContent);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const simulateAdminResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const adminResponse: DirectMessageResponse = {
        id: `admin-${Date.now()}`,
        conversationID: conversation!.id,
        senderID: 'admin-support',
        senderType: 'admin',
        type: MessageType.TEXT,
        content: getAdminResponse(userMessage),
        mediaUrls: [],
        isRead: false,
        isEdited: false,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, adminResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const getAdminResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Simple keyword-based responses
    if (lowerInput.includes('email') || lowerInput.includes('automation')) {
      return "I can help you with email automation issues. Let me check your email settings and sequences. Can you tell me which specific email isn't being sent?";
    }

    if (lowerInput.includes('client') || lowerInput.includes('student')) {
      return "I see you're having issues with client management. Are you looking to add new clients, manage existing ones, or having trouble with client communications?";
    }

    if (lowerInput.includes('payment') || lowerInput.includes('billing')) {
      return "For payment and billing issues, I'll need to verify your account details. Are you experiencing issues with processing payments or with your subscription?";
    }

    if (lowerInput.includes('course') || lowerInput.includes('content')) {
      return "I can assist with course creation and content management. Are you trying to upload new content, organize existing materials, or having technical difficulties?";
    }

    // Generic responses for other cases
    const responses = [
      "Thank you for reaching out! I'm here to help you with any questions about Next Level Coach AI. What specific area can I assist you with?",
      "I understand your concern. Let me look into this for you and provide you with the best solution. Can you provide me with more details?",
      "That's a great question! I'd be happy to walk you through this feature. Let me gather some information to give you the most accurate guidance.",
      "I can definitely help you resolve this issue. To provide you with the best assistance, could you share more context about what you're experiencing?",
      "Thanks for the feedback! I'm making note of this for our development team. In the meantime, let me see what alternatives or workarounds I can offer you."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggle}
          className="w-14 h-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"
               title="Support available"></div>
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
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-neutral-700 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Admin Support</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-stone-400 text-xs">Available 24/7</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
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
            <div className="relative z-10 flex-1 p-4 space-y-4 overflow-y-auto h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
                  <span className="ml-2 text-stone-400 text-sm">Connecting to support...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Welcome to Admin Support!</h4>
                  <p className="text-stone-400 text-sm">How can we help you today? Ask about features, billing, technical issues, or anything else.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isUserMessage = message.senderType === 'coach';
                  return (
                    <div key={message.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${isUserMessage ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          isUserMessage
                            ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-br-md'
                            : 'bg-neutral-700/80 text-white rounded-bl-md'
                        }`}>
                          {!isUserMessage && (
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
                        <div className={`text-xs text-stone-500 mt-1 ${isUserMessage ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
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
            <div className="relative z-10 p-4 border-t border-neutral-700 rounded-b-2xl">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe your question or issue..."
                    disabled={isLoading}
                    className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 resize-none max-h-20 disabled:opacity-50"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-stone-500 mt-2 text-center">
                Powered by Next Level Coach AI • Typically responds in minutes
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
