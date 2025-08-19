import {Camera, Image, Send, Smile} from "lucide-react";
import React, {FC, useState} from "react";

interface IProps {
  handleCreatePost: (post: string) => void;
}

export const NewPost: FC<IProps> = (props) => {
  const [newPost, setNewPost] = useState('');

  const handleCreatePost = () => {
    try {
      props.handleCreatePost(newPost);
      setNewPost('');
    } catch (e) {

    }
  }

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden mb-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>
      <div className="relative z-10 p-6">
        <textarea
          placeholder="Share your coaching insights with fellow coaches..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows={3}
          className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-3 text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-fuchsia-500 text-base resize-none"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <button className="text-stone-400 hover:text-fuchsia-400 transition-colors">
              <Image className="w-5 h-5" />
            </button>
            <button className="text-stone-400 hover:text-fuchsia-400 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
            <button className="text-stone-400 hover:text-fuchsia-400 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleCreatePost}
            disabled={!newPost.trim()}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
