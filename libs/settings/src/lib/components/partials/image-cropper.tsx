import { FC, useState, useEffect, useRef } from 'react';
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
}

export const ImageCropper: FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  const CROP_SIZE = 300; // Square crop area
  const CONTAINER_SIZE = 400;

  // Load and setup image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // For CORS if needed

    img.onload = () => {
      setImageElement(img);
      setIsLoading(false);

      const initialScale = Math.max(
        CROP_SIZE / img.naturalWidth,
        CROP_SIZE / img.naturalHeight
      ) * 1.2; // 20% larger than minimum fit

      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
    };

    img.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load image');
    };

    img.src = imageSrc;
  }, [imageSrc]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageElement) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageElement) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Control handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    if (!imageElement) return;

    const initialScale = Math.max(
      CROP_SIZE / imageElement.naturalWidth,
      CROP_SIZE / imageElement.naturalHeight
    ) * 1.2;

    setScale(initialScale);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleCrop = async () => {
    if (!imageElement) return;

    // Create canvas for cropping
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    // Calculate the center of the container
    const centerX = CONTAINER_SIZE / 2;
    const centerY = CONTAINER_SIZE / 2;

    // Calculate crop area offset
    const cropX = centerX - CROP_SIZE / 2;
    const cropY = centerY - CROP_SIZE / 2;

    // Apply transformations and draw image
    ctx.save();

    // Translate to crop center
    ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(scale, scale);

    // Apply position offset (adjust for crop area)
    const adjustedX = position.x - cropX;
    const adjustedY = position.y - cropY;
    ctx.translate(adjustedX / scale, adjustedY / scale);

    // Draw image centered
    const drawWidth = imageElement.naturalWidth;
    const drawHeight = imageElement.naturalHeight;
    ctx.drawImage(
      imageElement,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Crop Your Photo</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Cropper Container */}
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative bg-neutral-800 rounded-lg overflow-hidden border-2 border-neutral-600"
              style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Image */}
              {imageElement && (
                <div
                  className="absolute cursor-move select-none"
                  style={{
                    left: CONTAINER_SIZE / 2 + position.x,
                    top: CONTAINER_SIZE / 2 + position.y,
                    transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop preview"
                    className="block max-w-none pointer-events-none"
                    style={{
                      width: imageElement.naturalWidth,
                      height: imageElement.naturalHeight,
                      maxWidth: 'none',
                    }}
                    draggable={false}
                  />
                </div>
              )}

              {/* Crop Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* Clear crop area */}
                <div
                  className="absolute bg-transparent border-2 border-violet-500"
                  style={{
                    left: (CONTAINER_SIZE - CROP_SIZE) / 2,
                    top: (CONTAINER_SIZE - CROP_SIZE) / 2,
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                    boxShadow: `0 0 0 ${CONTAINER_SIZE}px rgba(0, 0, 0, 0.6)`,
                  }}
                >
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-violet-500"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-violet-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-violet-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-violet-500"></div>

                  {/* Grid lines */}
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-violet-500/30"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-violet-500/30"></div>
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-violet-500/30"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-violet-500/30"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Zoom:</span>
                <span className="text-sm text-white font-medium min-w-[3rem]">
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
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleRotateLeft}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Rotate Left"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Rotation:</span>
                <span className="text-sm text-white font-medium min-w-[3rem]">
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
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Move className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">How to crop:</h4>
                  <div className="text-stone-400 text-xs space-y-1">
                    <div>• Drag the image to position it within the crop area</div>
                    <div>• Use zoom controls to resize the image</div>
                    <div>• Use rotation controls to rotate the image</div>
                    <div>• The purple square shows what will be cropped</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
