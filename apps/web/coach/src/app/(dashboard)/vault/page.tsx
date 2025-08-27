'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Search,
  Users,
  Menu,
  X,
  User,
  Crown,
  Shield
} from "lucide-react";
import {CommunityHeader, LoadMorePosts, NewPost, sdkClient, SinglePost} from "@/lib";
import {
  PostResponse,
  PostType,
  ReactionType,
  CommunityResponse,
} from "@nlc-ai/sdk-community";
import { AlertBanner } from '@nlc-ai/web-ui';
import {toast} from "sonner";

interface CommunityMember {
  id: string;
  userID: string;
  userType: 'coach' | 'client' | 'admin';
  name: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  lastActiveAt?: Date;
  joinedAt: Date;
}

const VaultPage = () => {
  const router = useRouter();

  // State management
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Mobile state
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      const communityData = await sdkClient.community.communities.getCoachToCommunity();
      setCommunity(communityData);

      // Load posts and members
      await Promise.all([
        loadPosts(communityData.id),
        loadCommunityMembers(communityData.id)
      ]);
    } catch (error: any) {
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

  const loadCommunityMembers = async (communityID: string) => {
    try {
      setMembersLoading(true);

      // Mock data - replace with actual API call to get community members
      const mockMembers: CommunityMember[] = [
        {
          id: '1',
          userID: 'coach-1',
          userType: 'coach',
          name: 'Sarah Johnson',
          avatarUrl: '/api/placeholder/40/40',
          role: 'owner',
          status: 'active',
          isOnline: true,
          joinedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          userID: 'coach-2',
          userType: 'coach',
          name: 'Michael Chen',
          avatarUrl: '/api/placeholder/40/40',
          role: 'admin',
          status: 'active',
          isOnline: true,
          lastActiveAt: new Date(),
          joinedAt: new Date('2024-01-05')
        },
        {
          id: '3',
          userID: 'coach-3',
          userType: 'coach',
          name: 'Emily Rodriguez',
          avatarUrl: '/api/placeholder/40/40',
          role: 'moderator',
          status: 'active',
          isOnline: false,
          lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          joinedAt: new Date('2024-01-10')
        },
        {
          id: '4',
          userID: 'coach-4',
          userType: 'coach',
          name: 'David Thompson',
          avatarUrl: '/api/placeholder/40/40',
          role: 'member',
          status: 'active',
          isOnline: true,
          lastActiveAt: new Date(),
          joinedAt: new Date('2024-01-15')
        },
        {
          id: '5',
          userID: 'coach-5',
          userType: 'coach',
          name: 'Lisa Wang',
          avatarUrl: '/api/placeholder/40/40',
          role: 'member',
          status: 'active',
          isOnline: false,
          lastActiveAt: new Date(Date.now() - 30 * 60 * 1000),
          joinedAt: new Date('2024-01-20')
        }
      ];

      setMembers(mockMembers);
    } catch (error: any) {
      console.error('Failed to load community members:', error);
    } finally {
      setMembersLoading(false);
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
      toast.success('Post created successfully!');
    } catch (error: any) {
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

  const handleMemberClick = async (member: CommunityMember) => {
    try {
      // Create or find direct conversation with this member
      const conversation = await sdkClient.messaging.createConversation({
        type: 'direct',
        participantIDs: ['current-user-id', member.userID], // Replace with actual current user ID
        participantTypes: ['coach', member.userType]
      });

      router.push(`/messages?conversationID=${conversation.id}`);
      setShowChatSidebar(false);
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

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group members by role
  const groupedMembers = filteredMembers.reduce((groups, member) => {
    const role = member.role;
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(member);
    return groups;
  }, {} as Record<string, CommunityMember[]>);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-red-400" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatLastActive = (lastActiveAt?: Date) => {
    if (!lastActiveAt) return '';

    const now = new Date();
    const diff = now.getTime() - lastActiveAt.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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

      {/* Mobile Community Sidebar Toggle */}
      {!showChatSidebar && (
        <div className="lg:hidden fixed top-24 right-4 z-50">
          <button
            onClick={() => setShowChatSidebar(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-full shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

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

        {/* Community Members Sidebar - Desktop */}
        <div className="hidden lg:block w-96 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden h-fit">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10 p-6">
            <h2 className="text-white text-xl font-semibold mb-6">Community</h2>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Members List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {membersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
                </div>
              ) : Object.keys(groupedMembers).length > 0 ? (
                Object.entries(groupedMembers).map(([role, roleMembers]) => (
                  <div key={role} className="space-y-2">
                    <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wider px-2">
                      {getRoleLabel(role)}s ({roleMembers.length})
                    </h3>
                    <div className="space-y-1">
                      {roleMembers.map(member => (
                        <div
                          key={member.id}
                          onClick={() => handleMemberClick(member)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                        >
                          <div className="relative">
                            <img
                              src={member.avatarUrl || '/api/placeholder/40/40'}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                              member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white text-sm font-medium truncate">{member.name}</h3>
                              {getRoleIcon(member.role)}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-stone-400 text-xs">
                                {member.isOnline ? 'Online' : formatLastActive(member.lastActiveAt)}
                              </p>
                              <MessageCircle className="w-3 h-3 text-stone-500 group-hover:text-fuchsia-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">No members found</p>
                  {searchQuery && (
                    <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-700 pt-4 mt-4">
              <p className="text-stone-500 text-xs text-center">
                Click any member to start a conversation
              </p>
            </div>
          </div>
        </div>

        {/* Community Members Sidebar - Mobile Overlay */}
        {showChatSidebar && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-neutral-800 to-neutral-900 border-l border-neutral-700 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
              </div>

              <div className="relative z-10 p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-semibold">Community</h2>
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
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                {/* Members List */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {membersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
                    </div>
                  ) : Object.keys(groupedMembers).length > 0 ? (
                    Object.entries(groupedMembers).map(([role, roleMembers]) => (
                      <div key={role} className="space-y-2">
                        <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wider px-2">
                          {getRoleLabel(role)}s ({roleMembers.length})
                        </h3>
                        <div className="space-y-1">
                          {roleMembers.map(member => (
                            <div
                              key={member.id}
                              onClick={() => handleMemberClick(member)}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                            >
                              <div className="relative">
                                <img
                                  src={member.avatarUrl || '/api/placeholder/40/40'}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                                  member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                                }`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white text-sm font-medium truncate">{member.name}</h3>
                                  {getRoleIcon(member.role)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-stone-400 text-xs">
                                    {member.isOnline ? 'Online' : formatLastActive(member.lastActiveAt)}
                                  </p>
                                  <MessageCircle className="w-3 h-3 text-stone-500 group-hover:text-fuchsia-400 transition-colors" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                      <p className="text-stone-400 text-sm">No members found</p>
                      {searchQuery && (
                        <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-700 pt-4 mt-4">
                  <p className="text-stone-500 text-xs text-center">
                    Click any member to start a conversation
                  </p>
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
