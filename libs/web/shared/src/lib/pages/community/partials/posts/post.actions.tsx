import React from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ReactionType } from '@nlc-ai/sdk-communities';

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  userReaction?: ReactionType;
  isReacting: boolean;
  showComments: boolean;
  onReact: (reactionType: ReactionType) => void;
  onToggleComments: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  likeCount,
  commentCount,
  userReaction,
  isReacting,
  showComments,
  onReact,
  onToggleComments
}) => {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <button
        onClick={() => onReact(ReactionType.LIKE)}
        disabled={isReacting}
        className={`flex items-center gap-2 transition-colors disabled:opacity-70 ${
          userReaction === ReactionType.LIKE
            ? 'text-red-400'
            : 'text-stone-400 hover:text-red-400'
        }`}
      >
        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${
          userReaction === ReactionType.LIKE ? 'fill-current' : ''
        } ${isReacting ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>

      <button
        onClick={onToggleComments}
        className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm font-medium">{commentCount}</span>
        {showComments ? (
          <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : (
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
      </button>
    </div>
  );
};
