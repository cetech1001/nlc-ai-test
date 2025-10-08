'use client'

import React from "react";
import {StandaloneChat} from "@nlc-ai/web-shared";
import {useParams} from "next/navigation";
import {sdkClient} from "@/lib";

const ChatPage = () => {
  const params = useParams();
  const coachID = params.coachID as string;
  const publicChatClient = sdkClient.agents.createPublicChatClient(coachID);

  return <StandaloneChat publicChatClient={publicChatClient} coachID={coachID} />;
}

export default ChatPage;
