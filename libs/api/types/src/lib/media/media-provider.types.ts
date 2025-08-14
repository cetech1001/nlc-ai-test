import "multer";

export interface MediaUploadOptions {
  folder?: string;
  publicID?: string;
  overwrite?: boolean;
  transformation?: TransformationOptions[];
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface TransformationOptions {
  type: 'resize' | 'crop' | 'quality' | 'format' | 'rotate' | 'effect';
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: string;
  crop?: 'fit' | 'fill' | 'scale' | 'crop';
  gravity?: string;
  angle?: number;
  effect?: string;
}

export interface MediaAsset {
  id: string;
  publicID: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  duration?: number;
  fileSize: number;
  tags: string[];
  metadata: Record<string, any>;
  folder?: string;
  createdAt: Date;
  version: string;
}

export interface MediaProvider {
  upload(file: Buffer | Express.Multer.File, options?: MediaUploadOptions): Promise<MediaAsset>;
  delete(publicID: string, resourceType?: 'image' | 'video' | 'raw'): Promise<boolean>;
  getAsset(publicID: string): Promise<MediaAsset | null>;
  generateUrl(publicID: string, transformations?: TransformationOptions[]): string;
  search(query: MediaSearchQuery): Promise<MediaSearchResult>;
  updateAsset(publicID: string, updates: Partial<MediaAsset>): Promise<MediaAsset>;
}

export interface MediaSearchQuery {
  expression?: string;
  resourceType?: 'image' | 'video' | 'raw';
  tags?: string[];
  folder?: string;
  maxResults?: number;
  nextCursor?: string;
}

export interface MediaSearchResult {
  resources: MediaAsset[];
  totalCount: number;
  nextCursor?: string;
}
