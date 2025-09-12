'use client'

import {useState} from "react";

export const PostInput = ({ userAvatar, onPostCreate }: any) => {
  const [postText, setPostText] = useState('');

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && postText.trim()) {
      onPostCreate?.(postText);
      setPostText('');
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-white/20 bg-[#171717]">
      <img
        src={userAvatar}
        alt="User"
        className="w-6 h-6 sm:w-[30px] sm:h-[30px] rounded-lg object-cover flex-shrink-0"
      />
      <input
        type="text"
        placeholder="Write something"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 bg-transparent text-white placeholder-white/50 text-sm sm:text-base outline-none"
      />
    </div>
  );
};
