'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  MoreHorizontal,
  Search,
  Users,
  Menu,
  X,
} from "lucide-react";
import {CommunityHeader, LoadMorePosts, NewPost, sdkClient, SinglePost} from "@/lib";
import {
  PostResponse,
  ConversationResponse,
  PostType,
  ReactionType,
} from "@nlc-ai/sdk-community";
import { AlertBanner } from '@nlc-ai/web-ui';
import { formatTimeAgo } from "@nlc-ai/web-utils";

const VaultPage = () => {
  const router = useRouter();

  // State management
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Mobile state
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load coach-to-coach community
      const communityData = await sdkClient.community.getCoachToCommunity();
      setCommunity(communityData);

      // Load posts and conversations concurrently
      await Promise.all([
        loadPosts(communityData.id),
        loadConversations()
      ]);
    } catch (error: any) {
      setError(error.message || "Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async (communityID?: string, page = 1) => {
    try {
      setPostsLoading(true);

      const response = await sdkClient.community.getPosts({
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
      setError(error.message || "Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      setChatsLoading(true);

      const data = await sdkClient.community.getConversations(1, 20);
      setConversations(data);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      // Don't show error for conversations as it's secondary
    } finally {
      setChatsLoading(false);
    }
  };

  const handleCreatePost = async (newPost: string, mediaUrls?: string[]) => {
    if (!newPost.trim() || !community) return;

    try {
      const newPostData = await sdkClient.community.createPost({
        communityID: community.id,
        type: PostType.TEXT,
        content: newPost.trim(),
        mediaUrls: mediaUrls || []
      });

      // Add new post to the beginning of the list
      setPosts(prev => [newPostData, ...prev]);
      setSuccessMessage('Post created successfully!');
    } catch (error: any) {
      setError(error.message || "Failed to create post");
    }
  };

  const handleReactToPost = async (postID: string, reactionType: ReactionType) => {
    try {
      await sdkClient.community.reactToPost(postID, { type: reactionType });

      // Update local state
      setLikedPosts(prev => {
        const newLiked = new Set(prev);
        if (newLiked.has(postID)) {
          newLiked.delete(postID);
        } else {
          newLiked.add(postID);
        }
        return newLiked;
      });

      // Update post like count
      setPosts(prev => prev.map(post =>
        post.id === postID
          ? {
            ...post,
            likeCount: likedPosts.has(postID) ? post.likeCount - 1 : post.likeCount + 1,
            userReaction: likedPosts.has(postID) ? undefined : reactionType
          }
          : post
      ));
    } catch (error: any) {
      setError(error.message || "Failed to react to post");
    }
  };

  const handleAddComment = async (postID: string, newComment: string) => {
    if (!newComment.trim()) return;

    try {
      await sdkClient.community.createComment(postID, {
        content: newComment.trim(),
        mediaUrls: []
      });

      // Update post comment count
      setPosts(prev => prev.map(post =>
        post.id === postID
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));

      setSuccessMessage('Comment added successfully!');
    } catch (error: any) {
      setError(error.message || "Failed to add comment");
    }
  };

  const handleChatClick = (conversation: ConversationResponse) => {
    router.push(`/chat?conversationID=${conversation.id}`);
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

      {/* Mobile Chat Toggle Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowChatSidebar(!showChatSidebar)}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-full shadow-lg"
        >
          {showChatSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-3 sm:gap-4 lg:gap-6 h-full relative">
        {/* Main Content */}
        <div className="flex-1 max-w-full lg:max-w-2xl px-2 sm:px-0">
          {community && <CommunityHeader community={community}/>}

          <NewPost handleCreatePost={handleCreatePost}/>

          {/* Posts Feed */}
          <div className="space-y-4 sm:space-y-6">
            {posts.map(post => (
              <SinglePost
                key={post.id}
                post={post}
                likedPosts={likedPosts}
                handleReactToPost={handleReactToPost}
                handleAddComment={handleAddComment}
              />
            ))}

            {/* Load More Posts */}
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

        {/* Chat Sidebar - Desktop */}
        <div className="hidden lg:block w-96 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden h-fit">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10 p-6">
            <h2 className="text-white text-xl font-semibold mb-6">Coach Network</h2>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search coaches..."
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Chat List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chatsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
                </div>
              ) : conversations.length > 0 ? (
                conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => handleChatClick(conversation)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {conversation.name ? conversation.name.charAt(0).toUpperCase() : 'C'}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-sm font-medium truncate">
                          {conversation.name || 'Coach Chat'}
                        </h3>
                        <button className="text-stone-400 hover:text-white transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-stone-400 text-xs truncate">
                          {conversation.lastMessage?.content || 'Start a conversation'}
                        </p>
                        <span className="text-stone-500 text-xs">
                          {conversation.lastMessageAt ? formatTimeAgo(conversation.lastMessageAt) : ''}
                        </span>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-fuchsia-600 rounded-full flex items-center justify-center mt-1">
                          <span className="text-white text-xs font-medium">{conversation.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">No conversations yet</p>
                  <p className="text-stone-500 text-xs">Connect with other coaches</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar - Mobile Overlay */}
        {showChatSidebar && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-neutral-800 to-neutral-900 border-l border-neutral-700 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
              </div>

              <div className="relative z-10 p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-semibold">Coach Network</h2>
                  <button
                    onClick={() => setShowChatSidebar(false)}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search coaches..."
                    className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                {/* Chat List */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {chatsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          handleChatClick(conversation);
                          setShowChatSidebar(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {conversation.name ? conversation.name.charAt(0).toUpperCase() : 'C'}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white text-sm font-medium truncate">
                              {conversation.name || 'Coach Chat'}
                            </h3>
                            <button className="text-stone-400 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-stone-400 text-xs truncate">
                              {conversation.lastMessage?.content || 'Start a conversation'}
                            </p>
                            <span className="text-stone-500 text-xs">
                              {conversation.lastMessageAt ? formatTimeAgo(conversation.lastMessageAt) : ''}
                            </span>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-fuchsia-600 rounded-full flex items-center justify-center mt-1">
                              <span className="text-white text-xs font-medium">{conversation.unreadCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                      <p className="text-stone-400 text-sm">No conversations yet</p>
                      <p className="text-stone-500 text-xs">Connect with other coaches</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultPage;
