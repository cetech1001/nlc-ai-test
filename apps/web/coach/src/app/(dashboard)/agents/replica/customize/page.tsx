'use client'

import { ChatbotCustomizationPage } from '@nlc-ai/web-shared';
import { sdkClient } from '@/lib';
import {useAuth} from "@nlc-ai/web-auth";

const CustomizePage = () => {
  const { user } = useAuth();

  return <ChatbotCustomizationPage sdkClient={sdkClient} coachID={user?.id || ''} />;
}

export default CustomizePage;
