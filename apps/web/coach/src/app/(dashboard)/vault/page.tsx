'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { CommunityHeader, LoadMorePosts, NewPost, sdkClient, SinglePost, CommunityMembersSidebar } from "@/lib";
import {
  PostResponse,
  PostType,
  ReactionType,
  CommunityResponse,
} from "@nlc-ai/sdk-community";
import { AlertBanner } from '@nlc-ai/web-ui';
import { toast } from "sonner";
import { useAuth } from "@nlc-ai/web-auth";

const VaultPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [showMembersSidebar, setShowMembersSidebar] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const communityData = await sdkClient.community.communities.getCoachToCommunity();
      setCommunity(communityData);

      await loadPosts(communityData.id);
    } catch (error: any) {
      setError(error.message || "Failed to load community data");
      toast.error(error.message || "Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async (communityID?: string, page = 1) => {
    try {
      setPostsLoading(true);

      const response = await sdkClient.community.posts.getPosts({
        communityID: communityID || community?.id,
        page,
        limit: 10,
        sortOrder: 'desc'
      });

      if (page === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }

      setHasMorePosts(response.pagination.hasNext);
    } catch (error: any) {
      toast.error(error.message || "Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCreatePost = async (newPost: string, mediaUrls?: string[]) => {
    if (!newPost.trim() || !community) return;

    try {
      const newPostData = await sdkClient.community.posts.createPost({
        communityID: community.id,
        type: PostType.TEXT,
        content: newPost.trim(),
        mediaUrls: mediaUrls || []
      });

      setPosts(prev => [newPostData, ...prev]);
      setSuccessMessage('Post created successfully!');
      toast.success('Post created successfully!');
    } catch (error: any) {
      setError(error.message || "Failed to create post");
      toast.error(error.message || "Failed to create post");
    }
  };

  const handleReactToPost = async (postID: string, reactionType: ReactionType) => {
    try {
      const currentPost = posts.find(p => p.id === postID);
      if (!currentPost) return;

      const isCurrentlyLiked = currentPost.userReaction === reactionType;

      await sdkClient.community.posts.reactToPost(postID, { type: reactionType });

      setPosts(prev => prev.map(post =>
        post.id === postID
          ? {
            ...post,
            likeCount: isCurrentlyLiked
              ? post.likeCount - 1
              : post.likeCount + 1,
            userReaction: isCurrentlyLiked
              ? undefined
              : reactionType
          }
          : post
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to react to post");
    }
  };

  const handleAddComment = async (postID: string, newComment: string) => {
    if (!newComment.trim()) return;

    try {
      await sdkClient.community.posts.createComment(postID, {
        content: newComment.trim(),
        mediaUrls: []
      });

      setPosts(prev => prev.map(post =>
        post.id === postID
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));

      toast.success('Comment added successfully!');
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  const handleMemberClick = async (memberID: string, memberType: string) => {
    try {
      const conversation = await sdkClient.messaging.createConversation({
        type: 'direct',
        participantIDs: [user?.id || '', memberID],
        participantTypes: ['coach', memberType as any]
      });

      router.push(`/messages?conversationID=${conversation.id}`);
      setShowMembersSidebar(false);
    } catch (error: any) {
      toast.error('Failed to start conversation');
    }
  };

  const loadMorePosts = () => {
    if (hasMorePosts && !postsLoading) {
      loadPosts(community?.id, currentPage + 1);
      setCurrentPage(prev => prev + 1);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 max-w-full overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4 lg:py-6 max-w-full overflow-hidden">
      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
      )}

      {error && (
        <AlertBanner type="error" message={error} onDismiss={clearMessages} />
      )}

      <div className="flex gap-3 sm:gap-4 lg:gap-6 h-full relative">
        <div className="flex-1 max-w-full lg:max-w-2xl px-2 sm:px-0">
          {community && <CommunityHeader community={community}/>}

          <NewPost handleCreatePost={handleCreatePost}/>

          <div className="space-y-4 sm:space-y-6">
            {posts.map(post => (
              <SinglePost
                user={user}
                key={post.id}
                post={post}
                handleReactToPost={handleReactToPost}
                handleAddComment={handleAddComment}
              />
            ))}

            {hasMorePosts && (
              <LoadMorePosts loadMorePosts={loadMorePosts} isLoading={postsLoading}/>
            )}

            {posts.length === 0 && !postsLoading && (
              <div className="text-center py-12">
                <Users className="w-12 sm:w-16 h-12 sm:h-16 text-stone-600 mx-auto mb-4" />
                <h3 className="text-white text-base sm:text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-stone-400 text-sm sm:text-base px-4">Be the first to share something with the coach community!</p>
              </div>
            )}
          </div>
        </div>

        {community && (
          <CommunityMembersSidebar
            communityID={community.id}
            isMobileOpen={showMembersSidebar}
            onMobileToggle={() => setShowMembersSidebar(!showMembersSidebar)}
            onMemberClick={handleMemberClick}
          />
        )}
      </div>
    </div>
  );
};

export default VaultPage;
