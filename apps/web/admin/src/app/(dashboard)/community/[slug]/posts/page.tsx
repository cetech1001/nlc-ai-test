'use client'

import {useState, useEffect} from "react";
import { AlertBanner } from '@nlc-ai/web-ui';
import {CommunityResponse} from "@nlc-ai/types";
import {useParams, useRouter} from "next/navigation";
import {BackTo, CommunityPage} from "@nlc-ai/web-shared";
import {sdkClient} from "@/lib";
// eslint-disable-next-line @nx/enforce-module-boundaries
import {useAuth} from "@nlc-ai/web-auth";

const AdminCommunityPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [community, setCommunity] = useState<CommunityResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const router = useRouter();
  const { user } = useAuth();

  const handleMessages = (conversationID: string) => {
    router.push(`/messages?conversationID=${conversationID}`);
  }

  const handleNavigateToPost = (postID: string) => {
    router.push(`/community/ai-vault/post/${postID}`);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const communityData = await sdkClient.communities.getCommunityBySlug(slug);
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

      <BackTo onClick={() => {
        router.push(`/communities/${community?.id}`);
      }} title={'Back to Community Details'}/>

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

export default AdminCommunityPage;
