'use client'

import React, { useState, useEffect } from 'react';
import { Search, X, UserCircle, Users, Mail, Calendar } from 'lucide-react';
import { sdkClient } from '@/lib/sdk-client';
import { toast } from 'sonner';
import { UserType } from "@nlc-ai/types";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelected: (userID: string, userType: 'coach' | 'client') => void;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  type: 'coach' | 'client';
  isActive: boolean;
  createdAt: Date;
  businessName?: string; // For coaches
  lastLoginAt?: Date;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onUserSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'coaches' | 'clients'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setActiveTab('all');
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timeoutID = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timeoutID);
  }, [searchQuery, activeTab]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setHasSearched(true);

      const results: SearchResult[] = [];

      // Search coaches if needed
      if (activeTab === 'all' || activeTab === 'coaches') {
        try {
          const coachResponse = await sdkClient.users.coaches.getCoaches({
            search: searchQuery,
            page: 1,
            limit: 20,
          }, {});

          const coachResults: SearchResult[] = coachResponse.data.map(coach => ({
            id: coach.id,
            firstName: coach.firstName,
            lastName: coach.lastName,
            email: coach.email,
            avatarUrl: coach.avatarUrl,
            type: UserType.COACH,
            isActive: !!coach.isActive,
            createdAt: coach.createdAt!,
            businessName: coach.businessName,
            lastLoginAt: coach.lastLoginAt,
          }));

          results.push(...coachResults);
        } catch (error) {
          console.error('Error searching coaches:', error);
        }
      }

      // Search clients if needed
      if (activeTab === 'all' || activeTab === 'clients') {
        try {
          const clientResponse = await sdkClient.users.clients.getClients({
            search: searchQuery,
            page: 1,
            limit: 20,
          }, {});

          const clientResults: SearchResult[] = clientResponse.data.map(client => ({
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            avatarUrl: client.avatarUrl,
            type: UserType.CLIENT,
            isActive: !!client.isActive,
            createdAt: client.createdAt!,
            lastLoginAt: client.lastLoginAt,
          }));

          results.push(...clientResults);
        } catch (error) {
          console.error('Error searching clients:', error);
        }
      }

      // Sort results by relevance (exact name matches first, then alphabetical)
      results.sort((a, b) => {
        const aFullName = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bFullName = `${b.firstName} ${b.lastName}`.toLowerCase();
        const query = searchQuery.toLowerCase();

        // Exact matches first
        if (aFullName.includes(query) && !bFullName.includes(query)) return -1;
        if (!aFullName.includes(query) && bFullName.includes(query)) return 1;

        // Then alphabetical
        return aFullName.localeCompare(bFullName);
      });

      setSearchResults(results);
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: SearchResult) => {
    onUserSelected(user.id, user.type);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  const getUserTypeIcon = (type: 'coach' | 'client') => {
    return type === 'coach' ? (
      <UserCircle className="w-4 h-4 text-blue-400" />
    ) : (
      <Users className="w-4 h-4 text-green-400" />
    );
  };

  const getStatusBadge = (user: SearchResult) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded-full">Inactive</span>;
    }

    if (!user.lastLoginAt) {
      return <span className="px-2 py-1 text-xs bg-gray-600/20 text-gray-400 rounded-full">Never logged in</span>;
    }

    const daysSinceLogin = (new Date().getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLogin < 1) {
      return <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-full">Online recently</span>;
    } else if (daysSinceLogin < 7) {
      return <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded-full">Active this week</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-gray-600/20 text-gray-400 rounded-full">Inactive</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">Start New Conversation</h2>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-neutral-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab('coaches')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'coaches'
                  ? 'bg-purple-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Coaches
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'clients'
                  ? 'bg-purple-600 text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Clients
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400">Start typing to search for users...</p>
              <p className="text-stone-500 text-sm mt-1">Search by name or email address</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400">No users found</p>
              <p className="text-stone-500 text-sm mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}${user.lastName}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      {getUserTypeIcon(user.type)}
                      {getStatusBadge(user)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.businessName && (
                      <div className="text-xs text-stone-500 mt-1">
                        {user.businessName}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                      {user.lastLoginAt && (
                        <div>Last login {formatDate(user.lastLoginAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-700 bg-neutral-900/50">
          <p className="text-xs text-stone-500 text-center">
            Select a user to start a direct conversation
          </p>
        </div>
      </div>
    </div>
  );
};
