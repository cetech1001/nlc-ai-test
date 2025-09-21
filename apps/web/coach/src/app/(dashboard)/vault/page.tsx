'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  CommunityHeader,
  LoadMorePosts,
  NewPost,
  sdkClient,
  SinglePost,
  CommunityMembersSidebar,
  PostSkeleton
} from "@/lib";
import {
  PostResponse,
  PostType,
  ReactionType,
  CommunityResponse,
} from "@nlc-ai/sdk-communities";
import { AlertBanner } from '@nlc-ai/web-ui';
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

  // New state for optimistic posting
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const communityData = await sdkClient.communities.getCoachToCommunity();
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

      const response = await sdkClient.communities.posts.getPosts(communityID || community?.id!, {
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
      setIsCreatingPost(true);

      const newPostData = await sdkClient.communities.posts.createPost(community.id, {
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
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleReactToPost = async (postID: string, reactionType: ReactionType) => {
    try {
      const currentPost = posts.find(p => p.id === postID);
      if (!currentPost) return;

      const isCurrentlyLiked = currentPost.userReaction === reactionType;

      await sdkClient.communities.posts.reactToPost(community?.id!, postID, { type: reactionType });

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
      await sdkClient.communities.posts.createComment(community?.id!, postID, {
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
          {community ? (
            <CommunityHeader community={community}/>
          ) : (
            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden mb-4 sm:mb-6">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -right-4 sm:-right-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
              </div>
              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full animate-pulse" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-6 sm:h-8 bg-neutral-700/50 rounded animate-pulse w-48" />
                    <div className="h-4 bg-neutral-700/50 rounded animate-pulse w-32" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <NewPost
            handleCreatePost={handleCreatePost}
            onOptimisticPost={() => setIsCreatingPost(true)}
          />

          <div className="space-y-4 sm:space-y-6">
            {isCreatingPost && <PostSkeleton />}

            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <PostSkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              posts.map(post => (
                <SinglePost
                  user={user}
                  key={post.id}
                  post={post}
                  onPostDelete={(postID) => {
                    setPosts(prevState =>
                      prevState.filter((value) =>
                        value.id !== postID));
                  }}
                  handleReactToPost={handleReactToPost}
                  handleAddComment={handleAddComment}
                />
              ))
            )}

            {hasMorePosts && !isLoading && (
              <LoadMorePosts loadMorePosts={loadMorePosts} isLoading={postsLoading}/>
            )}

            {posts.length === 0 && !postsLoading && !isLoading && (
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
