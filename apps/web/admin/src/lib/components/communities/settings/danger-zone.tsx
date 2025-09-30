import { AlertTriangle, Trash2, Archive, RefreshCw } from 'lucide-react';
import { Button } from '@nlc-ai/web-ui';
import { CommunityResponse } from '@nlc-ai/types';

interface DangerZoneSettingsProps {
  community: CommunityResponse;
  onDelete: () => void;
}

export const DangerZoneSettings = ({ community, onDelete }: DangerZoneSettingsProps) => {
  return (
    <div className="bg-gradient-to-br from-red-800/20 to-red-900/30 rounded-2xl border border-red-700/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <h3 className="text-lg font-bold text-white">Danger Zone</h3>
      </div>

      <div className="space-y-4">
        {/* Archive Community */}
        <div className="p-4 bg-red-800/10 border border-red-700/30 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Archive className="w-4 h-4 text-orange-400" />
                <h4 className="text-white font-medium text-sm">Archive Community</h4>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                Make the community read-only. Members can view content but cannot post or interact.
                This is reversible.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-600/50 text-orange-400 hover:bg-orange-600/10"
            >
              <Archive className="w-3 h-3 mr-1" />
              Archive
            </Button>
          </div>
        </div>

        {/* Reset Community */}
        <div className="p-4 bg-red-800/10 border border-red-700/30 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-yellow-400" />
                <h4 className="text-white font-medium text-sm">Reset Community</h4>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                Remove all posts, comments, and activity while keeping members and settings.
                This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Delete Community */}
        <div className="p-4 bg-red-800/20 border border-red-600/50 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4 text-red-400" />
                <h4 className="text-white font-medium text-sm">Delete Community</h4>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed mb-2">
                Permanently delete this community and all its data including posts, comments,
                member information, and analytics. This action cannot be undone.
              </p>
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <span>👥 {community.memberCount} members will lose access</span>
                <span>📝 {community.postCount} posts will be deleted</span>
              </div>
            </div>
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="bg-red-600/80 hover:bg-red-600 border-red-500"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-red-300 text-xs leading-relaxed">
            <strong>Important:</strong> These actions affect all community members and content.
            Make sure to communicate with your community before taking any destructive actions.
            Consider exporting important data first.
          </div>
        </div>
      </div>
    </div>
  );
};
