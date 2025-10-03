import {MediaUploadOptions, TransformationOptions} from "./media.types";

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
  // @ts-ignore
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
