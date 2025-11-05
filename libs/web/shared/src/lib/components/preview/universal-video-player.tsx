'use client'

import React from 'react';
import { S3VideoPlayer } from './s3-video-player';

interface UniversalVideoPlayerProps {
  src: string;
  thumbnailUrl?: string;
  className?: string;
  autoGenerateThumbnail?: boolean;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  src,
  thumbnailUrl,
  className = '',
  autoGenerateThumbnail = true,
}) => {
  const getVideoType = (url: string): 'youtube' | 'vimeo' | 's3' | 'unknown' => {
    if (!url) return 'unknown';

    // YouTube patterns
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }

    // Vimeo patterns
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }

    // Default to S3/direct video
    return 's3';
  };

  const extractYouTubeID = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const extractVimeoID = (url: string): string | null => {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /vimeo\.com\/video\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoType = getVideoType(src);

  // YouTube Player
  if (videoType === 'youtube') {
    const videoID = extractYouTubeID(src);
    if (!videoID) {
      return (
        <div className={`bg-red-900/20 border border-red-600 rounded-lg p-8 text-center ${className}`}>
          <p className="text-red-400">Invalid YouTube URL</p>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoID}?rel=0&modestbranding=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Vimeo Player
  if (videoType === 'vimeo') {
    const videoID = extractVimeoID(src);
    if (!videoID) {
      return (
        <div className={`bg-red-900/20 border border-red-600 rounded-lg p-8 text-center ${className}`}>
          <p className="text-red-400">Invalid Vimeo URL</p>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${videoID}?title=0&byline=0&portrait=0`}
            title="Vimeo video player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // S3/Direct Video
  if (videoType === 's3') {
    return (
      <S3VideoPlayer
        src={src}
        thumbnailUrl={thumbnailUrl}
        autoGenerateThumbnail={autoGenerateThumbnail}
        className={className}
      />
    );
  }

  // Unknown/Error
  return (
    <div className={`bg-neutral-900/50 border border-neutral-600 rounded-lg p-8 text-center ${className}`}>
      <p className="text-neutral-400">Unable to play video</p>
    </div>
  );
};
