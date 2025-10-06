import React, { useState } from 'react';
import { Heart, MoreHorizontal, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { PostCommentResponse, ReactionType } from '@nlc-ai/sdk-communities';
import { formatTimeAgo, getInitials } from '@nlc-ai/web-utils';
import { CommentActionsDropdown } from './comment-actions.dropdown';
import { UserProfile, UserType } from '@nlc-ai/types';

interface CommentBubbleProps {
  comment: PostCommentResponse & { isOptimistic?: boolean; tempID?: string };
  user: UserProfile | null;
  depth?: number;
  maxDepth?: number;
  onReact: (commentID: string, reactionType: ReactionType) => void;
  onEdit: (commentID: string, content: string) => void;
  onDelete: (commentID: string) => void;
  onReply: (commentID: string) => void;
  onLoadReplies: (commentID: string, depth: number) => void;
  onUserClick?: (userID: string, userType: UserType) => void;
  replyingTo?: { [key: string]: boolean };
  replyText?: { [key: string]: string };
  onReplyTextChange?: (commentID: string, text: string) => void;
  onSubmitReply?: (commentID: string) => void;
  replies?: PostCommentResponse[];
  repliesExpanded?: { [key: string]: boolean };
  isLoadingReplies?: { [key: string]: boolean };
  repliesData?: { [key: string]: PostCommentResponse[] };
  isReactionsDisabled?: boolean;
  isDetailView?: boolean;
  onViewAllComments?: () => void;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
                                                              comment,
                                                              user,
                                                              depth = 0,
                                                              maxDepth = 3,
                                                              onReact,
                                                              onEdit,
                                                              onDelete,
                                                              onReply,
                                                              onLoadReplies,
                                                              onUserClick,
                                                              replyingTo = {},
                                                              replyText = {},
                                                              onReplyTextChange,
                                                              onSubmitReply,
                                                              repliesExpanded = {},
                                                              isLoadingReplies = {},
                                                              repliesData = {},
                                                              isReactionsDisabled = false,
                                                              onViewAllComments,
                                                              isDetailView = false,
                                                            }) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnComment = user?.id === comment.communityMember?.userID;
  const isDeleted = comment.isDeleted;
  const isReplyingToThis = replyingTo[comment.id];
  const currentReplyText = replyText[comment.id] || '';
  const isExpanded = repliesExpanded[comment.id];
  const isLoading = isLoadingReplies[comment.id];
  const nestedReplies = repliesData[comment.id] || [];
  const isAtMaxDepth = isDetailView ? false : depth >= maxDepth;

  const handleLoadRepliesClick = () => {
    if (isAtMaxDepth && onViewAllComments) {
      onViewAllComments();
    } else {
      onLoadReplies(comment.id, depth);
    }
  };

  const renderMediaItem = (url: string, index: number) => {
    const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('video');

    if (isVideo) {
      return (
        <video
          key={index}
          className="max-w-xs rounded-lg"
          controls
          preload="metadata"
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        key={index}
        src={url}
        alt={`Comment media ${index + 1}`}
        className="max-w-xs rounded-lg object-contain"
        style={{ maxHeight: '200px' }}
      />
    );
  };

  const getCurrentUserAvatar = () => user?.avatarUrl || '';
  const getCurrentUserInitials = () => getInitials(user?.firstName + ' ' + user?.lastName);

  return (
    <div className={`flex gap-3 py-3 ${comment.isOptimistic ? 'opacity-70' : ''}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex-shrink-0">
        {!isDeleted && comment.communityMember?.userAvatarUrl ? (
          <img
            src={comment.communityMember.userAvatarUrl}
            alt={comment.communityMember.userName || "User"}
            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onUserClick?.(comment.communityMember?.userID!, comment.communityMember?.userType as UserType)}
          />
        ) : (
          <div
            className={`w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center ${!isDeleted ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={() => !isDeleted && onUserClick?.(comment.communityMember?.userID!, comment.communityMember?.userType as UserType)}
          >
            <span className="text-white text-xs font-semibold">
              {isDeleted ? '?' : getInitials(comment.communityMember?.userName)}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className="relative">
          <div className={`bg-gradient-to-r rounded-2xl rounded-tl-sm px-4 py-3 max-w-md ${
            isDeleted ? 'from-neutral-700/20 to-neutral-800/20' : 'from-neutral-700/30 to-neutral-800/30'
          }`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm font-medium ${isDeleted ? 'text-stone-500' : 'text-white'}`}>
                {isDeleted ? 'N/A' : comment.communityMember?.userName || 'Unknown User'}
              </h4>
              <span className="text-stone-400 text-xs">
                {comment.isOptimistic ? 'Just now' : formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && !comment.isOptimistic && !isDeleted && (
                <span className="text-stone-400 text-xs">(edited)</span>
              )}
              {comment.isOptimistic && (
                <span className="text-stone-400 text-xs">(sending...)</span>
              )}
            </div>

            {/* Content */}
            <p className={`text-sm leading-relaxed ${isDeleted ? 'text-stone-500 italic' : 'text-stone-200'}`}>
              {isDeleted ? 'This reply was deleted by the author' : comment.content}
            </p>

            {/* Media */}
            {!isDeleted && comment.mediaUrls && comment.mediaUrls.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.mediaUrls.map((url, idx) => renderMediaItem(url, idx))}
              </div>
            )}
          </div>

          {/* Tail for bubble */}
          <div className={`absolute top-2 -left-1 w-3 h-3 bg-gradient-to-r transform rotate-45 rounded-sm ${
            isDeleted ? 'from-neutral-700/20 to-neutral-800/20' : 'from-neutral-700/30 to-neutral-800/30'
          }`}></div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-4 mt-2 ml-2">
          {!isDeleted && !isReactionsDisabled && (
            <button
              onClick={() => !comment.isOptimistic && onReact(comment.id, ReactionType.LIKE)}
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
          )}

          {comment.replyCount > 0 && (
            <button
              onClick={handleLoadRepliesClick}
              disabled={comment.isOptimistic || isLoading}
              className="flex items-center gap-1 text-stone-500 hover:text-fuchsia-400 text-xs disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-fuchsia-400"></div>
              ) : isAtMaxDepth ? (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>View in post</span>
                </>
              ) : isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {!isAtMaxDepth && (
                <span>
                  {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </button>
          )}

          {!isDeleted && !isReactionsDisabled && !isAtMaxDepth && (
            <button
              onClick={() => onReply(comment.id)}
              disabled={comment.isOptimistic}
              className="text-stone-500 hover:text-fuchsia-400 text-xs disabled:opacity-50"
            >
              Reply
            </button>
          )}

          {!comment.isOptimistic && !isDeleted && (
            <div className="relative ml-auto">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
              <CommentActionsDropdown
                isOpen={showActions}
                onClose={() => setShowActions(false)}
                isOwnComment={isOwnComment}
                onEdit={() => onEdit(comment.id, comment.content)}
                onDelete={() => onDelete(comment.id)}
                onReport={() => {}}
              />
            </div>
          )}
        </div>

        {/* Reply Input */}
        {isReplyingToThis && !isDeleted && !isAtMaxDepth && (
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
                value={currentReplyText}
                onChange={(e) => onReplyTextChange?.(comment.id, e.target.value)}
                className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-1 text-white placeholder:text-stone-400 text-xs focus:outline-none focus:border-fuchsia-500"
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && currentReplyText.trim()) {
                    onSubmitReply?.(comment.id);
                  }
                }}
              />
              <button
                onClick={() => onSubmitReply?.(comment.id)}
                disabled={!currentReplyText.trim()}
                className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-2 py-1 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {isExpanded && nestedReplies.length > 0 && !isAtMaxDepth && (
          <div className="mt-3 pl-4 border-l border-neutral-700/50 space-y-2">
            {nestedReplies.map(reply => (
              <CommentBubble
                key={reply.id}
                comment={reply}
                user={user}
                depth={depth + 1}
                maxDepth={maxDepth}
                onReact={onReact}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                onLoadReplies={onLoadReplies}
                onUserClick={onUserClick}
                replyingTo={replyingTo}
                replyText={replyText}
                onReplyTextChange={onReplyTextChange}
                onSubmitReply={onSubmitReply}
                repliesExpanded={repliesExpanded}
                isLoadingReplies={isLoadingReplies}
                repliesData={repliesData}
                isReactionsDisabled={isDeleted || isReactionsDisabled}
                onViewAllComments={onViewAllComments}
                isDetailView={isDetailView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
