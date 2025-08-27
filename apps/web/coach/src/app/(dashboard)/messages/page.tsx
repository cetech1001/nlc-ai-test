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
  Info,
  Headphones,
  User,
  Users
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderID: string;
  senderType: 'admin' | 'coach' | 'client';
  isRead: boolean;
  createdAt: Date;
  isEdited?: boolean;
  editedAt?: Date;
  fileUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participantIDs: string[];
  participantTypes: ('admin' | 'coach' | 'client')[];
  lastMessageAt?: Date;
  unreadCount: number;
  messages?: Message[];
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount?: number;
  type: 'admin' | 'client' | 'community';
  conversation?: Conversation;
}

const ChatPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual API calls
  const contacts: ChatContact[] = [
    {
      id: 'admin-support',
      name: 'Admin Support',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'How can we help you today?',
      timestamp: '12:10 PM',
      isOnline: true,
      type: 'admin'
    },
    {
      id: 'client-1',
      name: 'Eleanor Pena',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Thanks for the workout tips!',
      timestamp: '11:45 AM',
      isOnline: true,
      unreadCount: 2,
      type: 'client'
    },
    {
      id: 'client-2',
      name: 'Brooklyn Simmons',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'See you tomorrow for the session.',
      timestamp: '11:30 AM',
      isOnline: false,
      type: 'client'
    },
    {
      id: 'community-1',
      name: 'Floyd Miles',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Great insights on nutrition!',
      timestamp: '10:15 AM',
      isOnline: true,
      type: 'community'
    },
    {
      id: 'community-2',
      name: 'Jane Cooper',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Looking forward to the masterclass.',
      timestamp: '9:45 AM',
      isOnline: true,
      unreadCount: 1,
      type: 'community'
    }
  ];

  // Mock messages for different chats
  const mockMessages: Record<string, Message[]> = {
    'admin-support': [
      {
        id: '1',
        content: 'Hello! Welcome to Next Level Coach AI Support. How can we help you today?',
        senderID: 'admin-1',
        senderType: 'admin',
        isRead: true,
        createdAt: new Date('2024-01-20T12:10:00')
      },
      {
        id: '2',
        content: 'Hi! I\'m having trouble with the email automation feature. It doesn\'t seem to be sending scheduled emails.',
        senderID: 'coach-1',
        senderType: 'coach',
        isRead: true,
        createdAt: new Date('2024-01-20T12:11:00')
      },
      {
        id: '3',
        content: 'I understand your concern with the email automation. Let me check your account settings and help you resolve this issue. Can you tell me which specific email sequence isn\'t working?',
        senderID: 'admin-1',
        senderType: 'admin',
        isRead: true,
        createdAt: new Date('2024-01-20T12:12:00')
      }
    ],
    'client-1': [
      {
        id: '1',
        content: 'Hi Coach! How are you doing today?',
        senderID: 'client-1',
        senderType: 'client',
        isRead: true,
        createdAt: new Date('2024-01-20T11:40:00')
      },
      {
        id: '2',
        content: 'I\'m doing well! How did your workout go this morning?',
        senderID: 'coach-1',
        senderType: 'coach',
        isRead: true,
        createdAt: new Date('2024-01-20T11:42:00')
      },
      {
        id: '3',
        content: 'It went great! Those new exercises you recommended really helped with my form. Thanks for the workout tips!',
        senderID: 'client-1',
        senderType: 'client',
        isRead: false,
        createdAt: new Date('2024-01-20T11:45:00')
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
    // Check if there's a specific conversation in the URL params
    const conversationID = searchParams.get('conversationID');
    if (conversationID) {
      const contact = contacts.find(c => c.id === conversationID);
      if (contact) {
        setSelectedChat(contact);
        setMessages(mockMessages[contact.id] || []);
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleChatSelect = (contact: ChatContact) => {
    setSelectedChat(contact);
    setMessages(mockMessages[contact.id] || []);
    router.push(`/messages?conversationID=${contact.id}`, { scroll: false });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      senderID: 'coach-1',
      senderType: 'coach',
      isRead: false,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate response based on messaging type
    if (selectedChat.type === 'admin') {
      setIsTyping(true);
      setTimeout(() => {
        const adminResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: getAdminResponse(inputMessage),
          senderID: 'admin-1',
          senderType: 'admin',
          isRead: false,
          createdAt: new Date()
        };
        setMessages(prev => [...prev, adminResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const getAdminResponse = (userInput: string): string => {
    const responses = [
      "Thank you for reaching out! I'm reviewing your account now and will provide you with a solution shortly.",
      "I understand the issue you're facing. Let me walk you through the steps to resolve this.",
      "That's a great question! Here's what you need to know about that feature...",
      "I've identified the problem and here's how we can fix it together.",
      "Your feedback is valuable! I'll make sure our development team reviews this for future improvements."
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
      case 'admin':
        return (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full border-2 border-black flex items-center justify-center">
            <Headphones className="w-2 h-2 text-white" />
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

  const getContactTypeLabel = (type: ChatContact['type']) => {
    switch (type) {
      case 'admin': return 'Support';
      case 'client': return 'Client';
      case 'community': return 'Community';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
        </div>
      </div>
    );
  }

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
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      contact.type === 'admin' ? 'bg-fuchsia-400' :
                        contact.type === 'client' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <span className="text-xs text-stone-500">{getContactTypeLabel(contact.type)}</span>
                  </div>
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
                      <span className="text-stone-500">•</span>
                      <span className="text-xs text-stone-500">{getContactTypeLabel(selectedChat.type)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChat.type !== 'admin' && (
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
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    {selectedChat.type === 'admin' ? (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Headphones className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-white font-medium mb-2">Admin Support</h4>
                        <p className="text-stone-400 text-sm">Get help with your account, features, or technical issues.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-white font-medium mb-2">Start Conversation</h4>
                        <p className="text-stone-400 text-sm">Send a message to {selectedChat.name}</p>
                      </>
                    )}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.senderType === 'coach' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.senderType === 'coach' ? 'order-2' : 'order-1'}`}>
                        <div className="text-xs text-stone-500 mb-1">
                          {message.senderType === 'admin' ? 'Admin Support' :
                            message.senderType === 'coach' ? 'You' : selectedChat.name} • {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          message.senderType === 'coach'
                            ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-br-md'
                            : message.senderType === 'admin'
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-bl-md'
                              : 'bg-neutral-700/80 text-white rounded-bl-md'
                        }`}>
                          {message.senderType === 'admin' && (
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                              <User className="w-3 h-3" />
                              <span className="text-xs font-medium">Support Team</span>
                            </div>
                          )}
                          <div className="whitespace-pre-line">{message.content}</div>
                          {message.isEdited && (
                            <div className="text-xs opacity-60 mt-1">(edited)</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2 mb-2 opacity-90">
                        <User className="w-3 h-3" />
                        <span className="text-xs font-medium">Admin Support</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                      placeholder={selectedChat.type === 'admin' ? 'Describe your issue or question...' : 'Type your message...'}
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
                {selectedChat.type === 'admin' && (
                  <div className="text-xs text-stone-500 mt-2 text-center">
                    Our support team typically responds within a few minutes
                  </div>
                )}
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
                <p className="text-stone-400">Choose from admin support, clients, or community members</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
