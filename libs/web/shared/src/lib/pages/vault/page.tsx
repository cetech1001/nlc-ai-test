'use client'

import {useState, useEffect, FC} from "react";
import { AlertBanner } from '@nlc-ai/web-ui';
import {CommunityResponse, UserProfile} from "@nlc-ai/types";
import {CommunityPage} from "../community/page";
import {NLCClient} from "@nlc-ai/sdk-main";

interface IProps {
  user: UserProfile | null;
  sdkClient: NLCClient;
  handleMessages: (conversationID: string) => void;
}

export const VaultPage: FC<IProps> = ({ sdkClient, handleMessages, user }) => {
  const [community, setCommunity] = useState<CommunityResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const communityData = await sdkClient.communities.getCommunityBySlug('ai-vault');
      setCommunity(communityData);
    } catch (error: any) {
      setError(error.message || "Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="py-2 sm:py-4 lg:py-6 max-w-full overflow-hidden">
      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
      )}

      {error && (
        <AlertBanner type="error" message={error} onDismiss={clearMessages} />
      )}

      <CommunityPage
        user={user}
        sdkClient={sdkClient}
        isLoading={isLoading}
        community={community}
        handleMessages={handleMessages}
      />
    </div>
  );
};

export default VaultPage;
