'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Lightbulb,
  Play,
  Users,
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  videosCount: number;
  lastUpdated: string;
  color: string;
  totalViews: number;
  avgEngagement: number;
}

const mockCategories: ContentCategory[] = [
  {
    id: '1',
    name: 'Controversial',
    description: 'Content that challenges traditional ideas and sparks debate, encouraging viewers to think critically and engage in discussions.',
    icon: MessageCircle,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-red-500 to-orange-500',
    totalViews: 125000,
    avgEngagement: 8.5
  },
  {
    id: '2',
    name: 'Informative',
    description: 'Educational content designed to deliver valuable knowledge and practical insights in a clear and easy-to-understand way.',
    icon: Lightbulb,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-blue-500 to-cyan-500',
    totalViews: 98000,
    avgEngagement: 7.2
  },
  {
    id: '3',
    name: 'Entertainment',
    description: 'Fun and engaging videos meant to entertain and captivate the audience, offering light-hearted content to create emotional connections.',
    icon: Play,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-purple-500 to-pink-500',
    totalViews: 87000,
    avgEngagement: 9.1
  },
  {
    id: '4',
    name: 'Conversational',
    description: 'Content that challenges traditional ideas and sparks debate, encouraging viewers to think critically and engage in discussions.',
    icon: Users,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-green-500 to-teal-500',
    totalViews: 76000,
    avgEngagement: 6.8
  },
  {
    id: '5',
    name: 'Case Studies',
    description: 'Content that build social proof using testimonials and feedbacks from your clients.',
    icon: FileText,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-indigo-500 to-purple-500',
    totalViews: 54000,
    avgEngagement: 7.9
  }
];

interface CategoryCardProps {
  category: ContentCategory;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard = ({ category, onViewDetails, onEdit, onDelete }: CategoryCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = category.icon;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <div className={`absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l ${category.color} rounded-full blur-[56px]`} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-neutral-700">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-stone-50" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-stone-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Category
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-neutral-700 flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-stone-50 text-xl font-semibold leading-tight mb-2">
          {category.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-stone-400">
          <span>{category.videosCount} Videos Uploaded</span>
          <span>•</span>
          <span>Last Updated: {category.lastUpdated}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 space-y-4">
        <div>
          <h4 className="text-stone-300 text-sm font-medium mb-2">About Category</h4>
          <p className="text-stone-400 text-sm leading-relaxed line-clamp-3">
            {category.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-stone-300 text-lg font-semibold">
              {category.totalViews.toLocaleString()}
            </div>
            <div className="text-stone-500 text-xs">Total Views</div>
          </div>
          <div className="space-y-1">
            <div className="text-stone-300 text-lg font-semibold">
              {category.avgEngagement}%
            </div>
            <div className="text-stone-500 text-xs">Avg Engagement</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onViewDetails}
            className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoriesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 animate-pulse">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-700 rounded-xl"></div>
            <div className="w-6 h-6 bg-neutral-700 rounded"></div>
          </div>
          <div className="h-6 bg-neutral-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-full"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-neutral-700 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/5"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="h-5 bg-neutral-700 rounded w-16"></div>
              <div className="h-3 bg-neutral-700 rounded w-20"></div>
            </div>
            <div className="space-y-1">
              <div className="h-5 bg-neutral-700 rounded w-12"></div>
              <div className="h-3 bg-neutral-700 rounded w-24"></div>
            </div>
          </div>
          <div className="h-4 bg-neutral-700 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ContentCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'videos' | 'views' | 'engagement'>('name');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewDetails = (categoryID: string) => {
    router.push(`/content/categories/${categoryID}`);
  };

  const handleEditCategory = (categoryID: string) => {
    console.log('Edit category:', categoryID);
    // Handle edit logic
  };

  const handleDeleteCategory = (categoryID: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== categoryID));
    }
  };

  const handleUploadContent = () => {
    router.push('/content/upload');
  };

  const handleCreateCategory = () => {
    console.log('Create new category');
    // Handle create category logic
  };

  const filteredCategories = categories
    .filter(category =>
      searchQuery === "" ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'videos':
          return b.videosCount - a.videosCount;
        case 'views':
          return b.totalViews - a.totalViews;
        case 'engagement':
          return b.avgEngagement - a.avgEngagement;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalVideos = categories.reduce((sum, cat) => sum + cat.videosCount, 0);
  const totalViews = categories.reduce((sum, cat) => sum + cat.totalViews, 0);
  const avgEngagement = categories.reduce((sum, cat) => sum + cat.avgEngagement, 0) / categories.length;

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <PageHeader title="Content Categories">
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg text-sm focus:border-purple-500 outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="videos">Sort by Videos</option>
                <option value="views">Sort by Views</option>
                <option value="engagement">Sort by Engagement</option>
              </select>

              <button
                onClick={handleCreateCategory}
                className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>

              <button
                onClick={handleUploadContent}
                className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Upload New Content
              </button>
            </div>
          </>
        </PageHeader>

        {/* Stats Overview */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-3 -top-5 bg-gradient-to-l from-blue-400 to-blue-600 rounded-full blur-[40px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-1">Total Videos</div>
                <div className="text-stone-50 text-2xl font-bold">{totalVideos}</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-3 -top-5 bg-gradient-to-l from-green-400 to-green-600 rounded-full blur-[40px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-1">Total Views</div>
                <div className="text-stone-50 text-2xl font-bold">{totalViews.toLocaleString()}</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-3 -top-5 bg-gradient-to-l from-purple-400 to-purple-600 rounded-full blur-[40px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-1">Avg Engagement</div>
                <div className="text-stone-50 text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <CategoriesSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onViewDetails={() => handleViewDetails(category.id)}
                  onEdit={() => handleEditCategory(category.id)}
                  onDelete={() => handleDeleteCategory(category.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">No categories found</div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No categories match your search for "${searchQuery}"`
                    : 'No content categories available'
                  }
                </div>
                <button
                  onClick={handleCreateCategory}
                  className="mt-4 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Create Your First Category
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
