import {ComponentType, FC, useState} from "react";
import {Edit, MoreVertical, Trash2} from "lucide-react";
import {ContentCategory} from "@nlc-ai/types";

interface CategoryCardProps {
  category: ContentCategory & { icon: ComponentType<any>; color: string; };
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const CategoryCard: FC<CategoryCardProps> = ({ category, onViewDetails, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = category.icon;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
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
