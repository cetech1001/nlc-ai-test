'use client'

import React, { useState } from 'react';
import { X, Download, Maximize2 } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  showControls?: boolean;
  onRemove?: () => void;
  enableLightbox?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
                                                            src,
                                                            alt = 'Image preview',
                                                            className = '',
                                                            showControls = true,
                                                            onRemove,
                                                            enableLightbox = true,
                                                          }) => {
  const [showLightbox, setShowLightbox] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = alt || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <div className="relative rounded-lg overflow-hidden bg-neutral-900/50 border border-neutral-700">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />

          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {enableLightbox && (
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors"
                    title="View fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                {onRemove && (
                  <button
                    onClick={onRemove}
                    className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-7xl max-h-[90vh] p-4">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};
