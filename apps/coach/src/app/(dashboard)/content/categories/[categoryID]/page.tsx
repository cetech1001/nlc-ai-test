'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BackTo } from '@nlc-ai/shared';
import {
  Play,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Plus
} from 'lucide-react';

interface VideoContent {
  id: string;
  title?: string;
  thumbnail: string;
  duration: string;
  uploadTime: string;
  uploadDate: string;
  views: number;
  engagement: number;
}

const mockVideos: VideoContent[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 12500,
    engagement: 8.2
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 9800,
    engagement: 7.5
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 15200,
    engagement: 9.1
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 8900,
    engagement: 6.8
  },
  {
    id: '5',
    thumbnail: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 11300,
    engagement: 7.9
  },
  {
    id: '6',
    thumbnail: 'https://images.unsplash.com/photo-1506629905607-24ba3bb1dd7d?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 13600,
    engagement: 8.4
  },
  {
    id: '7',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 7800,
    engagement: 6.2
  },
  {
    id: '8',
    thumbnail: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 16400,
    engagement: 9.5
  },
  {
    id: '9',
    thumbnail: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 5600,
    engagement: 5.8
  },
  {
    id: '10',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 10200,
    engagement: 7.3
  },
  {
    id: '11',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 14800,
    engagement: 8.7
  },
  {
    id: '12',
    thumbnail: 'https://images.unsplash.com/photo-1506629905607-24ba3bb1dd7d?w=400',
    duration: '01:20',
    uploadTime: '08:57 PM',
    uploadDate: '14 APR',
    views: 9200,
    engagement: 6.9
  }
];

interface VideoCardProps {
  video: VideoContent;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const VideoCard = ({ video, onPlay, onEdit, onDelete }: VideoCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
        <img
          src={video.thumbnail}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onPlay}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <Play className="w-6 h-6 text-white fill-current" />
          </button>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          <Clock className="w-3 h-3 inline mr-1" />
          {video.duration}
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-20">
              <button
                onClick={() => { onEdit(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-stone-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Video
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{video.uploadTime} | {video.uploadDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1 text-stone-300">
            <Eye className="w-3 h-3" />
            <span>{video.views.toLocaleString()} views</span>
          </div>
          <div className="text-right">
            <span className="text-stone-300">{video.engagement}% engagement</span>
          </div>
        </div>

        <button
          onClick={onPlay}
          className="w-full bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 text-fuchsia-400 py-2 rounded-lg hover:bg-gradient-to-r hover:from-fuchsia-600/30 hover:to-violet-600/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          Play Video
        </button>
      </div>
    </div>
  );
};

const VideosSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 overflow-hidden animate-pulse">
        <div className="aspect-video bg-neutral-700"></div>
        <div className="p-4 space-y-3">
          <div className="h-3 bg-neutral-700 rounded w-32"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-neutral-700 rounded w-16"></div>
            <div className="h-3 bg-neutral-700 rounded w-12 ml-auto"></div>
          </div>
          <div className="h-8 bg-neutral-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function CategoryDetail() {
  const router = useRouter();
  const params = useParams();
  const categoryID = params.categoryID as string;

  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    // Simulate loading and set category name based on ID
    const timer = setTimeout(() => {
      setVideos(mockVideos);

      // Set category name based on ID
      const categoryNames: Record<string, string> = {
        '1': 'Controversial',
        '2': 'Informative',
        '3': 'Entertainment',
        '4': 'Conversational',
        '5': 'Case Studies'
      };

      setCategoryName(categoryNames[categoryID] || 'Category');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [categoryID]);

  const handleBackClick = () => {
    router.push('/content/categories');
  };

  const handlePlayVideo = (videoId: string) => {
    console.log('Play video:', videoId);
    // Handle video play logic
  };

  const handleEditVideo = (videoId: string) => {
    console.log('Edit video:', videoId);
    // Handle video edit logic
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(prev => prev.filter(v => v.id !== videoId));
    }
  };

  const handleUploadContent = () => {
    router.push(`/content/categories/${categoryID}/upload`);
  };

  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const avgEngagement = videos.reduce((sum, video) => sum + video.engagement, 0) / videos.length;

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <BackTo onClick={handleBackClick} title={categoryName} />

        <button
          onClick={handleUploadContent}
          className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload New Content
        </button>
      </div>

      {/* Category Stats */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-24 h-24 -left-3 -top-5 bg-gradient-to-l from-blue-400 to-blue-600 rounded-full blur-[40px]" />
            </div>
            <div className="relative z-10">
              <div className="text-stone-300 text-sm mb-1">Total Videos</div>
              <div className="text-stone-50 text-2xl font-bold">{videos.length}</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-24 h-24 -left-3 -top-5 bg-gradient-to-l from-green-400 to-green-600 rounded-full blur-[40px]" />
            </div>
            <div className="relative z-10">
              <div className="text-stone-300 text-sm mb-1">Total Views</div>
              <div className="text-stone-50 text-2xl font-bold">{totalViews.toLocaleString()}</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-24 h-24 -left-3 -top-5 bg-gradient-to-l from-purple-400 to-purple-600 rounded-full blur-[40px]" />
            </div>
            <div className="relative z-10">
              <div className="text-stone-300 text-sm mb-1">Avg Engagement</div>
              <div className="text-stone-50 text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {isLoading ? (
        <VideosSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => handlePlayVideo(video.id)}
                onEdit={() => handleEditVideo(video.id)}
                onDelete={() => handleDeleteVideo(video.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-stone-400 text-lg mb-2">No videos found</div>
              <div className="text-stone-500 text-sm mb-4">
                This category doesn't have any videos yet
              </div>
              <button
                onClick={handleUploadContent}
                className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                Upload Your First Video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
