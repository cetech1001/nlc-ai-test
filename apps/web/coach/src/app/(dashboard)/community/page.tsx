'use client'

import React, {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import {sdkClient} from '@/lib';
import {Community, CreatePostRequest, MemberRole, PostResponse, PostType, ReactionType} from '@nlc-ai/sdk-communities';
import {useAuth} from "@nlc-ai/web-auth";
import {CommunityHeader, CommunityMembersSidebar, LoadMorePosts, NewPost, SinglePost} from '@/lib/components/community';

interface OptimisticPost extends PostResponse {
  isOptimistic?: boolean;
  tempID?: string;
}

export default function CommunityPage() {
  const params = useParams();
  const { user } = useAuth();
  const communityID = params?.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<OptimisticPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (communityID) {
      loadCommunityData();
    }
  }, [communityID]);

  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      const [communityResponse, postsResponse] = await Promise.all([
        sdkClient.communities.getCommunity(communityID),
        sdkClient.communities.posts.getPosts(communityID, {
          page: 1,
          limit: 10,
          sortOrder: 'desc'
        })
      ]);

      setCommunity(communityResponse);
      setPosts(postsResponse.data);
      setHasMorePosts(postsResponse.pagination.hasNext);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Failed to load community:', error);
      toast.error('Failed to load community data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const response = await sdkClient.communities.posts.getPosts(communityID, {
        page: currentPage + 1,
        limit: 10,
        sortOrder: 'desc'
      });

      setPosts(prev => [...prev, ...response.data]);
      setHasMorePosts(response.pagination.hasNext);
      setCurrentPage(prev => prev + 1);
    } catch (error: any) {
      console.error('Failed to load more posts:', error);
      toast.error('Failed to load more posts');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Optimistic post creation
  const handleOptimisticPost = (content: string, mediaUrls?: string[]) => {
    if (!user || !community) return;

    const tempID = `temp-${Date.now()}`;
    const optimisticPost: OptimisticPost = {
      id: tempID,
      tempID,
      communityID: community.id,
      communityMemberID: user.id ,
      type: PostType.TEXT,
      content,
      mediaUrls: mediaUrls || [],
      linkUrl: undefined,
      linkPreview: {},
      pollOptions: [],
      eventData: {},
      likeCount: 0,
      commentCount: 0,
      isDeleted: false,
      shareCount: 0,
      isEdited: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      communityMember: {
        id: '',
        userID: user.id,
        userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You',
        userAvatarUrl: user.avatarUrl,
        role: MemberRole.MEMBER // This should come from community membership
      },
      userReaction: undefined,
      isOptimistic: true
    };

    // Add optimistic post to the top of the list
    setPosts(prev => [optimisticPost, ...prev]);
  };

  const handleCreatePost = async (content: string, mediaUrls?: string[]) => {
    try {
      const createRequest: CreatePostRequest = {
        type: PostType.TEXT,
        content,
        mediaUrls: mediaUrls || []
      };

      const newPost = await sdkClient.communities.posts.createPost(communityID, createRequest);

      // Remove optimistic post and add real post
      setPosts(prev => {
        const withoutOptimistic = prev.filter(p => !p.isOptimistic);
        return [newPost, ...withoutOptimistic];
      });

      // Update community post count
      if (community) {
        setCommunity(prev => prev ? {
          ...prev,
          postCount: prev.postCount + 1
        } : null);
      }

      toast.success('Post created successfully!');
    } catch (error: any) {
      // Remove failed optimistic post
      setPosts(prev => prev.filter(p => !p.isOptimistic));
      console.error('Failed to create post:', error);
      throw error; // Re-throw so NewPost component can handle it
    }
  };

  const handleReactToPost = async (postID: string, reactionType: ReactionType) => {
    try {
      await sdkClient.communities.posts.reactToPost(communityID, postID, { type: reactionType });

      // The optimistic update is handled in SinglePost component
      // Here we could refresh the post data if needed, but it's not necessary
      // since the optimistic update provides immediate feedback
    } catch (error: any) {
      console.error('Failed to react to post:', error);
      throw error; // Re-throw so SinglePost component can handle the revert
    }
  };

  const handleAddComment = async (postID: string, content: string) => {
    try {
      const newComment = await sdkClient.communities.posts.createComment(communityID, postID, {
        content,
        mediaUrls: []
      });

      // Update post comment count in local state
      setPosts(prev => prev.map(post =>
        post.id === postID
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));

      return newComment;
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      throw error; // Re-throw so SinglePost component can handle the revert
    }
  };

  const handlePostUpdate = (updatedPost: PostResponse) => {
    setPosts(prev => prev.map(post =>
      post.id === updatedPost.id || post.tempID === updatedPost.id
        ? { ...updatedPost, isOptimistic: false }
        : post
    ));
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Community not found</h1>
          <p className="text-stone-400">The community you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            {/* Community Header */}
            <CommunityHeader community={community} />

            {/* New Post */}
            <NewPost
              handleCreatePost={handleCreatePost}
              onOptimisticPost={handleOptimisticPost}
            />

            {/* Posts Feed */}
            <div className="space-y-4 sm:space-y-6">
              {posts.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-stone-400 text-sm">Be the first to share something with the community!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.tempID || post.id}
                    className={post.isOptimistic ? 'animate-pulse' : ''}
                  >
                    <SinglePost
                      user={user}
                      post={post}
                      handleReactToPost={handleReactToPost}
                      handleAddComment={handleAddComment}
                      onPostUpdate={handlePostUpdate}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Load More Posts */}
            {hasMorePosts && posts.length > 0 && (
              <LoadMorePosts
                loadMorePosts={loadMorePosts}
                isLoading={isLoadingMore}
              />
            )}

            {/* End of Posts Message */}
            {!hasMorePosts && posts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-stone-500 text-sm">You've reached the end! 🎉</p>
              </div>
            )}
          </div>

          {/* Community Members Sidebar */}
          <div className="hidden lg:block">
            <CommunityMembersSidebar
              communityID={communityID}
              isMobileOpen={isMobileSidebarOpen}
              onMobileToggle={toggleMobileSidebar}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <CommunityMembersSidebar
          communityID={communityID}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={toggleMobileSidebar}
        />
      </div>
    </div>
  );
}
