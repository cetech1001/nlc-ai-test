import {FC, useState} from "react";
import {Calendar, Clock, Edit, Eye, MoreVertical, Play, Trash2} from "lucide-react";
import {ContentPiece} from "@nlc-ai/sdk-content";
import {formatDate} from "@nlc-ai/sdk-core";

interface VideoCardProps {
  video: ContentPiece;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const VideoCard: FC<VideoCardProps> = ({ video, onPlay, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
        <img
          src={video.thumbnailUrl || ''}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onPlay}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <Play className="w-6 h-6 text-white fill-current" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          <Clock className="w-3 h-3 inline mr-1" />
          {video.durationSeconds}
        </div>

        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-20">
              <button
                onClick={() => { onEdit(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-stone-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Video
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

      {/* Video Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1 text-stone-300">
            <Eye className="w-3 h-3" />
            <span>{video.views?.toLocaleString()} views</span>
          </div>
          <div className="text-right">
            <span className="text-stone-300">{Number(video.engagementRate)}% engagement</span>
          </div>
        </div>

        <button
          onClick={onPlay}
          className="w-full bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 text-fuchsia-400 py-2 rounded-lg hover:bg-gradient-to-r hover:from-fuchsia-600/30 hover:to-violet-600/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          Play Video
        </button>
      </div>
    </div>
  );
};
