'use client'

import React from "react";
import { useRouter } from "next/navigation";
import {sdkClient} from "@/lib";
import { useAuth } from "@nlc-ai/web-auth";
import {VaultPage} from "@nlc-ai/web-shared";

const AdminVault = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleMessages = (conversationID: string) => {
    router.push(`/messages?conversationID=${conversationID}`);
  }

  const handleNavigateToPost = (postID: string) => {
    router.push(`/community/ai-vault/post/${postID}`);
  }

  return (
    <VaultPage
      user={user}
      sdkClient={sdkClient}
      handleMessages={handleMessages}
      onNavigateToPost={handleNavigateToPost}
    />
  );
};

export default AdminVault;
