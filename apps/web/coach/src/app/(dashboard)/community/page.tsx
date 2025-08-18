'use client'

import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  ArrowLeft,
  MoreHorizontal,
  Search,
  Camera,
  Image,
  Smile,
  Users,
  Calendar,
  Trophy,
  Zap,
  Clock,
  Star,
  UserPlus,
  Activity,
  ArrowRight,
  CheckCircle,
  Lock,
  Globe, TrendingUp
} from 'lucide-react';

// Set this to false when you want to show the actual community features
const SHOW_LANDING_PAGE = true;

const CommunityLanding = () => {
  const [activeFeature, setActiveFeature] = useState('discussions');

  const features = [
    {
      id: 'discussions',
      icon: MessageCircle,
      title: "Discussion Forums",
      description: "Create dedicated spaces for your clients to connect and support each other",
      benefits: [
        "Topic-based discussion threads",
        "Q&A sections with expert answers",
        "Private group discussions",
        "Moderation tools and community guidelines"
      ]
    },
    {
      id: 'events',
      icon: Calendar,
      title: "Community Events",
      description: "Host virtual events, workshops, and group coaching sessions",
      benefits: [
        "Event scheduling and calendar integration",
        "Live streaming and video conferencing",
        "Recording and replay capabilities",
        "RSVP management and notifications"
      ]
    },
    {
      id: 'achievements',
      icon: Trophy,
      title: "Achievement System",
      description: "Gamify the community experience with badges, levels, and rewards",
      benefits: [
        "Custom achievement badges",
        "Progress tracking and milestones",
        "Leaderboards and competitions",
        "Reward system integration"
      ]
    }
  ];

  const stats = [
    { label: "Client Engagement", value: "+85%", icon: Activity },
    { label: "Retention Rate", value: "+70%", icon: Heart },
    { label: "Community Growth", value: "3x Faster", icon: TrendingUp },
  ];

  const communityTypes = [
    {
      icon: Lock,
      title: "Private Community",
      description: "Exclusive space for your paying clients",
      features: ["Invitation-only access", "Premium content sharing", "Direct coach interaction"]
    },
    {
      icon: Globe,
      title: "Public Community",
      description: "Open community to attract new clients",
      features: ["Public discussions", "Lead generation", "Brand building"]
    },
    {
      icon: Star,
      title: "Tiered Access",
      description: "Different levels based on membership",
      features: ["VIP sections", "Graduated access", "Exclusive content"]
    }
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Client Community Platform
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Build thriving communities around your coaching programs. Foster connections,
            increase engagement, and create lasting relationships between your clients.
          </p>

          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-400/30 rounded-full text-fuchsia-300 text-lg font-medium">
            <Clock className="w-5 h-5" />
            Coming Soon - Private Beta Q2 2025
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-stone-300">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Types */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Community Style</h2>
          <p className="text-stone-300 text-lg">Flexible options to match your coaching business model</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityTypes.map((type, index) => (
            <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-fuchsia-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                <p className="text-stone-300 mb-4">{type.description}</p>

                <div className="space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-stone-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need for a Thriving Community</h2>
          <p className="text-stone-300 text-lg">Powerful tools to foster engagement and build lasting connections</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeFeature === feature.id
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                  : 'bg-neutral-800/50 text-stone-300 hover:bg-neutral-700/50'
              }`}
            >
              <feature.icon className="w-4 h-4" />
              {feature.title}
            </button>
          ))}
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`${activeFeature === feature.id ? 'block' : 'hidden'}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  </div>

                  <p className="text-stone-300 text-lg mb-6">{feature.description}</p>

                  <div className="space-y-3">
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-stone-200">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Benefits */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Why Communities Work</h4>

              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium">Increased Retention</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Clients with community access are 70% more likely to complete programs and continue long-term.
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Peer Support</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Community members support each other, reducing your individual support burden.
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Viral Growth</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Happy community members become your best advocates, bringing in referrals naturally.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-lg">
                <p className="text-purple-300 text-sm font-medium mb-2">Success Story</p>
                <p className="text-stone-300 text-sm">
                  "Our community has become the heart of our coaching business. Clients stay longer, refer more, and achieve better results together."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Ready to Build Your Community?</h3>
        <p className="text-stone-300 text-lg">
          Join our private beta and be among the first to create thriving client communities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            Request Beta Access
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 border border-neutral-600 text-stone-300 rounded-lg hover:border-fuchsia-400 hover:text-white transition-colors">
            See Examples
          </button>
        </div>
      </div>
    </div>
  );
};

const CommunityPage = () => {
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<any>({});
  const [newComment, setNewComment] = useState('');

  if (SHOW_LANDING_PAGE) {
    return <CommunityLanding />;
  }

  const posts = [
    {
      id: 1,
      author: "Jane Cooper",
      avatar: "JC",
      time: "5 min ago",
      content: "The mind is like water. When it's still, it reflects clarity. When it's turbulent, it distorts reality. Find your stillness. 🧘",
      likes: 364,
      comments: 120,
      hasImage: false
    },
    {
      id: 2,
      author: "Jenny Wilson",
      avatar: "JW",
      time: "20 min ago",
      content: "Breathe in positivity, exhale doubt. Let today be filled with energy and light. ✨✨",
      likes: 1200,
      comments: 563,
      hasImage: true,
      image: "https://images.unsplash.com/photo-1506629905774-11c1aeacc6a2?w=600&h=400&fit=crop"
    },
    {
      id: 3,
      author: "Cody Fisher",
      avatar: "CF",
      time: "45 min ago",
      content: "Just finished my morning workout routine! Feeling energized and ready to tackle the day. Remember, consistency is key! 💪",
      likes: 892,
      comments: 234,
      hasImage: false
    }
  ];

  const chats = [
    { id: 1, name: "Floyd Miles", avatar: "FM", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 2, name: "Eleanor Pena", avatar: "EP", lastMessage: "Sent a photo", time: "3 min ago", online: true },
    { id: 3, name: "Esther Howard", avatar: "EH", lastMessage: "Sent a photo", time: "5 min ago", online: false },
    { id: 4, name: "Jane Cooper", avatar: "JC", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 5, name: "Brooklyn Simmons", avatar: "BS", lastMessage: "Sent a photo", time: "5 min ago", online: false },
    { id: 6, name: "Cody Fisher", avatar: "CF", lastMessage: "Sent a photo", time: "5 min ago", online: true },
    { id: 7, name: "Leslie Alexander", avatar: "LA", lastMessage: "Sent a photo", time: "5 min ago", online: false },
    { id: 8, name: "Jenny Wilson", avatar: "JW", lastMessage: "Sent a photo", time: "5 min ago", online: true }
  ];

  const messages = [
    { id: 1, sender: "Eleanor Pena", content: "Hi, How are you doing?", time: "12:10 PM", isOwn: false },
    { id: 2, sender: "Me", content: "Hi, I'm fine. How are you?", time: "12:12 PM", isOwn: true },
    { id: 3, sender: "Me", content: "Thanks, That's very nice of you.", time: "12:12 PM", isOwn: true },
    { id: 4, sender: "Eleanor Pena", content: "I saw your post about fitness mindset and was really impressed by it.", time: "12:12 PM", isOwn: false, hasImage: true },
    { id: 5, sender: "Eleanor Pena", content: "Where did you get this image.", time: "12:12 PM", isOwn: false },
    { id: 6, sender: "Eleanor Pena", content: "It's really encompasses the context of the post.", time: "12:12 PM", isOwn: false },
    { id: 7, sender: "Me", content: "Thanks. I got it from Shutterstock.", time: "12:12 PM", isOwn: true }
  ];

  const sampleComments = [
    { id: 1, author: "Devon Lane", avatar: "DL", content: "Wow! What a great thought.", time: "5 min ago", likes: 25 },
    { id: 2, author: "Cameron Williamson", avatar: "CW", content: "I would be really interested to know your approach to fitness.", time: "5 min ago", likes: 40 }
  ];

  const toggleComments = (postID: string) => {
    setShowComments((prev: any) => ({
      ...prev,
      [postID]: !prev[postID]
    }));
  };

  const PostCard = ({ post }: any) => (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden mb-6">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10 p-6">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{post.avatar}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-stone-50 text-base font-semibold">{post.author}</h3>
            <p className="text-stone-400 text-sm">{post.time}</p>
          </div>
          <button className="text-stone-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <p className="text-stone-50 text-base leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Post Image */}
        {post.hasImage && post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 mb-4">
          <button className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
          <button
            onClick={() => toggleComments(post.id)}
            className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          <button className="flex items-center gap-2 text-stone-400 hover:text-fuchsia-400 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments[post.id] && (
          <div className="border-t border-neutral-700 pt-4">
            <p className="text-stone-50 text-sm font-medium mb-4">{post.comments} Comments</p>

            {/* Add Comment */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">ME</span>
              </div>
              <input
                type="text"
                placeholder="Add Comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-stone-50 placeholder:text-stone-500 text-sm focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {sampleComments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{comment.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-stone-50 text-sm font-medium">{comment.author}</h4>
                      <span className="text-stone-500 text-xs">{comment.time}</span>
                    </div>
                    <p className="text-stone-300 text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-stone-500 hover:text-fuchsia-400 transition-colors">
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

            <button className="text-fuchsia-400 text-sm font-medium mt-3 hover:text-fuchsia-300 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ChatWindow = ({ chat } : any) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[600px] bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-[20px] border border-neutral-700 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-700">
          <button
            onClick={() => setActiveChat(null)}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{chat.avatar}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-stone-50 text-base font-semibold">{chat.name}</h3>
            <p className="text-stone-400 text-sm">Online</p>
          </div>
          <button className="text-stone-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[480px]">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                <div className="text-xs text-stone-500 mb-1 text-right">
                  {message.sender} • {message.time}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.isOwn
                    ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                    : 'bg-neutral-700 text-stone-50'
                }`}>
                  {message.hasImage && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&h=150&fit=crop"
                        alt="Shared"
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            <button className="text-stone-400 hover:text-white transition-colors">
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-stone-50 placeholder:text-stone-500 text-sm focus:outline-none focus:border-fuchsia-500"
            />
            <button className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-2 rounded-lg hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6">
            {/* New Post Input */}
            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden mb-6">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
              </div>
              <div className="relative z-10 p-6">
                <input
                  type="text"
                  placeholder="Start a new post"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-3 text-stone-50 placeholder:text-stone-500 focus:outline-none focus:border-fuchsia-500"
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
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 border-l border-neutral-700 bg-gradient-to-b from-neutral-900/50 to-black/50">
          <div className="p-6">
            <h2 className="text-stone-50 text-xl font-semibold mb-6">Chats</h2>

            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search chats using name..."
                className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-2 pl-10 text-stone-50 placeholder:text-stone-500 text-sm focus:outline-none focus:border-fuchsia-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
            </div>

            {/* Chat List */}
            <div className="space-y-3">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{chat.avatar}</span>
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-stone-50 text-sm font-medium truncate">{chat.name}</h3>
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

      {/* Chat Modal */}
      {activeChat && <ChatWindow chat={activeChat} />}
    </div>
  );
};

export default CommunityPage;
