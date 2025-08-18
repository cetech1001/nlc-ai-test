'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Search,
  Camera,
  Image,
  Smile,
  // Send,
  // Plus
} from "lucide-react";

const VaultPage = () => {
  const router = useRouter();
  // const [activeChat, setActiveChat] = useState<any>(null);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<any>({});
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const posts = [
    {
      id: 1,
      author: "Jane Cooper",
      avatar: "/api/placeholder/40/40",
      time: "5 min ago",
      content: "The mind is like water. When it's still, it reflects clarity. When it's turbulent, it distorts reality. Find your stillness. 🧘",
      likes: 364,
      comments: 120,
      hasImage: false
    },
    {
      id: 2,
      author: "Jenny Wilson",
      avatar: "/api/placeholder/40/40",
      time: "20 min ago",
      content: "Breathe in positivity, exhale doubt. Let today be filled with energy and light. ✨✨",
      likes: 1200,
      comments: 563,
      hasImage: true,
      image: "/api/placeholder/600/400"
    },
    {
      id: 3,
      author: "Cody Fisher",
      avatar: "/api/placeholder/40/40",
      time: "45 min ago",
      content: "Just finished my morning workout routine! Feeling energized and ready to tackle the day. Remember, consistency is key! 💪",
      likes: 892,
      comments: 234,
      hasImage: false
    }
  ];

  const chats = [
    { id: 1, name: "Floyd Miles", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 2, name: "Eleanor Pena", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 3, name: "Esther Howard", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: false },
    { id: 4, name: "Jane Cooper", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 5, name: "Brooklyn Simmons", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: false },
    { id: 6, name: "Cody Fisher", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 7, name: "Leslie Alexander", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: false },
    { id: 8, name: "Jenny Wilson", avatar: "/api/placeholder/32/32", lastMessage: "Sent a photo", time: "5 min ago", online: true }
  ];

  const sampleComments = [
    { id: 1, author: "Devon Lane", avatar: "/api/placeholder/32/32", content: "Wow! What a great thought.", time: "5 min ago", likes: 25 },
    { id: 2, author: "Cameron Williamson", avatar: "/api/placeholder/32/32", content: "I would be really interested to know your approach to fitness.", time: "5 min ago", likes: 40 }
  ];

  const toggleComments = (postID: number) => {
    setShowComments((prev: any) => ({
      ...prev,
      [postID]: !prev[postID]
    }));
  };

  const toggleLike = (postID: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postID)) {
        newLiked.delete(postID);
      } else {
        newLiked.add(postID);
      }
      return newLiked;
    });
  };

  const handleChatClick = (chat: any) => {
    router.push(`/chat?user=${chat.id}`);
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 max-w-full overflow-hidden">
      <div className="flex gap-6 h-full">
        {/* Main Feed */}
        <div className="flex-1 max-w-2xl">
          {/* New Post Input */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden mb-6">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>
            <div className="relative z-10 p-6">
              <input
                type="text"
                placeholder="Start a new post"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-3 text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-fuchsia-500 text-base"
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
                <button className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>

                <div className="relative z-10 p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-full object-cover border-2 border-fuchsia-400/30"
                    />
                    <div className="flex-1">
                      <h3 className="text-white text-base font-semibold">{post.author}</h3>
                      <p className="text-stone-400 text-sm">{post.time}</p>
                    </div>
                    <button className="text-stone-400 hover:text-white transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-white text-base leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {/* Post Image */}
                  {post.hasImage && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pb-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-400'
                          : 'text-stone-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="border-t border-neutral-700 pt-4">
                      <p className="text-white text-sm font-medium mb-4">{post.comments} Comments</p>

                      {/* Add Comment */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src="/api/placeholder/32/32"
                          alt="Your avatar"
                          className="w-8 h-8 rounded-full object-cover border border-fuchsia-400/30"
                        />
                        <input
                          type="text"
                          placeholder="Add Comment"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
                        />
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {sampleComments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <img
                              src={comment.avatar}
                              alt={comment.author}
                              className="w-8 h-8 rounded-full object-cover border border-fuchsia-400/30"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white text-sm font-medium">{comment.author}</h4>
                                <span className="text-stone-500 text-xs">{comment.time}</span>
                              </div>
                              <p className="text-stone-300 text-sm mb-2">{comment.content}</p>
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-stone-500 hover:text-red-400 transition-colors">
                                  <Heart className="w-3 h-3" />
                                  <span className="text-xs">{comment.likes}</span>
                                </button>
                                <button className="text-stone-500 hover:text-fuchsia-400 transition-colors text-xs">
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button className="text-orange-400 text-sm font-medium mt-3 hover:text-orange-300 transition-colors">
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden h-fit">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10 p-6">
            <h2 className="text-white text-xl font-semibold mb-6">Chats</h2>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search chats using name..."
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Chat List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover border border-fuchsia-400/30"
                    />
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white text-sm font-medium truncate">{chat.name}</h3>
                      <button className="text-stone-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-stone-400 text-xs truncate">{chat.lastMessage}</p>
                      <span className="text-stone-500 text-xs">{chat.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultPage;
