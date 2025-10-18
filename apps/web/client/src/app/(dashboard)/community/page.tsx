'use client'

import {useState, useEffect, FC} from "react";
import { AlertBanner } from '@nlc-ai/web-ui';
import {CommunityResponse, UserProfile} from "@nlc-ai/types";
import {CommunityPage} from "@nlc-ai/web-shared";
import {NLCClient} from "@nlc-ai/sdk-main";
import {sdkClient, useCommunityStore} from "@/lib";
import {useAuth} from "@nlc-ai/web-auth";
import {useRouter} from "next/navigation";

interface IProps {
  user: UserProfile | null;
  sdkClient: NLCClient;
  handleMessages: (conversationID: string) => void;
  onNavigateToPost: (postID: string) => void;
}

export const ClientCommunityPage: FC<IProps> = () => {
  const { user } = useAuth();
  const router = useRouter();

  const selectedCommunityID = useCommunityStore(state => state.selectedCommunityID);
  const [community, setCommunity] = useState<CommunityResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (selectedCommunityID) {
      loadInitialData(selectedCommunityID);
    }
  }, [selectedCommunityID]);

  const loadInitialData = async (selectedCommunityID: string) => {
    try {
      setIsLoading(true);
      setError("");

      const communityData = await sdkClient.communities.getCommunity(selectedCommunityID);
      setCommunity(communityData);
    } catch (error: any) {
      setError(error.message || "Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessages = (conversationID: string) => {
    router.push(`/messages?conversationID=${conversationID}`);
  }

  const handleNavigateToPost = (postID: string) => {
    router.push(`/community/ai-vault/post/${postID}`);
  }

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
        onNavigateToPost={handleNavigateToPost}
      />
    </div>
  );
};

export default ClientCommunityPage;
