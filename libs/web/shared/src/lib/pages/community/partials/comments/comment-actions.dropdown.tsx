import React, { useRef, useEffect } from 'react';
import { Edit, Trash2, Flag } from 'lucide-react';

interface CommentActionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnComment: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export const CommentActionsDropdown: React.FC<CommentActionsDropdownProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                isOwnComment,
                                                                                onEdit,
                                                                                onDelete,
                                                                                onReport,
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
      className="absolute right-0 bottom-6 w-44 bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-[100] py-2 overflow-y-auto"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-20 h-20 -right-2 -top-3 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[30px]" />
      </div>

      <div className="relative z-10">
        {isOwnComment && (
          <>
            <button
              onClick={() => handleAction(onEdit || (() => { /* empty */ }))}
              className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-700/50 transition-colors text-left"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </button>

            <div className="border-t border-neutral-700 my-2"></div>

            <button
              onClick={() => handleAction(onDelete || (() => { /* empty */ }))}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </button>
          </>
        )}

        {!isOwnComment && (
          <button
            onClick={() => handleAction(onReport || (() => { /* empty */ }))}
            className="w-full flex items-center gap-3 px-4 py-2 text-yellow-400 hover:bg-yellow-500/10 transition-colors text-left"
          >
            <Flag className="w-4 h-4" />
            <span className="text-sm">Report</span>
          </button>
        )}
      </div>
    </div>
  );
};
