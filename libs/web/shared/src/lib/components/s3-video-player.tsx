import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';

interface S3VideoPlayerProps {
  src: string;
  thumbnailUrl?: string;
  className?: string;
  autoGenerateThumbnail?: boolean;
}

export const S3VideoPlayer: React.FC<S3VideoPlayerProps> = ({
                                                              src,
                                                              thumbnailUrl,
                                                              className = '',
                                                              autoGenerateThumbnail = true,
                                                            }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Generate thumbnail from video first frame with CORS handling
  useEffect(() => {
    if (!thumbnailUrl && autoGenerateThumbnail && videoRef.current) {
      const video = videoRef.current;
      let thumbnailGenerated = false;
      let seekAttempted = false;

      const generateThumbnail = () => {
        if (thumbnailGenerated) return;

        try {
          // Check if video has loaded enough data
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
              setGeneratedThumbnail(thumbnail);
              thumbnailGenerated = true;
            } catch (err) {
              // CORS error - silently fail as we can't generate thumbnail
              console.warn('Unable to generate thumbnail due to CORS restrictions');
            }
          }
        } catch (err) {
          console.warn('Failed to generate thumbnail:', err);
        }
      };

      const attemptSeek = () => {
        if (seekAttempted || !video.duration || isNaN(video.duration)) return;
        seekAttempted = true;

        try {
          const seekTime = Math.min(1, video.duration * 0.1);
          video.currentTime = seekTime;
        } catch (err) {
          console.warn('Failed to seek video:', err);
        }
      };

      const handleLoadedMetadata = () => {
        // Try to seek after metadata is loaded
        setTimeout(() => {
          if (video.readyState >= 1 && video.duration) {
            attemptSeek();
          }
        }, 50);
      };

      const handleLoadedData = () => {
        // Chrome often has enough data here
        if (video.readyState >= 2) {
          if (!seekAttempted) {
            attemptSeek();
          }
          // Try generating if we're at the right position
          if (video.currentTime > 0) {
            generateThumbnail();
          }
        }
      };

      const handleSeeked = () => {
        // Both Chrome and Safari fire this after seeking
        generateThumbnail();
      };

      const handleCanPlay = () => {
        // Safari fallback - try to seek if we haven't already
        if (!seekAttempted && video.duration) {
          attemptSeek();
        }
        // Also try to generate if we have data
        if (video.currentTime > 0 && !thumbnailGenerated) {
          generateThumbnail();
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('canplay', handleCanPlay);

      // Immediate check if video already has data
      if (video.readyState >= 1 && video.duration) {
        handleLoadedMetadata();
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
    return () => {};
  }, [thumbnailUrl, autoGenerateThumbnail]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasStarted(false);
    };

    // Safari-specific handling
    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setHasStarted(true);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to toggle play:', error);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      // Safari support
      (video as any).webkitRequestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const thumbnail = thumbnailUrl || generatedThumbnail;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain rounded-lg bg-black"
        playsInline
        preload="auto"
        webkit-playsinline="true"
      />

      {/* Thumbnail Overlay (shown before first play) */}
      {!hasStarted && thumbnail && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
          >
            <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Video Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-purple-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-purple-400 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Time Display */}
            <span className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-purple-400 transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Custom CSS for range slider */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #a855f7;
          cursor: pointer;
          border-radius: 50%;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #a855f7;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};
