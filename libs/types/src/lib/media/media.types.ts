export enum MediaResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw'
}

export enum MediaProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export enum MediaProviderType {
  S3 = 'S3',
  CLOUDINARY = 'cloudinary',
  VIMEO = 'vimeo',
  CLOUDFRONT = 'cloudfront'
}

export interface MediaFile {
  id: string;
  userID: string;
  publicID: string;
  originalName: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: MediaResourceType;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  tags: string[];
  metadata: Record<string, any>;
  provider: MediaProviderType;
  providerData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUploadResult {
  asset?: MediaFile;
  processingStatus?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface MediaUsageStats {
  totalFiles: number;
  totalSize: number;
  imageCount: number;
  videoCount: number;
  rawCount: number;
  storageUsed: number;
  bandwidth: number;
  transformations: number;
}

export interface MediaTransformation {
  type: "resize" | "crop" | "quality" | "format" | "rotate" | "effect";
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: string;
  crop?: "crop" | "fit" | "fill" | "scale";
  gravity?: string;
  angle?: number;
  effect?: string;
}

export interface UploadAsset {
  folder?: string;
  publicID?: string;
  overwrite?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  transformation?: MediaTransformation[];
}
