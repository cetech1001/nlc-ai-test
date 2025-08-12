'use client'

import {useState, useEffect} from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@nlc-ai/web-shared';
import {Plus} from 'lucide-react';
import {ContentPiece} from "@nlc-ai/types";
import {mockVideos, VideoCard, VideosSkeleton} from "@/lib";

const CategoryDetail = () => {
  const router = useRouter();
  const params = useParams();
  const categoryID = params.categoryID as string;

  const [videos, setVideos] = useState<ContentPiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideos(mockVideos);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [categoryID]);

  /*const handleBackClick = () => {
    router.push('/content/categories');
  };*/

  const handlePlayVideo = (videoID: string) => {
    console.log('Play video:', videoID);
  };

  const handleEditVideo = (videoID: string) => {
    console.log('Edit video:', videoID);
  };

  const handleDeleteVideo = (videoID: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(prev => prev.filter(v => v.id !== videoID));
    }
  };

  const handleUploadContent = () => {
    router.push(`/content/categories/${categoryID}/upload`);
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <PageHeader
        title={"Content Categories"}
        actionButton={{
          label: 'Upload New Content',
          onClick: handleUploadContent,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {isLoading ? (
        <VideosSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default CategoryDetail;
