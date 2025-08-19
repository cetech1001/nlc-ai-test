import {Heart, MessageCircle, MoreHorizontal, Send} from "lucide-react";
import {Post, ReactionType} from "@nlc-ai/sdk-community";
import React, {FC, useState} from "react";
import { formatTimeAgo } from "@nlc-ai/web-utils";

interface IProps {
  post: Post;
  likedPosts: Set<string>;
  handleReactToPost: (postID: string, reactionType: ReactionType) => void;
  handleAddComment: (postID: string, newComment: string) => void;
}

export const SinglePost: FC<IProps> = (props) => {
  const [showComments, setShowComments] = useState<any>({});
  const [newComment, setNewComment] = useState('');

  const toggleComments = (postID: string) => {
    setShowComments((prev: any) => ({
      ...prev,
      [postID]: !prev[postID]
    }));
  };

  const handleAddComment = () => {
    try {
      props.handleAddComment(props.post.id, newComment);
      setNewComment("");
    } catch (e) {

    }
  }

  return (
    <div key={props.post.id} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10 p-6">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {props.post.authorName ? props.post.authorName.charAt(0).toUpperCase() : 'C'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-base font-semibold">
              {props.post.authorName || 'Coach Member'}
            </h3>
            <p className="text-stone-400 text-sm">{formatTimeAgo(props.post.createdAt)}</p>
          </div>
          <button className="text-stone-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <p className="text-white text-base leading-relaxed mb-4">
          {props.post.content}
        </p>

        {/* Post Images */}
        {props.post.mediaUrls && props.post.mediaUrls.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={props.post.mediaUrls[0]}
              alt="Post content"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 pb-4">
          <button
            onClick={() => props.handleReactToPost(props.post.id, ReactionType.LIKE)}
            className={`flex items-center gap-2 transition-colors ${
              props.post.userReaction === ReactionType.LIKE || props.likedPosts.has(props.post.id)
                ? 'text-red-400'
                : 'text-stone-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${
              props.post.userReaction === ReactionType.LIKE || props.likedPosts.has(props.post.id) ? 'fill-current' : ''
            }`} />
            <span className="text-sm font-medium">{props.post.likeCount}</span>
          </button>
          <button
            onClick={() => toggleComments(props.post.id)}
            className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{props.post.commentCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments[props.post.id] && (
          <div className="border-t border-neutral-700 pt-4">
            <p className="text-white text-sm font-medium mb-4">{props.post.commentCount} Comments</p>

            {/* Add Comment */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">Y</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add Comment"
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
                  className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Load Comments Button */}
            <button className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors">
              Load Comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
