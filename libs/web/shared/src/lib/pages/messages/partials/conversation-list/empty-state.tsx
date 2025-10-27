'use client'

import React from 'react';
import {Users} from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  return (
    <div className="text-center py-8">
      <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
      <p className="text-stone-400 text-sm">No conversations found</p>
      {searchQuery && (
        <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
      )}
    </div>
  );
};
