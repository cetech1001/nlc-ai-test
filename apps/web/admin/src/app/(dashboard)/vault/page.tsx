'use client'

import React from "react";
import { useRouter } from "next/navigation";
import {sdkClient} from "@/lib";
import { useAuth } from "@nlc-ai/web-auth";
import {VaultPage} from "@nlc-ai/web-shared";

const CoachVault = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleMessages = (conversationID: string) => {
    router.push(`/messages?conversationID=${conversationID}`);
  }

  return (
    <VaultPage user={user} sdkClient={sdkClient} handleMessages={handleMessages}/>
  );
};

export default CoachVault;
