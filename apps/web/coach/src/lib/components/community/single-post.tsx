import {ChevronDown, ChevronUp, Heart, MessageCircle, MoreHorizontal, Send, Volume2, VolumeX} from "lucide-react";
import {MemberRole, PostCommentResponse, PostResponse, ReactionType} from "@nlc-ai/sdk-communities";
import React, {FC, useState, useRef} from "react";
import {formatTimeAgo, getInitials} from "@nlc-ai/web-utils";
import {sdkClient, PostActionsDropdown, CommentActionsDropdown, EditPostModal} from "@/lib";
import {toast} from "sonner";
import { LoginResponse } from "@nlc-ai/web-auth";

interface IProps {
  post: PostResponse;
  user: LoginResponse['user'] | null;
  handleReactToPost: (postID: string, reactionType: ReactionType) => void;
  handleAddComment: (postID: string, newComment: string) => void;
  onPostUpdate?: (updatedPost: PostResponse) => void;
  onPostDelete?: (postID: string) => void;
}

interface OptimisticComment extends PostCommentResponse {
  isOptimistic?: boolean;
  tempID?: string;
}

export const SinglePost: FC<IProps> = (props) => {
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{ [key: string]: OptimisticComment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});
  const [commentsPage, setCommentsPage] = useState<{ [key: string]: number }>({});
  const [hasMoreComments, setHasMoreComments] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [mutedVideos, setMutedVideos] = useState<{ [key: string]: boolean }>({});

  // Dropdown and modal states
  const [showPostActions, setShowPostActions] = useState(false);
  const [showCommentActions, setShowCommentActions] = useState<{ [key: string]: boolean }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: boolean }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Optimistic state
  const [optimisticPost, setOptimisticPost] = useState<PostResponse>(props.post);
  const [isReacting, setIsReacting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const postActionsRef = useRef<HTMLButtonElement>(null);

  const POST_PREVIEW_LENGTH = 280;

  const isOwnPost = props.user?.id === optimisticPost.communityMember?.userID;

  const toggleComments = async (postID: string) => {
    const isCurrentlyShowing = showComments[postID];

    setShowComments(prev => ({
      ...prev,
      [postID]: !prev[postID]
    }));

    if (!isCurrentlyShowing && !comments[postID]) {
      await loadComments(postID, 1);
    }
  };

  const loadComments = async (postID: string, page: number = 1) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postID]: true }));

      const response = await sdkClient.communities.posts.getComments(props.post.communityID, postID, {page, limit: 10});

      setComments(prev => ({
        ...prev,
        [postID]: page === 1 ? response.data : [...(prev[postID] || []), ...response.data]
      }));

      setCommentsPage(prev => ({ ...prev, [postID]: page }));
      setHasMoreComments(prev => ({
        ...prev,
        [postID]: response.pagination.hasNext
      }));

    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(prev => ({ ...prev, [postID]: false }));
    }
  };

  const loadMoreComments = async (postID: string) => {
    const currentPage = commentsPage[postID] || 1;
    await loadComments(postID, currentPage + 1);
  };

  const handleOptimisticReaction = async (postID: string, reactionType: ReactionType) => {
    if (isReacting) return;

    setIsReacting(true);
    const previousReaction = optimisticPost.userReaction;
    const previousLikeCount = optimisticPost.likeCount;

    const newReaction = previousReaction === reactionType ? undefined : reactionType;
    const likeCountDelta =
      previousReaction === reactionType ? -1 :
        previousReaction ? 0 :
          1;

    const updatedPost = {
      ...optimisticPost,
      userReaction: newReaction,
      likeCount: previousLikeCount + likeCountDelta
    };

    setOptimisticPost(updatedPost);
    props.onPostUpdate?.(updatedPost);

    try {
      await props.handleReactToPost(postID, reactionType);
    } catch (error) {
      setOptimisticPost({
        ...optimisticPost,
        userReaction: previousReaction,
        likeCount: previousLikeCount
      });
      props.onPostUpdate?.(props.post);
      toast.error('Failed to update reaction');
      console.error('Failed to react to post:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleOptimisticComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    const tempID = `temp-${Date.now()}`;
    const optimisticCommentData: OptimisticComment = {
      id: tempID,
      tempID,
      postID: props.post.id,
      communityMemberID: props.user?.id || '',
      content: newComment,
      mediaUrls: [],
      parentCommentID: undefined,
      likeCount: 0,
      replyCount: 0,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      communityMember: {
        id: props.user?.id || '',
        userName: props.user?.firstName + ' ' + props.user?.lastName,
        userAvatarUrl: getCurrentUserAvatar(),
        role: MemberRole.MEMBER
      },
      isOptimistic: true,
      replies: []
    };

    setComments(prev => ({
      ...prev,
      [props.post.id]: [optimisticCommentData, ...(prev[props.post.id] || [])]
    }));

    const updatedPost = {
      ...optimisticPost,
      commentCount: optimisticPost.commentCount + 1
    };
    setOptimisticPost(updatedPost);
    props.onPostUpdate?.(updatedPost);

    const commentToAdd = newComment;
    setNewComment('');

    try {
      await props.handleAddComment(props.post.id, commentToAdd);

      setComments(prev => ({
        ...prev,
        [props.post.id]: (prev[props.post.id] || []).filter(c => c.tempID !== tempID)
      }));

      await loadComments(props.post.id, 1);
    } catch (error) {
      setComments(prev => ({
        ...prev,
        [props.post.id]: (prev[props.post.id] || []).filter(c => c.tempID !== tempID)
      }));

      setOptimisticPost({
        ...optimisticPost,
        commentCount: optimisticPost.commentCount - 1
      });

      setNewComment(commentToAdd);
      toast.error('Failed to add comment');
      console.error('Failed to add comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleReactToComment = async (commentID: string, reactionType: ReactionType) => {
    const previousComments = comments[props.post.id] || [];

    const updatedComments = previousComments.map(comment => {
      if (comment.id === commentID) {
        const wasLiked = comment.userReaction === reactionType;
        return {
          ...comment,
          likeCount: wasLiked ? comment.likeCount - 1 : comment.likeCount + 1,
          userReaction: wasLiked ? undefined : reactionType
        };
      }
      return comment;
    });

    setComments(prev => ({
      ...prev,
      [props.post.id]: updatedComments
    }));

    try {
      await sdkClient.communities.posts.reactToComment(props.post.communityID, commentID, { type: reactionType });
    } catch (error) {
      setComments(prev => ({
        ...prev,
        [props.post.id]: previousComments
      }));
      toast.error('Failed to update reaction');
      console.error('Failed to react to comment:', error);
    }
  };

  const handleEditPost = () => {
    setShowEditModal(true);
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      // TODO: Replace with actual API call
      // await sdkClient.communities.posts.deletePost(props.post.communityID, props.post.id);

      toast.success('Post deleted successfully');
      props.onPostDelete?.(props.post.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/vault/post/${props.post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleReportPost = () => {
    toast.info('Report functionality will be implemented soon');
  };

  const handleEditComment = (commentID: string) => {
    toast.info('Edit comment functionality will be implemented soon');
  };

  const handleDeleteComment = async (commentID: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      // TODO: Replace with actual API call
      // await sdkClient.communities.posts.deleteComment(props.post.communityID, commentID);

      setComments(prev => ({
        ...prev,
        [props.post.id]: (prev[props.post.id] || []).filter(c => c.id !== commentID)
      }));

      toast.success('Comment deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleReplyToComment = (commentID: string) => {
    setReplyingTo(prev => ({
      ...prev,
      [commentID]: !prev[commentID]
    }));
  };

  const handleSubmitReply = async (parentCommentID: string) => {
    const reply = replyText[parentCommentID]?.trim();
    if (!reply) return;

    try {
      // TODO: Replace with actual API call
      // await sdkClient.communities.posts.createComment(props.post.communityID, props.post.id, {
      //   content: reply,
      //   parentCommentID,
      //   mediaUrls: []
      // });

      setReplyText(prev => ({ ...prev, [parentCommentID]: '' }));
      setReplyingTo(prev => ({ ...prev, [parentCommentID]: false }));
      toast.success('Reply added successfully');

      // Reload comments to show the new reply
      await loadComments(props.post.id, 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add reply');
    }
  };

  const toggleVideoMute = (videoID: string) => {
    setMutedVideos(prev => ({
      ...prev,
      [videoID]: !prev[videoID]
    }));
  };

  const isLongPost = optimisticPost.content.length > POST_PREVIEW_LENGTH;
  const displayContent = isLongPost && !isExpanded
    ? optimisticPost.content.slice(0, POST_PREVIEW_LENGTH)
    : optimisticPost.content;

  const renderMediaItem = (url: string, index: number) => {
    const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('video');
    const mediaID = `media-${props.post.id}-${index}`;

    if (isVideo) {
      return (
        <div key={index} className="relative group">
          <video
            className="w-full h-auto rounded-lg"
            controls
            muted={mutedVideos[mediaID] !== false}
            preload="metadata"
            poster={url.replace(/\.(mp4|mov|avi)$/i, '.jpg')}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleVideoMute(mediaID)}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              {mutedVideos[mediaID] !== false ?
                <VolumeX className="w-4 h-4" /> :
                <Volume2 className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="relative">
        <img
          src={url}
          alt={`Post content ${index + 1}`}
          className="w-full h-auto rounded-lg object-contain"
          style={{ maxHeight: '600px' }}
        />
      </div>
    );
  };

  const renderComment = (comment: OptimisticComment) => {
    const isOwnComment = props.user?.id === comment.communityMember?.id;

    return (
      <div
        key={comment.id}
        className={`flex gap-3 py-3 border-b border-neutral-700/50 last:border-b-0 ${
          comment.isOptimistic ? 'opacity-70' : ''
        }`}
      >
        <div className="w-8 h-8 rounded-full flex-shrink-0">
          {comment.communityMember?.userAvatarUrl ? (
            <img
              src={comment.communityMember.userAvatarUrl}
              alt={comment.communityMember.userName || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {getInitials(comment.communityMember?.userName)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white text-sm font-medium">
              {comment.communityMember?.userName || 'Unknown User'}
            </h4>
            <span className="text-stone-500 text-xs">
              {comment.isOptimistic ? 'Just now' : formatTimeAgo(comment.createdAt)}
            </span>
            {comment.isEdited && !comment.isOptimistic && (
              <span className="text-stone-500 text-xs">(edited)</span>
            )}
            {comment.isOptimistic && (
              <span className="text-stone-500 text-xs">(sending...)</span>
            )}
            {!comment.isOptimistic && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowCommentActions(prev => ({
                    ...prev,
                    [comment.id]: !prev[comment.id]
                  }))}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
                <CommentActionsDropdown
                  isOpen={showCommentActions[comment.id] || false}
                  onClose={() => setShowCommentActions(prev => ({ ...prev, [comment.id]: false }))}
                  isOwnComment={isOwnComment}
                  onEdit={() => handleEditComment(comment.id)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onReply={() => handleReplyToComment(comment.id)}
                  onReport={() => toast.info('Report functionality will be implemented soon')}
                />
              </div>
            )}
          </div>
          <p className="text-stone-200 text-sm leading-relaxed mb-2">
            {comment.content}
          </p>

          {comment.mediaUrls && comment.mediaUrls.length > 0 && (
            <div className="mb-2">
              {comment.mediaUrls.map((url, idx) => renderMediaItem(url, idx))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => !comment.isOptimistic && handleReactToComment(comment.id, ReactionType.LIKE)}
              disabled={comment.isOptimistic}
              className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
                comment.userReaction === ReactionType.LIKE
                  ? 'text-red-400'
                  : 'text-stone-500 hover:text-red-400'
              }`}
            >
              <Heart className={`w-3 h-3 ${
                comment.userReaction === ReactionType.LIKE ? 'fill-current' : ''
              }`} />
              {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
            </button>

            {comment.replyCount > 0 && (
              <button
                disabled={comment.isOptimistic}
                className="text-stone-500 hover:text-fuchsia-400 text-xs disabled:opacity-50"
              >
                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {replyingTo[comment.id] && (
            <div className="mt-3 flex items-start gap-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0">
                {getCurrentUserAvatar() ? (
                  <img
                    src={getCurrentUserAvatar()}
                    alt="Your avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {getCurrentUserInitials()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${comment.communityMember?.userName}...`}
                  value={replyText[comment.id] || ''}
                  onChange={(e) => setReplyText(prev => ({
                    ...prev,
                    [comment.id]: e.target.value
                  }))}
                  className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-1 text-white placeholder:text-stone-400 text-xs focus:outline-none focus:border-fuchsia-500"
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitReply(comment.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText[comment.id]?.trim()}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-2 py-1 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l border-neutral-700/50 space-y-2">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full flex-shrink-0">
                    {reply.communityMember?.userAvatarUrl ? (
                      <img
                        src={reply.communityMember.userAvatarUrl}
                        alt={reply.communityMember.userName || "User"}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">
                          {getInitials(reply.communityMember?.userName)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-white text-xs font-medium">
                        {reply.communityMember?.userName || 'Unknown User'}
                      </span>
                      <span className="text-stone-500 text-xs">
                        {formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-stone-200 text-xs">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getCurrentUserAvatar = () => {
    return props.user?.avatarUrl;
  };

  const getCurrentUserInitials = () => {
    return getInitials(props.user?.firstName + ' ' + props.user?.lastName);
  };

  return (
    <>
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -left-4 sm:-left-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex-shrink-0">
              {optimisticPost.communityMember?.userAvatarUrl ? (
                <img
                  src={optimisticPost.communityMember.userAvatarUrl}
                  alt={optimisticPost.communityMember.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getInitials(optimisticPost.communityMember?.userName)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white text-sm sm:text-base font-semibold truncate">
                  {optimisticPost.communityMember?.userName || 'Unknown User'}
                </h3>
                {optimisticPost.communityMember?.role && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium capitalize">
                    {optimisticPost.communityMember.role}
                  </span>
                )}
              </div>
              <p className="text-stone-400 text-xs sm:text-sm">
                {formatTimeAgo(optimisticPost.createdAt)}
                {optimisticPost.isEdited && <span className="ml-1">(edited)</span>}
              </p>
            </div>
            <div className="relative">
              <button
                ref={postActionsRef}
                onClick={() => setShowPostActions(!showPostActions)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <PostActionsDropdown
                isOpen={showPostActions}
                onClose={() => setShowPostActions(false)}
                isOwnPost={isOwnPost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onCopyLink={handleCopyLink}
                onReport={handleReportPost}
                anchorRef={postActionsRef}
              />
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {displayContent}
              {isLongPost && !isExpanded && '...'}
            </p>

            {isLongPost && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium mt-2 transition-colors"
              >
                {isExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>

          {/* Post Media */}
          {optimisticPost.mediaUrls && optimisticPost.mediaUrls.length > 0 && (
            <div className="mb-4">
              {optimisticPost.mediaUrls.length === 1 ? (
                <div className="rounded-lg overflow-hidden">
                  {renderMediaItem(optimisticPost.mediaUrls[0], 0)}
                </div>
              ) : (
                <div className={`grid gap-2 rounded-lg overflow-hidden ${
                  optimisticPost.mediaUrls.length === 2 ? 'grid-cols-2' :
                    optimisticPost.mediaUrls.length === 3 ? 'grid-cols-3' :
                      'grid-cols-2'
                }`}>
                  {optimisticPost.mediaUrls.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative">
                      {renderMediaItem(url, index)}
                      {index === 3 && optimisticPost.mediaUrls.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <span className="text-white font-semibold">
                            +{optimisticPost.mediaUrls.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-4 sm:gap-6 pb-4">
            <button
              onClick={() => handleOptimisticReaction(optimisticPost.id, ReactionType.LIKE)}
              disabled={isReacting}
              className={`flex items-center gap-2 transition-colors disabled:opacity-70 ${
                optimisticPost.userReaction === ReactionType.LIKE
                  ? 'text-red-400'
                  : 'text-stone-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${
                optimisticPost.userReaction === ReactionType.LIKE ? 'fill-current' : ''
              } ${isReacting ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{optimisticPost.likeCount}</span>
            </button>

            <button
              onClick={() => toggleComments(optimisticPost.id)}
              className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm font-medium">{optimisticPost.commentCount}</span>
              {showComments[optimisticPost.id] ? (
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>

          {/* Comments Section */}
          {showComments[optimisticPost.id] && (
            <div className="border-t border-neutral-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-sm font-medium">
                  {optimisticPost.commentCount} Comment{optimisticPost.commentCount !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Add Comment */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex-shrink-0">
                  {getCurrentUserAvatar() ? (
                    <img
                      src={getCurrentUserAvatar()}
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {getCurrentUserInitials()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isCommenting}
                    className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        handleOptimisticComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleOptimisticComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCommenting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {loadingComments[optimisticPost.id] && !comments[optimisticPost.id] ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
                </div>
              ) : comments[optimisticPost.id] && comments[optimisticPost.id].length > 0 ? (
                <div className="space-y-1">
                  {comments[optimisticPost.id].map(renderComment)}

                  {/* Load More Comments */}
                  {hasMoreComments[optimisticPost.id] && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => loadMoreComments(optimisticPost.id)}
                        disabled={loadingComments[optimisticPost.id]}
                        className="text-fuchsia-400 text-sm font-medium hover:text-fuchsia-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingComments[optimisticPost.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fuchsia-400"></div>
                        ) : (
                          <>Load More Comments</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-stone-500 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        postID={optimisticPost.id}
        initialContent={optimisticPost.content}
        onSaveSuccess={(newContent) => {
          const updatedPost = { ...optimisticPost, content: newContent, isEdited: true };
          setOptimisticPost(updatedPost);
          props.onPostUpdate?.(updatedPost);
        }}
      />
    </>
  );
}
