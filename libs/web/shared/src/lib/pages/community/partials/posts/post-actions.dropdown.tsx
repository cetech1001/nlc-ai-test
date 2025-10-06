import React, { useRef, useEffect } from 'react';
import { Edit, Trash2, Flag, Copy, Pin, PinOff } from 'lucide-react';

interface PostActionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnPost: boolean;
  canModerate: boolean;
  isPinned: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onCopyLink?: () => void;
  onTogglePin?: () => void;
}

export const PostActionsDropdown: React.FC<PostActionsDropdownProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          isOwnPost,
                                                                          canModerate,
                                                                          isPinned,
                                                                          onEdit,
                                                                          onDelete,
                                                                          onReport,
                                                                          onCopyLink,
                                                                          onTogglePin,
                                                                        }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-8 w-48 bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50 py-2 max-h-[280px] overflow-y-auto"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#a855f7 #404040'
      }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute w-24 h-24 -right-2 -top-4 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px]" />
      </div>

      <div className="relative z-10">
        {canModerate && (
          <>
            <button
              onClick={() => handleAction(onTogglePin || (() => {}))}
              className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-700/50 transition-colors text-left"
            >
              {isPinned ? (
                <>
                  <PinOff className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Unpin Post</span>
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Pin Post</span>
                </>
              )}
            </button>
            <div className="border-t border-neutral-700 my-2"></div>
          </>
        )}

        {isOwnPost && (
          <>
            <button
              onClick={() => handleAction(onEdit || (() => {}))}
              className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-700/50 transition-colors text-left"
            >
              <Edit className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Edit Post</span>
            </button>

            <button
              onClick={() => handleAction(onDelete || (() => {}))}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Delete Post</span>
            </button>

            <div className="border-t border-neutral-700 my-2"></div>
          </>
        )}

        <button
          onClick={() => handleAction(onCopyLink || (() => {}))}
          className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-700/50 transition-colors text-left"
        >
          <Copy className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Copy Link</span>
        </button>

        {!isOwnPost && (
          <button
            onClick={() => handleAction(onReport || (() => {}))}
            className="w-full flex items-center gap-3 px-4 py-2 text-yellow-400 hover:bg-yellow-500/10 transition-colors text-left"
          >
            <Flag className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Report Post</span>
          </button>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .max-h-\\[280px\\]::-webkit-scrollbar {
          width: 6px;
        }

        .max-h-\\[280px\\]::-webkit-scrollbar-track {
          background: #404040;
          border-radius: 3px;
        }

        .max-h-\\[280px\\]::-webkit-scrollbar-thumb {
          background: #a855f7;
          border-radius: 3px;
        }

        .max-h-\\[280px\\]::-webkit-scrollbar-thumb:hover {
          background: #9333ea;
        }
      `}</style>
    </div>
  );
};
