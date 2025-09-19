import { BaseEvent } from '@nlc-ai/api-messaging';
import { MediaResourceType, MediaProviderType } from './media.types';

export interface MediaUploadedEvent extends BaseEvent {
  eventType: 'media.asset.uploaded';
  payload: {
    assetID: string;
    userID: string;
    publicID: string;
    originalName: string;
    resourceType: MediaResourceType;
    fileSize: number;
    provider: MediaProviderType;
    folder?: string;
    tags: string[];
    url: string;
    uploadedAt: string;
    processingStatus: string;
  };
}

export interface MediaDeletedEvent extends BaseEvent {
  eventType: 'media.asset.deleted';
  payload: {
    assetID: string;
    userID: string;
    publicID: string;
    resourceType: MediaResourceType;
    provider: MediaProviderType;
    deletedBy: string;
    deletedAt: string;
  };
}

export interface MediaTransformationRequestedEvent extends BaseEvent {
  eventType: 'media.transformation.requested';
  payload: {
    assetID: string;
    userID: string;
    publicID: string;
    transformations: Array<{
      type: string;
      parameters: Record<string, any>;
    }>;
    requestedBy: string;
    requestedAt: string;
  };
}

export interface MediaAccessedEvent extends BaseEvent {
  eventType: 'media.asset.accessed';
  payload: {
    assetID: string;
    userID: string;
    publicID: string;
    accessType: 'view' | 'download' | 'transform';
    userAgent?: string;
    ipAddress?: string;
    accessedAt: string;
  };
}

export type MediaEvent =
  | MediaUploadedEvent
  | MediaDeletedEvent
  | MediaTransformationRequestedEvent
  | MediaAccessedEvent;
