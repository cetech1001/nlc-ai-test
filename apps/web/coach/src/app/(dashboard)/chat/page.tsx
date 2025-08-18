'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Search,
  MoreVertical,
  Camera,
  Smile,
  Phone,
  Video,
  Info
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasImage?: boolean;
  imageUrl?: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount?: number;
  type: 'ai' | 'client' | 'community';
}

const ChatPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chat contacts
  const contacts: ChatContact[] = [
    {
      id: 'ai-assistant',
      name: 'Next Level Coach AI',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Hi, how may I help?',
      timestamp: '12:10 PM',
      isOnline: true,
      type: 'ai'
    },
    {
      id: 'client-1',
      name: 'Eleanor Pena',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Thanks. I got it from flutterstock.',
      timestamp: '12:10 PM',
      isOnline: true,
      unreadCount: 2,
      type: 'client'
    },
    {
      id: 'client-2',
      name: 'Brooklyn Simmons',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Let me know if you need any help today!',
      timestamp: '12:10 PM',
      isOnline: false,
      type: 'client'
    },
    {
      id: 'community-1',
      name: 'Floyd Miles',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Great workout tips!',
      timestamp: '11:45 AM',
      isOnline: true,
      type: 'community'
    },
    {
      id: 'community-2',
      name: 'Jane Cooper',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'The mind is like water...',
      timestamp: '11:30 AM',
      isOnline: true,
      unreadCount: 1,
      type: 'community'
    }
  ];

  // Mock messages for different chats
  const mockMessages: Record<string, Message[]> = {
    'ai-assistant': [
      {
        id: '1',
        content: 'Hi, how may I help?',
        isUser: false,
        timestamp: new Date('2024-01-20T12:10:00')
      },
      {
        id: '2',
        content: 'I\'m curious to know what features your platform offers for coaches.',
        isUser: true,
        timestamp: new Date('2024-01-20T12:11:00')
      },
      {
        id: '3',
        content: 'Great question! 🚀 Next Level Coach AI helps coaches like you automate key tasks like:\n\n• Email responses and follow-ups\n• Personalized client check-ins\n• AI-driven content suggestions\n• Real-time engagement analytics\n\nWould you like to learn more about any of these features?',
        isUser: false,
        timestamp: new Date('2024-01-20T12:11:30')
      },
      {
        id: '4',
        content: 'That sounds amazing! How do I get started?',
        isUser: true,
        timestamp: new Date('2024-01-20T12:12:00')
      }
    ],
    'client-1': [
      {
        id: '1',
        content: 'Hi, How are you doing?',
        isUser: false,
        timestamp: new Date('2024-01-20T12:10:00')
      },
      {
        id: '2',
        content: 'I saw your post about fitness mindset and was really impressed by it.',
        isUser: false,
        timestamp: new Date('2024-01-20T12:10:30')
      },
      {
        id: '3',
        content: 'Hi, I\'m fine. How are you?',
        isUser: true,
        timestamp: new Date('2024-01-20T12:11:00')
      },
      {
        id: '4',
        content: 'Thanks, That\'s very nice of you.',
        isUser: true,
        timestamp: new Date('2024-01-20T12:11:15')
      },
      {
        id: '5',
        content: 'Where did you get this image.\n\nIt\'s really encompasses the context of the post.',
        isUser: false,
        timestamp: new Date('2024-01-20T12:11:45'),
        hasImage: true,
        imageUrl: '/api/placeholder/200/150'
      },
      {
        id: '6',
        content: 'Thanks. I got it from flutterstock.',
        isUser: true,
        timestamp: new Date('2024-01-20T12:12:00')
      }
    ],
    'client-2': [
      {
        id: '1',
        content: 'Hey welcome back! How\'s everything going with your program? Let me know if you need any help today!',
        isUser: false,
        timestamp: new Date('2024-01-20T12:10:00')
      },
      {
        id: '2',
        content: 'Hey! I\'m doing okay, but I feel like I\'m struggling with my workouts this week. Not sure if I\'m doing the exercises right.',
        isUser: true,
        timestamp: new Date('2024-01-20T12:12:00')
      },
      {
        id: '3',
        content: 'I totally get it, it\'s normal to hit some bumps along the way. Let\'s do a quick check-in. Are you following the correct form for your exercises? Sometimes the smallest adjustments can make a big difference!',
        isUser: false,
        timestamp: new Date('2024-01-20T12:15:00')
      }
    ]
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if there's a specific user in the URL params
    const userId = searchParams.get('user');
    if (userId) {
      const contact = contacts.find(c => c.id === userId || c.id === `client-${userId}` || c.id === `community-${userId}`);
      if (contact) {
        setSelectedChat(contact);
        setMessages(mockMessages[contact.id] || []);
      }
    } else {
      // Default to AI assistant
      const aiContact = contacts.find(c => c.type === 'ai');
      if (aiContact) {
        setSelectedChat(aiContact);
        setMessages(mockMessages[aiContact.id] || []);
      }
    }
  }, [searchParams]);

  const handleChatSelect = (contact: ChatContact) => {
    setSelectedChat(contact);
    setMessages(mockMessages[contact.id] || []);
    router.push(`/chat?user=${contact.id}`, { scroll: false });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // If it's AI chat, simulate AI response
    if (selectedChat.type === 'ai') {
      setIsTyping(true);
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
    }
  };

  const getAIResponse = (userInput: string): string => {
    const responses = [
      "I'd be happy to help you with that! Let me walk you through the next steps to get you started with our platform.",
      "That's a great question! Based on your coaching style, I'd recommend focusing on our automated email sequences first.",
      "Absolutely! I can help you set up personalized client check-ins that will save you hours each week.",
      "Perfect! Let me show you how our content suggestion feature can help you create engaging posts for your audience.",
      "I understand exactly what you're looking for. Our analytics dashboard will give you insights into client engagement patterns."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getContactTypeIcon = (type: ChatContact['type']) => {
    switch (type) {
      case 'ai':
        return (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full border-2 border-black flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        );
      case 'client':
        return (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black"></div>
        );
      case 'community':
        return (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
        );
    }
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <div className="flex h-[calc(100vh-8rem)] bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden">

        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-neutral-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-700">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-white text-xl font-semibold">Messages</h1>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => handleChatSelect(contact)}
                className={`flex items-center gap-3 p-4 border-b border-neutral-700/50 hover:bg-neutral-800/30 transition-colors cursor-pointer ${
                  selectedChat?.id === contact.id ? 'bg-neutral-800/50' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-600"
                  />
                  {contact.isOnline && getContactTypeIcon(contact.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-sm font-medium truncate">{contact.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 text-xs">{contact.timestamp}</span>
                      {contact.unreadCount && (
                        <div className="w-5 h-5 bg-fuchsia-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{contact.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-stone-400 text-sm truncate mt-1">{contact.lastMessage}</p>
                  {contact.type !== 'ai' && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        contact.type === 'client' ? 'bg-blue-400' : 'bg-green-400'
                      }`}></div>
                      <span className="text-xs text-stone-500 capitalize">{contact.type}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                    />
                    {selectedChat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedChat.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${selectedChat.isOnline ? 'text-green-400' : 'text-stone-500'}`}>
                        {selectedChat.isOnline ? 'Online' : 'Offline'}
                      </span>
                      {selectedChat.type !== 'ai' && (
                        <>
                          <span className="text-stone-500">•</span>
                          <span className="text-xs text-stone-500 capitalize">{selectedChat.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChat.type !== 'ai' && (
                    <>
                      <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                        <Video className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                    <Info className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                      <div className="text-xs text-stone-500 mb-1 text-right">
                        {selectedChat.name} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        message.isUser
                          ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-br-md'
                          : 'bg-neutral-700/80 text-white rounded-bl-md'
                      }`}>
                        {message.hasImage && message.imageUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden">
                            <img
                              src={message.imageUrl}
                              alt="Shared"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <div className="whitespace-pre-line">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-700/80 text-white p-3 rounded-2xl rounded-bl-md">
                      <div className="text-xs text-stone-400 mb-1">{selectedChat.name} is typing...</div>
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
              <div className="p-6 border-t border-neutral-700">
                <div className="flex items-end gap-3">
                  <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                    <Camera className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 resize-none max-h-32"
                      rows={1}
                    />
                  </div>
                  <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">💬</span>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-stone-400">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
