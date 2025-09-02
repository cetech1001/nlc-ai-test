import {Heart, MessageCircle, MoreHorizontal, Send, ChevronDown, ChevronUp} from "lucide-react";
import {PostResponse, PostCommentResponse, ReactionType} from "@nlc-ai/sdk-community";
import React, {FC, useState} from "react";
import { formatTimeAgo, getInitials } from "@nlc-ai/web-utils";
import { sdkClient } from "@/lib";

interface IProps {
  post: PostResponse;
  handleReactToPost: (postID: string, reactionType: ReactionType) => void;
  handleAddComment: (postID: string, newComment: string) => void;
}

export const SinglePost: FC<IProps> = (props) => {
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{ [key: string]: PostCommentResponse[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});
  const [commentsPage, setCommentsPage] = useState<{ [key: string]: number }>({});
  const [hasMoreComments, setHasMoreComments] = useState<{ [key: string]: boolean }>({});

  const toggleComments = async (postID: string) => {
    const isCurrentlyShowing = showComments[postID];

    setShowComments(prev => ({
      ...prev,
      [postID]: !prev[postID]
    }));

    // If opening comments for the first time, load them
    if (!isCurrentlyShowing && !comments[postID]) {
      await loadComments(postID, 1);
    }
  };

  const loadComments = async (postID: string, page: number = 1) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postID]: true }));

      const response = await sdkClient.community.posts.getComments(postID, {page, limit: 10});

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
    } finally {
      setLoadingComments(prev => ({ ...prev, [postID]: false }));
    }
  };

  const loadMoreComments = async (postID: string) => {
    const currentPage = commentsPage[postID] || 1;
    await loadComments(postID, currentPage + 1);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await props.handleAddComment(props.post.id, newComment);
      setNewComment("");

      // Reload comments to show the new one
      await loadComments(props.post.id, 1);
    } catch (e) {
      console.error('Failed to add comment:', e);
    }
  };

  const handleReactToComment = async (commentID: string, reactionType: ReactionType) => {
    try {
      await sdkClient.community.posts.reactToComment(commentID, { type: reactionType });

      // Update local comment state
      setComments(prev => ({
        ...prev,
        [props.post.id]: (prev[props.post.id] || []).map(comment =>
          comment.id === commentID
            ? {
              ...comment,
              likeCount: comment.userReaction === reactionType
                ? comment.likeCount - 1
                : comment.likeCount + 1,
              userReaction: comment.userReaction === reactionType ? undefined : reactionType
            }
            : comment
        )
      }));
    } catch (error) {
      console.error('Failed to react to comment:', error);
    }
  };

  const renderComment = (comment: PostCommentResponse) => (
    <div key={comment.id} className="flex gap-3 py-3 border-b border-neutral-700/50 last:border-b-0">
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
            {formatTimeAgo(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-stone-500 text-xs">(edited)</span>
          )}
        </div>
        <p className="text-stone-200 text-sm leading-relaxed mb-2">
          {comment.content}
        </p>

        {/* Comment media */}
        {comment.mediaUrls && comment.mediaUrls.length > 0 && (
          <div className="mb-2">
            <img
              src={comment.mediaUrls[0]}
              alt="Comment media"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}

        {/* Comment actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleReactToComment(comment.id, ReactionType.LIKE)}
            className={`flex items-center gap-1 text-xs transition-colors ${
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
            <button className="text-stone-500 hover:text-fuchsia-400 text-xs">
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Show replies if any */}
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

  // Get current user avatar for comment input (this should come from user context)
  const getCurrentUserAvatar = () => {
    // This would typically come from a user context or current user state
    // For now, we'll use a default or the post author's avatar as fallback
    return props.post.communityMember?.userAvatarUrl;
  };

  const getCurrentUserInitials = () => {
    // This would typically come from a user context
    // For now, we'll use 'Y' for 'You' as placeholder
    return 'Y';
  };

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -left-4 sm:-left-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex-shrink-0">
            {props.post.communityMember?.userAvatarUrl ? (
              <img
                src={props.post.communityMember.userAvatarUrl}
                alt={props.post.communityMember.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getInitials(props.post.communityMember?.userName)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-sm sm:text-base font-semibold truncate">
                {props.post.communityMember?.userName || 'Unknown User'}
              </h3>
              {props.post.communityMember?.role && (
                <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium capitalize">
                  {props.post.communityMember.role}
                </span>
              )}
            </div>
            <p className="text-stone-400 text-xs sm:text-sm">
              {formatTimeAgo(props.post.createdAt)}
              {props.post.isEdited && <span className="ml-1">(edited)</span>}
            </p>
          </div>
          <button className="text-stone-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {props.post.content}
          </p>
        </div>

        {/* Post Media */}
        {props.post.mediaUrls && props.post.mediaUrls.length > 0 && (
          <div className="mb-4">
            {props.post.mediaUrls.length === 1 ? (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={props.post.mediaUrls[0]}
                  alt="Post content"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {props.post.mediaUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Post content ${index + 1}`}
                      className="w-full h-32 sm:h-48 object-cover"
                    />
                    {index === 3 && props.post.mediaUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          +{props.post.mediaUrls.length - 4}
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
            onClick={() => props.handleReactToPost(props.post.id, ReactionType.LIKE)}
            className={`flex items-center gap-2 transition-colors ${
              props.post.userReaction === ReactionType.LIKE
                ? 'text-red-400'
                : 'text-stone-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${
              props.post.userReaction === ReactionType.LIKE ? 'fill-current' : ''
            }`} />
            <span className="text-sm font-medium">{props.post.likeCount}</span>
          </button>

          <button
            onClick={() => toggleComments(props.post.id)}
            className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm font-medium">{props.post.commentCount}</span>
            {showComments[props.post.id] ? (
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>

        {/* Comments Section */}
        {showComments[props.post.id] && (
          <div className="border-t border-neutral-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-medium">
                {props.post.commentCount} Comment{props.post.commentCount !== 1 ? 's' : ''}
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
                  className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            {loadingComments[props.post.id] && !comments[props.post.id] ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
              </div>
            ) : comments[props.post.id] && comments[props.post.id].length > 0 ? (
              <div className="space-y-1">
                {comments[props.post.id].map(renderComment)}

                {/* Load More Comments */}
                {hasMoreComments[props.post.id] && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => loadMoreComments(props.post.id)}
                      disabled={loadingComments[props.post.id]}
                      className="text-fuchsia-400 text-sm font-medium hover:text-fuchsia-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingComments[props.post.id] ? (
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
  );
}
