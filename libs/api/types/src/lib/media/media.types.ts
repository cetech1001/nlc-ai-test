export enum MediaResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw'
}

export enum MediaProviderType {
  CLOUDINARY = 'cloudinary',
  VIMEO = 'vimeo',
  CLOUDFRONT = 'cloudfront'
}

export interface MediaFile {
  id: string;
  coachID: string;
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
  success: boolean;
  asset?: MediaFile;
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
