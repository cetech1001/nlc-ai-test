'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConversationList, ChatWindow, sdkClient } from '@/lib';
import { ConversationResponse } from '@nlc-ai/sdk-messaging';

const MessagesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

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
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10 flex w-full">
          {/* Mobile: Show either conversation list OR chat window */}
          {isMobileView ? (
            <>
              {!selectedConversation ? (
                <ConversationList
                  selectedConversationID={""}
                  onConversationSelectAction={handleConversationSelect}
                  onBackClick={() => router.back()}
                />
              ) : (
                <ChatWindow
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                />
              )}
            </>
          ) : (
            /* Desktop: Show both conversation list and chat window */
            <>
              <ConversationList
                selectedConversationID={selectedConversation?.id}
                onConversationSelectAction={handleConversationSelect}
                onBackClick={() => router.back()}
              />
              <ChatWindow
                conversation={selectedConversation}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
