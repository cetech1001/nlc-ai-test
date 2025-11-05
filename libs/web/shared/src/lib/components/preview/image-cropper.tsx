'use client'

import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  RotateCcw
} from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  cropType?: 'square' | 'banner' | 'thumbnail';
  aspectRatio?: number;
}

const ImageCropperContent: FC<ImageCropperProps> = ({
                                                      imageSrc,
                                                      onCropComplete,
                                                      onCancel,
                                                      cropType = 'square',
                                                      aspectRatio
                                                    }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Calculate crop dimensions based on type
  const getCropDimensions = () => {
    if (cropType === 'banner') {
      const ratio = aspectRatio || 3;
      return {
        width: 480,
        height: 480 / ratio,
      };
    }
    if (cropType === 'thumbnail') {
      const ratio = aspectRatio || 16/9;
      return {
        width: 480,
        height: 480 / ratio,
      };
    }
    return {
      width: 300,
      height: 300,
    };
  };

  const cropDimensions = getCropDimensions();
  const CANVAS_SIZE = Math.max(cropDimensions.width + 100, cropDimensions.height + 100);

  const getCropTypeName = () => {
    switch(cropType) {
      case 'banner': return 'Banner';
      case 'thumbnail': return 'Thumbnail';
      case 'square': return 'Photo';
      default: return 'Image';
    }
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setImageElement(img);
      imageRef.current = img;

      const scaleX = cropDimensions.width / img.naturalWidth;
      const scaleY = cropDimensions.height / img.naturalHeight;
      const initialScale = Math.max(scaleX, scaleY) * 1.2;

      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load image');
    };

    img.src = imageSrc;
  }, [imageSrc, cropDimensions.width, cropDimensions.height]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    ctx.restore();

    const cropX = (CANVAS_SIZE - cropDimensions.width) / 2;
    const cropY = (CANVAS_SIZE - cropDimensions.height) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_SIZE, cropY);
    ctx.fillRect(0, cropY + cropDimensions.height, CANVAS_SIZE, CANVAS_SIZE - cropY - cropDimensions.height);
    ctx.fillRect(0, cropY, cropX, cropDimensions.height);
    ctx.fillRect(cropX + cropDimensions.width, cropY, CANVAS_SIZE - cropX - cropDimensions.width, cropDimensions.height);

    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropDimensions.width, cropDimensions.height);

    const handleSize = 20;
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(cropX, cropY + handleSize);
    ctx.lineTo(cropX, cropY);
    ctx.lineTo(cropX + handleSize, cropY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cropX + cropDimensions.width - handleSize, cropY);
    ctx.lineTo(cropX + cropDimensions.width, cropY);
    ctx.lineTo(cropX + cropDimensions.width, cropY + handleSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cropX, cropY + cropDimensions.height - handleSize);
    ctx.lineTo(cropX, cropY + cropDimensions.height);
    ctx.lineTo(cropX + handleSize, cropY + cropDimensions.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cropX + cropDimensions.width - handleSize, cropY + cropDimensions.height);
    ctx.lineTo(cropX + cropDimensions.width, cropY + cropDimensions.height);
    ctx.lineTo(cropX + cropDimensions.width, cropY + cropDimensions.height - handleSize);
    ctx.stroke();

    if (cropDimensions.width > 100 && cropDimensions.height > 100) {
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      ctx.beginPath();
      ctx.moveTo(cropX + cropDimensions.width / 3, cropY);
      ctx.lineTo(cropX + cropDimensions.width / 3, cropY + cropDimensions.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cropX + (cropDimensions.width * 2) / 3, cropY);
      ctx.lineTo(cropX + (cropDimensions.width * 2) / 3, cropY + cropDimensions.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cropX, cropY + cropDimensions.height / 3);
      ctx.lineTo(cropX + cropDimensions.width, cropY + cropDimensions.height / 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cropX, cropY + (cropDimensions.height * 2) / 3);
      ctx.lineTo(cropX + cropDimensions.width, cropY + (cropDimensions.height * 2) / 3);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }, [scale, rotation, position, cropDimensions.width, cropDimensions.height, CANVAS_SIZE]);

  useEffect(() => {
    if (!isLoading && imageElement) {
      drawCanvas();
    }
  }, [drawCanvas, isLoading, imageElement]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.2));
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    if (!imageElement) return;
    const scaleX = cropDimensions.width / imageElement.naturalWidth;
    const scaleY = cropDimensions.height / imageElement.naturalHeight;
    const initialScale = Math.max(scaleX, scaleY) * 1.2;
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleCrop = async () => {
    if (!imageElement) return;

    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    const finalWidth = cropType === 'thumbnail' ? 1280 : cropDimensions.width * 2;
    const finalHeight = cropType === 'thumbnail' ? 720 : cropDimensions.height * 2;

    cropCanvas.width = finalWidth;
    cropCanvas.height = finalHeight;

    const scaleFactor = finalWidth / cropDimensions.width;

    cropCtx.save();
    cropCtx.translate(finalWidth / 2, finalHeight / 2);

    const offsetX = position.x * scaleFactor;
    const offsetY = position.y * scaleFactor;

    cropCtx.translate(offsetX, offsetY);
    cropCtx.rotate((rotation * Math.PI) / 180);
    cropCtx.scale(scale * scaleFactor, scale * scaleFactor);

    const imgWidth = imageElement.naturalWidth;
    const imgHeight = imageElement.naturalHeight;
    cropCtx.drawImage(imageElement, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    cropCtx.restore();

    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.92);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Loading image...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 p-4 md:p-6 w-full max-w-2xl my-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-white">
              Crop Your {getCropTypeName()}
            </h3>
            {cropType === 'thumbnail' && (
              <p className="text-xs md:text-sm text-stone-400 mt-1">
                Final size: 1280x720px (16:9 ratio)
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Canvas Container */}
          <div className="flex justify-center overflow-hidden">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border-2 border-neutral-600 rounded-lg cursor-move bg-neutral-800 max-w-full h-auto"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  maxWidth: '100%',
                  maxHeight: '50vh'
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 md:space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400">Zoom:</span>
                <span className="text-xs md:text-sm text-white font-medium min-w-[3rem]">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              <button
                onClick={handleZoomIn}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <button
                onClick={handleRotateLeft}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Rotate Left"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400">Rotation:</span>
                <span className="text-xs md:text-sm text-white font-medium min-w-[3rem]">
                  {rotation}°
                </span>
              </div>

              <button
                onClick={handleRotateRight}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Rotate Right"
              >
                <RotateCw className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Move className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-1 md:mb-2 text-xs md:text-sm">How to crop:</h4>
                  <div className="text-stone-400 text-[10px] md:text-xs space-y-1">
                    <div>• Drag the image to position it</div>
                    <div>• Use zoom controls to resize</div>
                    <div>• Use rotation controls to rotate</div>
                    <div>• Purple area shows crop region</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm rounded-lg border border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm rounded-lg border border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Check className="w-3 h-3 md:w-4 md:h-4" />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that uses portal
export const ImageCropper: FC<ImageCropperProps> = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <ImageCropperContent {...props} />,
    document.body
  );
};
