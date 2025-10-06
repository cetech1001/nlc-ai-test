'use client'

import { useState, useEffect, FC } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PostResponse, ReactionType } from "@nlc-ai/sdk-communities";
import {CommunityMember, UserProfile} from "@nlc-ai/types";
import { NLCClient } from "@nlc-ai/sdk-main";
import { SinglePost } from "../community/partials";
import { Button } from "@nlc-ai/web-ui";

interface IProps {
  sdkClient: NLCClient;
  user: UserProfile | null;
  communitySlug: string;
  postID: string;
  handleMessages: (conversationID: string) => void;
  onBack?: () => void;
}

export const SinglePostViewPage: FC<IProps> = ({
                                                 sdkClient,
                                                 handleMessages,
                                                 user,
                                                 communitySlug,
                                                 postID,
                                                 onBack
                                               }) => {
  const [post, setPost] = useState<PostResponse | null>(null);
  const [communityID, setCommunityID] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [myMembership, setMyMembership] = useState<CommunityMember | null>(null);

  useEffect(() => {
    loadPost();
  }, [communitySlug, postID]);

  useEffect(() => {
    if (communityID) {
      fetchMemberStatus(communityID);
    }
  }, [communityID]);

  const fetchMemberStatus = async (communityID: string) => {
    try {
      const member = await sdkClient.communities.members.getMyMembership(communityID);
      setMyMembership(member);
    } catch (e) {
      console.error(e);
    }
  }

  const loadPost = async () => {
    try {
      setIsLoading(true);

      const community = await sdkClient.communities.getCommunityBySlug(communitySlug);
      setCommunityID(community.id);

      const postData = await sdkClient.communities.posts.getPostByID(community.id, postID);
      setPost(postData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactToPost = async (postID: string, reactionType: ReactionType) => {
    if (!post) return;

    try {
      const isCurrentlyLiked = post.userReaction === reactionType;

      await sdkClient.communities.posts.reactToPost(communityID, postID, { type: reactionType });

      setPost(prev => prev ? {
        ...prev,
        likeCount: isCurrentlyLiked
          ? prev.likeCount - 1
          : prev.likeCount + 1,
        userReaction: isCurrentlyLiked
          ? undefined
          : reactionType
      } : null);
    } catch (error: any) {
      toast.error(error.message || "Failed to react to post");
    }
  };

  const handleAddComment = async (postID: string, newComment: string) => {
    if (!newComment.trim()) return;

    try {
      await sdkClient.communities.comments.createComment(communityID, {
        postID,
        content: newComment.trim(),
        mediaUrls: []
      });

      setPost(prev => prev ? {
        ...prev,
        commentCount: prev.commentCount + 1
      } : null);

      toast.success('Comment added successfully!');
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  const handlePostUpdate = (updatedPost: PostResponse) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    toast.success('Post deleted successfully');
    onBack?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Post not found</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4 lg:py-6 max-w-2xl mx-auto px-2 sm:px-0">
      {onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 text-stone-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Community
        </Button>
      )}

      <SinglePost
        myMembership={myMembership}
        sdkClient={sdkClient}
        user={user}
        post={post}
        onPostDelete={handlePostDelete}
        onPostUpdate={handlePostUpdate}
        handleReactToPost={handleReactToPost}
        handleAddComment={handleAddComment}
        isDetailView={true}
      />
    </div>
  );
};
