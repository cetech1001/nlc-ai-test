'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sdkClient, ConversationList, ChatWindow, UserSearchModal } from '@/lib';
import { ConversationResponse } from '@nlc-ai/sdk-messaging';
import { MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';

const MessagesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if there's a specific conversation in the URL params
    const conversationID = searchParams.get('conversationID');
    if (conversationID) {
      loadConversation(conversationID);
    } else {
      setIsLoading(false);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);

  const loadConversation = async (conversationID: string) => {
    try {
      setIsLoading(true);
      const conversation = await sdkClient.messaging.getConversation(conversationID);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationSelect = (conversation: ConversationResponse) => {
    setSelectedConversation(conversation);
    router.push(`/messages?conversationID=${conversation.id}`, { scroll: false });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    router.push('/messages', { scroll: false });
  };

  const handleCreateConversation = () => {
    setShowUserSearch(true);
  };

  const handleUserSelected = async (userID: string, userType: 'coach' | 'client') => {
    try {
      setShowUserSearch(false);

      // Create a direct conversation with the selected user
      const conversation = await sdkClient.messaging.createConversation({
        type: 'direct',
        participantIDs: [userID],
        participantTypes: [userType],
      });

      setSelectedConversation(conversation);
      router.push(`/messages?conversationID=${conversation.id}`, { scroll: false });
      toast.success(`Started conversation with ${userType}`);
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Admin Messages</h1>
            <p className="text-stone-400">Communicate with coaches and clients</p>
          </div>
        </div>

        <button
          onClick={handleCreateConversation}
          className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-12rem)] bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-purple-200 via-purple-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10 flex w-full">
          {/* Mobile: Show either conversation list OR messaging window */}
          {isMobileView ? (
            <>
              {!selectedConversation ? (
                <ConversationList
                  selectedConversationID={""}
                  onConversationSelectAction={handleConversationSelect}
                  onNewConversation={handleCreateConversation}
                />
              ) : (
                <ChatWindow
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                />
              )}
            </>
          ) : (
            /* Desktop: Show both conversation list and messaging window */
            <>
              <ConversationList
                selectedConversationID={selectedConversation?.id}
                onConversationSelectAction={handleConversationSelect}
                onNewConversation={handleCreateConversation}
              />
              <ChatWindow
                conversation={selectedConversation}
              />
            </>
          )}
        </div>
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelected={handleUserSelected}
      />
    </div>
  );
};

export default MessagesPage;
