'use client'

import React, {useState, useRef, useEffect} from 'react';
import { Paperclip, Send, X, FileText, Video } from 'lucide-react';
import { ImageUpload, VideoUpload, UploadedImage, UploadedVideo } from '../../../../components';
import { NLCClient } from '@nlc-ai/sdk-main';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isConnected: boolean;
  isAdminConversation: boolean;
  disabled?: boolean;
  sdkClient: NLCClient;
  onFileAttached?: (files: { images: UploadedImage[]; videos: UploadedVideo[]; documents: any[] }) => void;
  onClearAttachments?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
                                                            value,
                                                            onChange,
                                                            onSend,
                                                            onKeyPress,
                                                            isConnected,
                                                            isAdminConversation,
                                                            disabled = false,
                                                            sdkClient,
                                                            onFileAttached,
                                                            onClearAttachments,
                                                          }) => {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);

  const fileMenuRef = useRef<HTMLDivElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onClearAttachments) {
      clearAttachments();
    }
  }, [onClearAttachments]);


  // Close file menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setShowFileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImagesUploaded = (images: UploadedImage[]) => {
    setUploadedImages(images);
    if (onFileAttached) {
      onFileAttached({ images, videos: uploadedVideos, documents: uploadedDocuments });
    }
  };

  const handleVideosUploaded = (videos: UploadedVideo[]) => {
    setUploadedVideos(videos);
    if (onFileAttached) {
      onFileAttached({ images: uploadedImages, videos, documents: uploadedDocuments });
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocuments = [];
    for (const file of Array.from(files)) {
      try {
        const result = await sdkClient.media.uploadAsset(file, {
          folder: 'nlc-ai/uploads/documents',
          tags: ['document', 'message-attachment'],
          metadata: {
            uploadedFor: 'message',
            originalSize: file.size,
          },
        });

        if (result.success && result.data?.asset) {
          newDocuments.push({
            id: result.data.asset.id,
            url: result.data.asset.secureUrl,
            name: result.data.asset.originalName || file.name,
            size: result.data.asset.fileSize || file.size,
            type: file.type,
          });
        }
      } catch (error) {
        console.error('Failed to upload document:', error);
      }
    }

    const allDocuments = [...uploadedDocuments, ...newDocuments];
    setUploadedDocuments(allDocuments);
    if (onFileAttached) {
      onFileAttached({ images: uploadedImages, videos: uploadedVideos, documents: allDocuments });
    }
    setShowFileMenu(false);
  };

  const removeDocument = (docID: string) => {
    const filtered = uploadedDocuments.filter(doc => doc.id !== docID);
    setUploadedDocuments(filtered);
    if (onFileAttached) {
      onFileAttached({ images: uploadedImages, videos: uploadedVideos, documents: filtered });
    }
  };

  const clearAttachments = () => {
    setUploadedImages([]);
    setUploadedVideos([]);
    setUploadedDocuments([]);
    if (onFileAttached) {
      onFileAttached({ images: [], videos: [], documents: [] });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasAttachments = uploadedImages.length > 0 || uploadedVideos.length > 0 || uploadedDocuments.length > 0;

  return (
    <div className="relative z-10 p-6 border-t border-neutral-700/50
      bg-gradient-to-r from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm">

      {/* Attachments Preview */}
      {hasAttachments && (
        <div className="mb-4 space-y-3">
          {/* Images */}
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.name}
                    className="w-16 h-16 rounded-lg object-cover border border-neutral-600"
                  />
                  <button
                    onClick={() => {
                      const filtered = uploadedImages.filter(img => img.id !== image.id);
                      setUploadedImages(filtered);
                      if (onFileAttached) {
                        onFileAttached({ images: filtered, videos: uploadedVideos, documents: uploadedDocuments });
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Videos */}
          {uploadedVideos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedVideos.map((video) => (
                <div key={video.id} className="relative group">
                  <div className="w-24 h-16 rounded-lg bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                    <Video className="w-6 h-6 text-stone-400" />
                  </div>
                  <button
                    onClick={() => {
                      const filtered = uploadedVideos.filter(v => v.id !== video.id);
                      setUploadedVideos(filtered);
                      if (onFileAttached) {
                        onFileAttached({ images: uploadedImages, videos: filtered, documents: uploadedDocuments });
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-2">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2 bg-neutral-800/50 rounded-lg border border-neutral-600">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{doc.name}</p>
                    <p className="text-stone-500 text-xs">{formatFileSize(doc.size)}</p>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-stone-400 hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* File Attachment Menu */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg
              hover:bg-neutral-700/50"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {showFileMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="py-2">
                <ImageUpload
                  sdkClient={sdkClient}
                  onImagesUploaded={handleImagesUploaded}
                  maxFiles={10}
                  showPreview={false}
                  className="px-4 py-2 hover:bg-neutral-700/50 transition-colors w-full text-left"
                />
                <VideoUpload
                  sdkClient={sdkClient}
                  onVideosUploaded={handleVideosUploaded}
                  maxFiles={5}
                  showPreview={false}
                  className="px-4 py-2 hover:bg-neutral-700/50 transition-colors w-full text-left"
                />
                <button
                  onClick={() => documentInputRef.current?.click()}
                  className="px-4 py-2 hover:bg-neutral-700/50 transition-colors w-full text-left flex items-center gap-2 text-stone-400 hover:text-white"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Documents</span>
                </button>
              </div>
            </div>
          )}

          <input
            ref={documentInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
            onChange={handleDocumentUpload}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder={isAdminConversation ? 'Describe your issue or question...' : 'Type your message...'}
            disabled={disabled}
            className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-4 py-3
              text-white placeholder:text-stone-400 text-sm focus:outline-none
              focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 resize-none max-h-32
              backdrop-blur-sm disabled:opacity-50"
            rows={1}
            aria-label="Message input"
          />
        </div>

        <button
          onClick={onSend}
          disabled={(!value.trim() && !hasAttachments) || disabled}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-xl
            hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        {isAdminConversation && (
          <div className="text-xs text-stone-500 text-center flex-1">
            Direct line to admin support • Real-time messaging
          </div>
        )}
        <div className="flex items-center gap-2 text-xs ml-auto">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};
