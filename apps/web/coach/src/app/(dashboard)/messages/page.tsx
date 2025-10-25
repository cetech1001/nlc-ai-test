'use client'

import {useRouter, useSearchParams} from 'next/navigation';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useAuth } from "@nlc-ai/web-auth";
import {MessagesPage} from "@nlc-ai/web-shared";
import {sdkClient} from "@/lib";

const CoachMessagesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const goToConversation = (conversationID: string) => {
    router.push(`/messages?conversationID=${conversationID}`, { scroll: false });
  };

  const goToMessages = () => {
    router.push('/messages', { scroll: false });
  };

  const goBack = () => {
    router.back();
  }

  return (
    <MessagesPage
      user={user}
      goToConversation={goToConversation}
      goToMessages={goToMessages}
      conversationID={searchParams.get('conversationID') as string}
      sdkClient={sdkClient}
      goBack={goBack}
    />
  );
};

export default CoachMessagesPage;
