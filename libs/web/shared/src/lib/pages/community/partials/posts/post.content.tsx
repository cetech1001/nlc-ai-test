import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface PostContentProps {
  content: string;
  mediaUrls?: string[];
}

export const PostContent: React.FC<PostContentProps> = ({ content, mediaUrls }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mutedVideos, setMutedVideos] = useState<{ [key: string]: boolean }>({});

  const POST_PREVIEW_LENGTH = 280;
  const isLongPost = content.length > POST_PREVIEW_LENGTH;
  const displayContent = isLongPost && !isExpanded
    ? content.slice(0, POST_PREVIEW_LENGTH)
    : content;

  const toggleVideoMute = (videoID: string) => {
    setMutedVideos(prev => ({
      ...prev,
      [videoID]: !prev[videoID]
    }));
  };

  const renderMediaItem = (url: string, index: number) => {
    const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('video');
    const mediaID = `media-${index}`;

    if (isVideo) {
      return (
        <div key={index} className="relative group">
          <video
            className="w-full h-auto rounded-lg"
            controls
            muted={mutedVideos[mediaID]}
            preload="metadata"
            poster={url.replace(/\.(mp4|mov|avi)$/i, '.jpg')}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleVideoMute(mediaID)}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              {mutedVideos[mediaID] ?
                <VolumeX className="w-4 h-4" /> :
                <Volume2 className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="relative">
        <img
          src={url}
          alt={`Post content ${index + 1}`}
          className="w-full h-auto rounded-lg object-contain"
          style={{ maxHeight: '600px' }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Text Content */}
      <div className="mb-4">
        <p className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {displayContent}
          {isLongPost && !isExpanded && '...'}
        </p>

        {isLongPost && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium mt-2 transition-colors"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      {/* Media Content */}
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="mb-4">
          {mediaUrls.length === 1 ? (
            <div className="rounded-lg overflow-hidden">
              {renderMediaItem(mediaUrls[0], 0)}
            </div>
          ) : (
            <div className={`grid gap-2 rounded-lg overflow-hidden ${
              mediaUrls.length === 2 ? 'grid-cols-2' :
                mediaUrls.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2'
            }`}>
              {mediaUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative">
                  {renderMediaItem(url, index)}
                  {index === 3 && mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-semibold">
                        +{mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
