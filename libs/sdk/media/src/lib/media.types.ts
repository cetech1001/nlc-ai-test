export enum MediaResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw'
}

export enum MediaTransformationType {
  QUALITY = "quality",
  FORMAT = "format",
  ROTATE = "rotate",
  RESIZE = "resize",
  CROP = "crop",
  EFFECT = "effect",
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
