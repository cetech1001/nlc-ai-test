'use client'

import React from "react";
import {StandaloneChat} from "@nlc-ai/web-shared";
import {useParams} from "next/navigation";

const ChatPage = () => {
  const params = useParams();

  return <StandaloneChat coachID={params.coachID as string} />;
}

export default ChatPage;
