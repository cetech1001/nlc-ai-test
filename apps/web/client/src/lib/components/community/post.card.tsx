'use client'

import {useState} from "react";
import {Heart, MessageCircle, Pin} from "lucide-react";

export const PostCard = ({ post }: any) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev: number) => prev - 1);
    } else {
      setLikeCount((prev: number) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-dark-600 card-gradient">
      {/* Glow Effect */}
      <div className="glow-circle absolute left-[30px] -bottom-[101px]" />

      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-dark-900 truncate">{post.author.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-dark-900/60 text-sm sm:text-base">
                <span>{post.date}</span>
                <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full" />
                <span>{post.category}</span>
              </div>
            </div>
          </div>
          {post.isPinned && (
            <div className="flex items-center gap-2 sm:gap-3.5">
              <Pin className="w-5 h-5 sm:w-6 sm:h-6 text-purple" />
              <span className="text-base sm:text-lg font-semibold text-purple">Pinned</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-dark-900 leading-tight">
            {post.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-dark-900 leading-6 sm:leading-7 lg:leading-8">
            {post.content}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 sm:gap-3.5 hover:opacity-70 transition-opacity"
            >
              <Heart
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                  isLiked ? 'text-red-500 fill-red-500' : 'text-dark-900'
                }`}
              />
              <span className="text-base sm:text-lg font-semibold text-dark-800">{likeCount}</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3.5">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-dark-900" />
              <span className="text-base sm:text-lg font-semibold text-dark-800">{post.comments}</span>
            </div>
          </div>

          {!post.isPinned && (
            <button className="flex items-center gap-2 sm:gap-3.5 text-dark-800 hover:text-purple transition-colors">
              <Pin className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg font-semibold">Pin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
