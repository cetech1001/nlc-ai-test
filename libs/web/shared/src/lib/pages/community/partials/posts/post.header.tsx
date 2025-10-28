import React, { useRef, useState } from 'react';
import { MoreHorizontal, Pin } from 'lucide-react';
import { PostResponse } from '@nlc-ai/sdk-communities';
import { formatTimeAgo, getInitials } from '@nlc-ai/web-utils';
import { PostActionsDropdown } from './post-actions.dropdown';
import { UserType } from '@nlc-ai/types';

interface PostHeaderProps {
  post: PostResponse;
  isOwnPost: boolean;
  canModerate: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onReport: () => void;
  onTogglePin: () => void;
  onUserClick?: (userID: string, userType: UserType) => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
                                                        post,
                                                        isOwnPost,
                                                        canModerate,
                                                        onEdit,
                                                        onDelete,
                                                        onCopyLink,
                                                        onReport,
                                                        onTogglePin,
                                                        onUserClick
                                                      }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLButtonElement>(null);

  // Display "Admin" if the post is from an admin
  const displayName = post.communityMember?.userType === UserType.ADMIN
    ? 'Admin'
    : (post.communityMember?.userName || 'Unknown User');

  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onUserClick?.(post.communityMember?.userID || '', post.communityMember?.userType as UserType)}
      >
        {post.communityMember?.userAvatarUrl ? (
          <img
            src={post.communityMember.userAvatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getInitials(displayName)}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-sm sm:text-base font-semibold truncate">
            {displayName}
          </h3>
          {post.communityMember?.role && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium capitalize">
              {post.communityMember.role}
            </span>
          )}
          {post.isPinned && (
            <span className="flex items-center gap-1 px-2 py-1 bg-fuchsia-600/20 text-fuchsia-400 rounded text-xs font-medium">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}
        </div>
        <p className="text-stone-400 text-xs sm:text-sm">
          {formatTimeAgo(post.createdAt)}
          {post.isEdited && <span className="ml-1">(edited)</span>}
        </p>
      </div>
      <div className="relative">
        <button
          ref={actionsRef}
          onClick={() => setShowActions(!showActions)}
          className="text-stone-400 hover:text-white transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <PostActionsDropdown
          isOpen={showActions}
          onClose={() => setShowActions(false)}
          isOwnPost={isOwnPost}
          canModerate={canModerate}
          isPinned={post.isPinned || false}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopyLink={onCopyLink}
          onReport={onReport}
          onTogglePin={onTogglePin}
        />
      </div>
    </div>
  );
};
