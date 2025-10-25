'use client'

import {useState, useEffect, FC} from 'react';
import { ConversationList, ChatWindow } from './partials';
import { ConversationResponse } from '@nlc-ai/sdk-messages';
import {UserProfile} from "@nlc-ai/types";
import {NLCClient} from "@nlc-ai/sdk-main";

interface IProps {
  conversationID: string;
  sdkClient: NLCClient;
  user?: UserProfile | null;
  goToConversation: (conversationID: string) => void;
  goToMessages: () => void;
  goBack: () => void;
}

export const MessagesPage: FC<IProps> = (props) => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (props.conversationID) {
      loadConversation(props.conversationID);
    } else {
      setIsLoading(false);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [props.conversationID]);

  const loadConversation = async (conversationID: string) => {
    try {
      setIsLoading(true);
      const conversation = await props.sdkClient.messages.getConversation(conversationID);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationSelect = (conversation: ConversationResponse) => {
    setSelectedConversation(conversation);
    props.goToConversation(conversation.id);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    props.goToMessages();
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <div className="flex min-h-[85vh] bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10 flex w-full">
          {isMobileView ? (
            <>
              {!selectedConversation ? (
                <ConversationList
                  sdkClient={props.sdkClient}
                  user={props.user}
                  selectedConversationID=""
                  onConversationSelectAction={handleConversationSelect}
                  onBackClick={props.goBack}
                />
              ) : (
                <ChatWindow
                  isConvoLoading={isLoading}
                  sdkClient={props.sdkClient}
                  user={props.user}
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                />
              )}
            </>
          ) : (
            <>
              <ConversationList
                sdkClient={props.sdkClient}
                user={props.user}
                selectedConversationID={selectedConversation?.id}
                onConversationSelectAction={handleConversationSelect}
                onBackClick={props.goBack}
              />
              <ChatWindow
                isConvoLoading={isLoading}
                sdkClient={props.sdkClient}
                user={props.user}
                conversation={selectedConversation}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
