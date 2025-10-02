import React from 'react';
import { Send } from 'lucide-react';
import { getInitials } from '@nlc-ai/web-utils';
import {UserProfile} from "@nlc-ai/types";

interface CommentInputProps {
  user: UserProfile | null;
  newComment: string;
  isCommenting: boolean;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  user,
  newComment,
  isCommenting,
  onCommentChange,
  onSubmitComment
}) => {
  const getCurrentUserAvatar = () => user?.avatarUrl || '';
  const getCurrentUserInitials = () => getInitials(user?.firstName + ' ' + user?.lastName);

  return (
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
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={isCommenting}
          className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              onSubmitComment();
            }
          }}
        />
        <button
          onClick={onSubmitComment}
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
  );
};
