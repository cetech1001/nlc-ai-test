'use client'

import { useState, useEffect } from 'react';
import { X, Search, Video, Image, FileText, Loader2, ChevronRight } from 'lucide-react';
import { ContentPiece } from '@nlc-ai/sdk-content';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';

interface ContentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contentPieceID: string, contentTitle?: string, thumbnailUrl?: string) => void;
}

export const ContentSelectionModal = ({ isOpen, onClose, onSelect }: ContentSelectionModalProps) => {
  const [contents, setContents] = useState<ContentPiece[]>([]);
  const [filteredContents, setFilteredContents] = useState<ContentPiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchContents();
    }
  }, [isOpen]);

  useEffect(() => {
    filterContents();
  }, [searchQuery, selectedPlatform, contents]);

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      const result = await sdkClient.content.contentPieces.getContentPieces({ limit: 100 });
      setContents(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContents = () => {
    let filtered = contents;

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(c => c.platform === selectedPlatform);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    setFilteredContents(filtered);
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const platforms = ['all', ...new Set(contents.map(c => c.platform).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 backdrop-blur-md rounded-[20px] border border-neutral-700 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div>
              <h2 className="text-[#F9F9F9] text-xl font-semibold">Select Content</h2>
              <p className="text-[#C5C5C5] text-sm mt-1">Choose a video to generate ideas from</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-neutral-700 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 pl-10 pr-4 py-2 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform!)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                      : 'bg-neutral-800 text-stone-400 hover:bg-neutral-700'
                  }`}
                >
                  {platform === 'all' ? 'All Platforms' : platform!.charAt(0).toUpperCase() + platform!.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-400 text-lg mb-2">No content found</p>
                <p className="text-stone-500 text-sm">Try adjusting your filters or upload new content</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredContents.map(content => (
                  <button
                    key={content.id}
                    onClick={() => onSelect(content.id, content.title, content.thumbnailUrl)}
                    className="flex gap-4 p-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-purple-500/50 rounded-lg transition-all group text-left"
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-neutral-700 rounded-lg overflow-hidden">
                      {content.thumbnailUrl ? (
                        <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500">
                          {getContentIcon(content.contentType)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-stone-200 font-medium line-clamp-2 mb-2">{content.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                        <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded capitalize">
                          {content.platform || 'Uploaded'}
                        </span>
                        <span>{content.views?.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
