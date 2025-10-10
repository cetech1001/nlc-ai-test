'use client'

import React from "react";
import {StandaloneChatPage} from "@nlc-ai/web-shared";
import {useParams} from "next/navigation";
import {sdkClient} from "@/lib";

const ChatPage = () => {
  const params = useParams();
  const coachID = params.coachID as string;
  const publicChatClient = sdkClient.agents.createPublicChatClient(coachID);
  const customizationClient = sdkClient.users.chatbotCustomization;

  return (
    <StandaloneChatPage
      publicChatClient={publicChatClient}
      customizationClient={customizationClient}
      coachID={coachID}
    />
  );
}

export default ChatPage;
