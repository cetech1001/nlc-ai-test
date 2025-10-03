'use client'

import {SinglePostViewPage} from "@nlc-ai/web-shared";
import {sdkClient} from "@/lib";
import {useAuth} from "@nlc-ai/web-auth";
import {UserType} from "@nlc-ai/types";
import {useParams, useRouter} from "next/navigation";

const Post = () => {
  const router = useRouter();
  const { user } = useAuth(UserType.ADMIN);

  const params = useParams();
  const postID = params.postID as string;
  const slug = params.slug as string;

  const handleMessages = (conversationID: string) => {
    router.push(`/messages?conversationID=${conversationID}`);
  }

  const goBack = () => {
    if (slug === 'ai-vault') {
      router.push('/vault');
    } else {
      router.push(`/community`);
    }
  }

  return (
    <SinglePostViewPage
      sdkClient={sdkClient}
      user={user}
      communitySlug={slug}
      postID={postID}
      handleMessages={handleMessages}
      onBack={goBack}
    />
  )
}

export default Post;
