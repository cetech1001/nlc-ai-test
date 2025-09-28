import React, { useState } from 'react';
import { Heart, MoreHorizontal, Send } from 'lucide-react';
import { PostCommentResponse, ReactionType } from '@nlc-ai/sdk-communities';
import { formatTimeAgo, getInitials } from '@nlc-ai/web-utils';
import { CommentActionsDropdown } from '@/lib';
import {UserProfile, UserType} from '@nlc-ai/types';

interface CommentBubbleProps {
  comment: PostCommentResponse & { isOptimistic?: boolean; tempID?: string };
  user: UserProfile | null;
  onReact: (commentID: string, reactionType: ReactionType) => void;
  onEdit: (commentID: string, content: string) => void;
  onDelete: (commentID: string) => void;
  onReply: (commentID: string) => void;
  onUserClick?: (userID: string, userType: UserType) => void;
  replyingTo?: boolean;
  replyText?: string;
  onReplyTextChange?: (text: string) => void;
  onSubmitReply?: () => void;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
                                                              comment,
                                                              user,
                                                              onReact,
                                                              onEdit,
                                                              onDelete,
                                                              onReply,
                                                              onUserClick,
                                                              replyingTo,
                                                              replyText,
                                                              onReplyTextChange,
                                                              onSubmitReply
                                                            }) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnComment = user?.id === comment.communityMember?.userID;

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
        {comment.communityMember?.userAvatarUrl ? (
          <img
            src={comment.communityMember.userAvatarUrl}
            alt={comment.communityMember.userName || "User"}
            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onUserClick?.(comment.communityMember?.userID!, comment.communityMember?.userType as UserType)}
          />
        ) : (
          <div
            className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onUserClick?.(comment.communityMember?.userID!, comment.communityMember?.userType as UserType)}
          >
            <span className="text-white text-xs font-semibold">
              {getInitials(comment.communityMember?.userName)}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className="relative">
          <div className="bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white text-sm font-medium">
                {comment.communityMember?.userName || 'Unknown User'}
              </h4>
              <span className="text-stone-400 text-xs">
                {comment.isOptimistic ? 'Just now' : formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && !comment.isOptimistic && (
                <span className="text-stone-400 text-xs">(edited)</span>
              )}
              {comment.isOptimistic && (
                <span className="text-stone-400 text-xs">(sending...)</span>
              )}
            </div>

            {/* Content */}
            <p className="text-stone-200 text-sm leading-relaxed">
              {comment.content}
            </p>

            {/* Media */}
            {comment.mediaUrls && comment.mediaUrls.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.mediaUrls.map((url, idx) => renderMediaItem(url, idx))}
              </div>
            )}
          </div>

          {/* Tail for bubble */}
          <div className="absolute top-2 -left-1 w-3 h-3 bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 transform rotate-45 rounded-sm"></div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-4 mt-2 ml-2">
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

          {comment.replyCount > 0 && (
            <button
              disabled={comment.isOptimistic}
              className="text-stone-500 hover:text-fuchsia-400 text-xs disabled:opacity-50"
            >
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          <button
            onClick={() => onReply(comment.id)}
            disabled={comment.isOptimistic}
            className="text-stone-500 hover:text-fuchsia-400 text-xs disabled:opacity-50"
          >
            Reply
          </button>

          {!comment.isOptimistic && (
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
                onReply={() => onReply(comment.id)}
                onReport={() => {}}
              />
            </div>
          )}
        </div>

        {/* Reply Input */}
        {replyingTo && (
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
                value={replyText || ''}
                onChange={(e) => onReplyTextChange?.(e.target.value)}
                className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-1 text-white placeholder:text-stone-400 text-xs focus:outline-none focus:border-fuchsia-500"
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    onSubmitReply?.();
                  }
                }}
              />
              <button
                onClick={onSubmitReply}
                disabled={!replyText?.trim()}
                className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-2 py-1 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l border-neutral-700/50 space-y-2">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex-shrink-0">
                  {reply.communityMember?.userAvatarUrl ? (
                    <img
                      src={reply.communityMember.userAvatarUrl}
                      alt={reply.communityMember.userName || "User"}
                      className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onUserClick?.(reply.communityMember?.userID!, reply.communityMember?.userType as UserType)}
                    />
                  ) : (
                    <div
                      className="w-6 h-6 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onUserClick?.(reply.communityMember?.userID!, reply.communityMember?.userType as UserType)}
                    >
                      <span className="text-white text-xs">
                        {getInitials(reply.communityMember?.userName)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-neutral-700/20 to-neutral-800/20 rounded-xl rounded-tl-sm px-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-white text-xs font-medium">
                        {reply.communityMember?.userName || 'Unknown User'}
                      </span>
                      <span className="text-stone-400 text-xs">
                        {formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-stone-200 text-xs">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
