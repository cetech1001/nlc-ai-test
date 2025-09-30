import {Button} from "@nlc-ai/web-ui";
import {Settings} from "lucide-react";
import {useRouter} from "next/navigation";
import {FC} from "react";
import {CommunityResponse} from "@nlc-ai/types";

export const CommunityDetailsSettingsPreview: FC<{ community: CommunityResponse }> = ({ community }) => {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Settings Overview</h3>
        <Button
          onClick={() => router.push(`/communities/${community.id}/settings`)}
          variant="outline"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-stone-300 text-sm">Member Posts</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            community.settings?.allowMemberPosts
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}>
                    {community.settings?.allowMemberPosts ? 'Enabled' : 'Disabled'}
                  </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-300 text-sm">Post Approval</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            community.settings?.requireApproval
              ? 'bg-yellow-600/20 text-yellow-400'
              : 'bg-green-600/20 text-green-400'
          }`}>
                    {community.settings?.requireApproval ? 'Required' : 'Not Required'}
                  </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-300 text-sm">File Uploads</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            community.settings?.allowFileUploads
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}>
                    {community.settings?.allowFileUploads ? 'Allowed' : 'Disabled'}
                  </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-300 text-sm">Max Post Length</span>
          <span className="text-stone-200 text-sm font-medium">
                    {community.settings?.maxPostLength || 5000} chars
                  </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-300 text-sm">Moderation</span>
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">
                    {community.settings?.moderationLevel || 'Moderate'}
                  </span>
        </div>
      </div>
    </div>
  );
}
