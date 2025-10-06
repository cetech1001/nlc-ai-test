import React, { useState } from 'react';
import { S3VideoPlayer } from '../../../../components';

interface PostContentProps {
  content: string;
  mediaUrls?: string[];
  mediaThumbnails?: { [key: string]: string }; // Map of video URL to thumbnail URL
}

export const PostContent: React.FC<PostContentProps> = ({
                                                          content,
                                                          mediaUrls,
                                                          mediaThumbnails = {}
                                                        }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const POST_PREVIEW_LENGTH = 280;
  const isLongPost = content.length > POST_PREVIEW_LENGTH;
  const displayContent = isLongPost && !isExpanded
    ? content.slice(0, POST_PREVIEW_LENGTH)
    : content;

  const isVideo = (url: string) => {
    return url.includes('.mp4') ||
      url.includes('.mov') ||
      url.includes('.avi') ||
      url.includes('.webm') ||
      url.includes('video') ||
      url.match(/\.(mp4|mov|avi|webm)$/i);
  };

  const renderMediaItem = (url: string, index: number) => {
    if (isVideo(url)) {
      const thumbnailUrl = mediaThumbnails[url];

      return (
        <div key={index} className="relative rounded-lg overflow-hidden bg-black" style={{ maxHeight: '500px' }}>
          <S3VideoPlayer
            src={url}
            thumbnailUrl={thumbnailUrl}
            className="w-full"
            autoGenerateThumbnail={!thumbnailUrl}
          />
        </div>
      );
    }

    return (
      <div key={index} className="relative rounded-lg overflow-hidden">
        <img
          src={url}
          alt={`Post content ${index + 1}`}
          className="w-full h-auto object-contain rounded-lg"
          style={{ maxHeight: '500px' }}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <>
      {/* Text Content - Capped at max height with overflow scroll */}
      <div className="mb-4">
        <div
          className={`text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
            !isExpanded && isLongPost ? 'max-h-[200px] overflow-hidden' : ''
          }`}
        >
          <p>
            {displayContent}
            {isLongPost && !isExpanded && '...'}
          </p>
        </div>

        {isLongPost && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium mt-2 transition-colors"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      {/* Media Content - Capped at max height */}
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="mb-4">
          {mediaUrls.length === 1 ? (
            <div className="rounded-lg overflow-hidden" style={{ maxHeight: '500px' }}>
              {renderMediaItem(mediaUrls[0], 0)}
            </div>
          ) : (
            <div className={`grid gap-2 rounded-lg overflow-hidden ${
              mediaUrls.length === 2 ? 'grid-cols-2' :
                mediaUrls.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2'
            }`} style={{ maxHeight: '500px' }}>
              {mediaUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative">
                  {renderMediaItem(url, index)}
                  {index === 3 && mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-semibold text-lg">
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
