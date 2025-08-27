'use client'

import React, {useEffect, useRef, useState} from 'react';
import {Camera, Headphones, Info, MoreVertical, Phone, Send, Smile, User, Users, Video,} from 'lucide-react';
import {sdkClient} from '@/lib';
import {ConversationResponse, DirectMessageResponse, MessageType} from '@nlc-ai/sdk-messaging';
import {toast} from 'sonner';
import {useAuth} from "@nlc-ai/web-auth";
import {UserType} from "@nlc-ai/sdk-users";

interface ChatWindowProps {
  conversation: ConversationResponse | null;
  onBack?: () => void;
}

interface Participant {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
  isOnline: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBack,
}) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (user?.id) {
      (() => getOtherParticipant())()
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      const response = await sdkClient.messaging.getMessages(conversation.id, {
        page: 1,
        limit: 50,
      });

      // Sort messages chronologically
      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
    } catch (error: any) {
      toast.error('Failed to load messages');
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;

    const tempMessage: DirectMessageResponse = {
      id: `temp-${Date.now()}`,
      conversationID: conversation.id,
      senderID: user?.id || '',
      senderType: user?.type || UserType.coach,
      type: MessageType.TEXT,
      content: inputMessage,
      mediaUrls: [],
      isRead: false,
      isEdited: false,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setInputMessage('');

    try {
      const newMessage = await sdkClient.messaging.sendMessage(conversation.id, {
        type: MessageType.TEXT,
        content: inputMessage.trim(),
      });

      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? newMessage : msg
      ));

      // Simulate response for admin conversations
      if (isAdminConversation()) {
        simulateAdminResponse(inputMessage.trim());
      }
    } catch (error: any) {
      toast.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const simulateAdminResponse = (userInput: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const adminResponse: DirectMessageResponse = {
        id: `admin-${Date.now()}`,
        conversationID: conversation!.id,
        senderID: 'admin-1',
        senderType: 'admin',
        type: MessageType.TEXT,
        content: getAdminResponse(userInput),
        mediaUrls: [],
        isRead: false,
        isEdited: false,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, adminResponse]);
      setIsTyping(false);
    }, 2000);
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

  const isAdminConversation = () => {
    if (!conversation) return false;
    return conversation.participantTypes.includes(UserType.admin);
  };

  const getOtherParticipant = async () => {
    if (!conversation || conversation.type !== 'direct') return null;

    const userID = conversation.participantIDs[0] === user?.id ? conversation.participantIDs[1] : conversation.participantIDs[0];
    const userType = conversation.participantIDs[0] === user?.id ? conversation.participantTypes[1] : conversation.participantTypes[0];

    const participant = await sdkClient.users.profile.lookupProfile(userType, userID);

    // Assuming current user is coach and is first participant
    return setOtherParticipant({
      id: participant.id,
      type: userType,
      name: participant.firstName + ' ' + participant.lastName,
      avatar: participant.avatarUrl || '',
      isOnline: true,
    });
  };

  const isCurrentUserMessage = (message: DirectMessageResponse) => {
    return message.senderID === user?.id;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">💬</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-stone-400">Choose from admin support, clients, or community members</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50 lg:hidden"
            >
              ←
            </button>
          )}
          {otherParticipant && (
            <>
              <div className="relative">
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                />
                {otherParticipant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{otherParticipant.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${otherParticipant.isOnline ? 'text-green-400' : 'text-stone-500'}`}>
                    {otherParticipant.isOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-stone-500">
                    {otherParticipant.type}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isAdminConversation() && (
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            {isAdminConversation() ? (
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
                <p className="text-stone-400 text-sm">Send a message to {otherParticipant?.name}</p>
              </>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isCurrentUserMessage(message) ? 'order-2' : 'order-1'}`}>
                <div className="text-xs text-stone-500 mb-1">
                  {message.senderType === 'admin' ? 'Admin Support' :
                    isCurrentUserMessage(message) ? 'You' : otherParticipant?.name} • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  isCurrentUserMessage(message)
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
        <div className="flex items-center gap-3">
          <button className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700/50">
            <Camera className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isAdminConversation() ? 'Describe your issue or question...' : 'Type your message...'}
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
        {isAdminConversation() && (
          <div className="text-xs text-stone-500 mt-2 text-center">
            Our support team typically responds within a few minutes
          </div>
        )}
      </div>
    </div>
  );
};
