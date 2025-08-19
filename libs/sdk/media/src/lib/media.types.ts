export enum MediaResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw'
}

export enum MediaProvider {
  CLOUDINARY = 'cloudinary',
  VIMEO = 'vimeo',
  CLOUDFRONT = 'cloudfront',
  AWS_S3 = 'aws_s3'
}

export interface MediaAsset {
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
  provider: MediaProvider;
  providerData: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUploadResult {
  success: boolean;
  data?: MediaAsset;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface TransformationOptions {
  type: 'resize' | 'crop' | 'quality' | 'format' | 'rotate' | 'effect';
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: string;
  crop?: 'crop' | 'fit' | 'fill' | 'scale';
  gravity?: string;
  angle?: number;
  effect?: string;
}

export interface MediaUploadOptions {
  folder?: string;
  publicID?: string;
  overwrite?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  transformation?: TransformationOptions[];
}

export interface MediaFilters {
  resourceType?: MediaResourceType;
  folder?: string;
  tags?: string[];
  search?: string;
  startDate?: Date;
  endDate?: Date;
  minSize?: number;
  maxSize?: number;
  format?: string;
  sortBy?: 'name' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
