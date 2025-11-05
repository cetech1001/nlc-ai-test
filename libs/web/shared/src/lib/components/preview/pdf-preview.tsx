'use client'

import React, { useState } from 'react';
import { X, Download, FileText, ExternalLink, Maximize2 } from 'lucide-react';

interface PDFPreviewProps {
  src: string;
  name?: string;
  className?: string;
  showControls?: boolean;
  onRemove?: () => void;
  enableFullView?: boolean;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
                                                        src,
                                                        name = 'Document.pdf',
                                                        className = '',
                                                        showControls = true,
                                                        onRemove,
                                                        enableFullView = true,
                                                      }) => {
  const [showFullView, setShowFullView] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank');
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <div className="relative rounded-lg overflow-hidden bg-neutral-900/50 border border-neutral-700">
          {/* PDF Thumbnail/Preview */}
          <div className="aspect-[3/4] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30">
              <FileText className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-white text-sm font-medium text-center truncate w-full px-2">
              {name}
            </p>
            <p className="text-neutral-400 text-xs mt-1">PDF Document</p>
          </div>

          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {enableFullView && (
                  <button
                    onClick={() => setShowFullView(true)}
                    className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors"
                    title="View PDF"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleOpenInNewTab}
                  className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

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

      {/* Full View Modal */}
      {showFullView && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 bg-neutral-900/50 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium">{name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setShowFullView(false)}
                className="p-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <iframe
              src={src}
              className="w-full h-full object-contain"
              style={{ height: '100vh', width: '100vh', border: 'none' }}
              title={name}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};
