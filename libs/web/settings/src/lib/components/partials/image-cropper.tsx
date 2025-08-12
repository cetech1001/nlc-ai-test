import { FC, useState, useEffect, useRef, useCallback } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  const CROP_SIZE = 300;
  const CANVAS_SIZE = 400;

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setImageElement(img);
      imageRef.current = img;

      // Calculate initial scale to fit nicely in crop area
      const scaleX = CROP_SIZE / img.naturalWidth;
      const scaleY = CROP_SIZE / img.naturalHeight;
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
  }, [imageSrc]);

  // Draw on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Save context state
    ctx.save();

    // Move to canvas center
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // Apply user transformations
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

    // Restore context
    ctx.restore();

    // Draw crop overlay (but not over the crop area)
    const cropX = (CANVAS_SIZE - CROP_SIZE) / 2;
    const cropY = (CANVAS_SIZE - CROP_SIZE) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    // Top
    ctx.fillRect(0, 0, CANVAS_SIZE, cropY);
    // Bottom
    ctx.fillRect(0, cropY + CROP_SIZE, CANVAS_SIZE, CANVAS_SIZE - cropY - CROP_SIZE);
    // Left
    ctx.fillRect(0, cropY, cropX, CROP_SIZE);
    // Right
    ctx.fillRect(cropX + CROP_SIZE, cropY, CANVAS_SIZE - cropX - CROP_SIZE, CROP_SIZE);

    // Draw crop border
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, CROP_SIZE, CROP_SIZE);

    // Draw corner handles
    const handleSize = 20;
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + handleSize);
    ctx.lineTo(cropX, cropY);
    ctx.lineTo(cropX + handleSize, cropY);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(cropX + CROP_SIZE - handleSize, cropY);
    ctx.lineTo(cropX + CROP_SIZE, cropY);
    ctx.lineTo(cropX + CROP_SIZE, cropY + handleSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + CROP_SIZE - handleSize);
    ctx.lineTo(cropX, cropY + CROP_SIZE);
    ctx.lineTo(cropX + handleSize, cropY + CROP_SIZE);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(cropX + CROP_SIZE - handleSize, cropY + CROP_SIZE);
    ctx.lineTo(cropX + CROP_SIZE, cropY + CROP_SIZE);
    ctx.lineTo(cropX + CROP_SIZE, cropY + CROP_SIZE - handleSize);
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cropX + CROP_SIZE / 3, cropY);
    ctx.lineTo(cropX + CROP_SIZE / 3, cropY + CROP_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cropX + (CROP_SIZE * 2) / 3, cropY);
    ctx.lineTo(cropX + (CROP_SIZE * 2) / 3, cropY + CROP_SIZE);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + CROP_SIZE / 3);
    ctx.lineTo(cropX + CROP_SIZE, cropY + CROP_SIZE / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cropX, cropY + (CROP_SIZE * 2) / 3);
    ctx.lineTo(cropX + CROP_SIZE, cropY + (CROP_SIZE * 2) / 3);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }, [scale, rotation, position]);

  // Redraw canvas when values change
  useEffect(() => {
    if (!isLoading && imageElement) {
      drawCanvas();
    }
  }, [drawCanvas, isLoading, imageElement]);

  // Mouse handlers
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

  // Control handlers
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

    const scaleX = CROP_SIZE / imageElement.naturalWidth;
    const scaleY = CROP_SIZE / imageElement.naturalHeight;
    const initialScale = Math.max(scaleX, scaleY) * 1.2;

    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleCrop = async () => {
    if (!imageElement) return;

    // Create final crop canvas
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCanvas.width = CROP_SIZE;
    cropCanvas.height = CROP_SIZE;

    // Draw only the image without overlays
    cropCtx.save();
    cropCtx.translate(CROP_SIZE / 2, CROP_SIZE / 2);

    // Calculate offset from crop area center to image center
    const offsetX = position.x;
    const offsetY = position.y;

    cropCtx.translate(offsetX, offsetY);
    cropCtx.rotate((rotation * Math.PI) / 180);
    cropCtx.scale(scale, scale);

    // Draw image centered
    const imgWidth = imageElement.naturalWidth;
    const imgHeight = imageElement.naturalHeight;
    cropCtx.drawImage(imageElement, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

    cropCtx.restore();

    // Convert to blob
    cropCanvas.toBlob((blob) => {
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
          {/* Canvas Container */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border-2 border-neutral-600 rounded-lg cursor-move bg-neutral-800"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
              />
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
