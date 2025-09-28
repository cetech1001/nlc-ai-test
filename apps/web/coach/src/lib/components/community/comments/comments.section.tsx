import React from 'react';
import { PostCommentResponse, ReactionType } from '@nlc-ai/sdk-communities';
import {UserProfile, UserType} from '@nlc-ai/types';
import { CommentBubble, CommentInput } from '@/lib';

interface CommentsSectionProps {
  postID: string;
  comments: (PostCommentResponse & { isOptimistic?: boolean; tempID?: string })[];
  commentCount: number;
  user: UserProfile | null;
  isLoading: boolean;
  hasMore: boolean;
  newComment: string;
  isCommenting: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  onReactToComment: (commentID: string, reactionType: ReactionType) => void;
  onEditComment: (commentID: string, content: string) => void;
  onDeleteComment: (commentID: string) => void;
  onReplyToComment: (commentID: string) => void;
  onLoadMore: () => void;
  onUserClick?: (userID: string, userType: UserType) => void;
  replyingTo: { [key: string]: boolean };
  replyText: { [key: string]: string };
  onReplyTextChange: (commentID: string, text: string) => void;
  onSubmitReply: (commentID: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
                                                                  postID,
                                                                  comments,
                                                                  commentCount,
                                                                  user,
                                                                  isLoading,
                                                                  hasMore,
                                                                  newComment,
                                                                  isCommenting,
                                                                  onCommentChange,
                                                                  onSubmitComment,
                                                                  onReactToComment,
                                                                  onEditComment,
                                                                  onDeleteComment,
                                                                  onReplyToComment,
                                                                  onLoadMore,
                                                                  onUserClick,
                                                                  replyingTo,
                                                                  replyText,
                                                                  onReplyTextChange,
                                                                  onSubmitReply
                                                                }) => {
  return (
    <div className="border-t border-neutral-700 pt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white text-sm font-medium">
          {commentCount} Comment{commentCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Add Comment */}
      <CommentInput
        user={user}
        newComment={newComment}
        isCommenting={isCommenting}
        onCommentChange={onCommentChange}
        onSubmitComment={onSubmitComment}
      />

      {/* Comments List */}
      {isLoading && !comments.length ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-1">
          {comments.map(comment => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              user={user}
              onReact={onReactToComment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              onReply={onReplyToComment}
              onUserClick={onUserClick}
              replyingTo={replyingTo[comment.id]}
              replyText={replyText[comment.id]}
              onReplyTextChange={(text: string) => onReplyTextChange(comment.id, text)}
              onSubmitReply={() => onSubmitReply(comment.id)}
            />
          ))}

          {/* Load More Comments */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="text-fuchsia-400 text-sm font-medium hover:text-fuchsia-300 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
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
  );
};
