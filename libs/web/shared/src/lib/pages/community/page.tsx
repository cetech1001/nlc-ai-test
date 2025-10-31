'use client'

import {useState, useEffect, FC} from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  CommunityHeader,
  LoadMorePosts,
  NewPost,
  SinglePost,
  CommunityMembersSidebar,
  PostSkeleton,
  UserProfileSidebar
} from "./partials";
import {
  PostResponse,
  PostType,
  ReactionType,
} from "@nlc-ai/sdk-communities";
import {UserType, CommunityResponse, UserProfile, CommunityMember} from "@nlc-ai/types";
import {NLCClient} from "@nlc-ai/sdk-main";

interface IProps {
  sdkClient: NLCClient;
  user: UserProfile | null;
  isLoading: boolean;
  community: CommunityResponse | null;
  handleMessages: (conversationID: string) => void;
  onNavigateToPost?: (postID: string) => void;
}

export const CommunityPage: FC<IProps> = ({
                                            sdkClient,
                                            handleMessages,
                                            community,
                                            isLoading,
                                            user,
                                            onNavigateToPost
                                          }) => {
  const [posts, setPosts] = useState<PostResponse[]>([]);

  const [postsLoading, setPostsLoading] = useState(false);

  const [showMembersSidebar, setShowMembersSidebar] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState<string>("");
  const [selectedUserType, setSelectedUserType] = useState<UserType>(UserType.COACH);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [myMembership, setMyMembership] = useState<CommunityMember | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    if (community?.id) {
      loadPosts(community.id);
      fetchMemberStatus(community.id);
    }
  }, [community?.id]);

  const fetchMemberStatus = async (communityID: string) => {
    try {
      const member = await sdkClient.communities.members.getMyMembership(communityID);
      setMyMembership(member);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const loadPosts = async (communityID?: string, page = 1) => {
    try {
      setPostsLoading(true);

      const response = await sdkClient.communities.posts.getPosts(communityID || community?.id || '', {
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
      toast.success('Post created successfully!');
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleReactToPost = async (postID: string, reactionType: ReactionType) => {
    try {
      const currentPost = posts.find(p => p.id === postID);
      if (!currentPost) return;

      if (community?.id) {
        const isCurrentlyLiked = currentPost.userReaction === reactionType;

        await sdkClient.communities.posts.reactToPost(community.id, postID, { type: reactionType });

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
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to react to post");
    }
  };

  const handleAddComment = async (postID: string, newComment: string) => {
    if (!newComment.trim()) return;

    try {
      if (community?.id) {
        await sdkClient.communities.comments.createComment(community.id, {
          postID,
          content: newComment.trim(),
          mediaUrls: []
        });

        setPosts(prev => prev.map(post =>
          post.id === postID
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        ));

        toast.success('Comment added successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  const handleMemberClick = async (memberID: string, memberType: string) => {
    try {
      const senderID = user?.type === UserType.ADMIN ? UserType.ADMIN : user?.id;
      const conversation = await sdkClient.messages.createConversation({
        type: 'direct',
        participantIDs: [senderID || '', memberID],
        participantTypes: [user?.type || UserType.COACH, memberType as any]
      });

      handleMessages(conversation.id);
      setShowMembersSidebar(false);
    } catch (error: any) {
      toast.error('Failed to start conversation');
    }
  };

  const handleUserClick = (userID: string, userType: UserType) => {
    if (userID === user?.id) return;

    setSelectedUserID(userID);
    setSelectedUserType(userType);
    setShowUserProfile(true);

    setShowMembersSidebar(false);
  };

  const loadMorePosts = () => {
    console.log(`Load posts: ${hasMorePosts}`);
    if (hasMorePosts && !postsLoading) {
      loadPosts(community?.id, currentPage + 1);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleNavigateToPost = (postID: string) => {
    if (onNavigateToPost) {
      onNavigateToPost(postID);
    }
  };

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className="flex gap-3 sm:gap-4 lg:gap-6 h-full relative">
      <div className={`flex-1 max-w-full ${showUserProfile && isDesktop ? 'lg:max-w-2xl' : 'lg:max-w-2xl'} px-2 sm:px-0`}>
        <CommunityHeader community={community}/>

        <NewPost
          sdkClient={sdkClient}
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
                sdkClient={sdkClient}
                user={user}
                key={post.id}
                post={post}
                onPostDelete={(postID) => {
                  setPosts(prevState =>
                    prevState.filter((value) =>
                      value.id !== postID));
                }}
                onPostUpdate={(updatedPost, refresh = false) => {
                  if (refresh) {
                    window.location.reload();
                  }
                  setPosts(prev => prev.map(p =>
                    p.id === updatedPost.id ? updatedPost : p
                  ));
                }}
                handleReactToPost={handleReactToPost}
                handleAddComment={handleAddComment}
                onUserClick={handleUserClick}
                onNavigateToPost={handleNavigateToPost}
                isDetailView={false}
                myMembership={myMembership}
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
          handleMessages={handleMessages}
          user={user}
          sdkClient={sdkClient}
          communityID={community.id}
          isMobileOpen={showMembersSidebar}
          onMobileToggle={() => setShowMembersSidebar(!showMembersSidebar)}
          onMemberClick={handleMemberClick}
        />
      )}

      {showUserProfile && (
        <UserProfileSidebar
          handleMessages={handleMessages}
          user={user}
          sdkClient={sdkClient}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          userID={selectedUserID}
          userType={selectedUserType}
          isMobile={!isDesktop}
        />
      )}
    </div>
  );
};
