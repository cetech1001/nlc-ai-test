import {MessageSquare, Settings, TrendingUp, Users} from "lucide-react";
import {Button} from "@nlc-ai/web-ui";
import {useRouter} from "next/navigation";
import {FC} from "react";

export const CommunityDetailsQuickActions: FC<{ communityID: string }> = ({ communityID }) => {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>

      <div className="space-y-3">
        <Button
          onClick={() => router.push(`/communities/${communityID}/members`)}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Users className="w-4 h-4 mr-3" />
          Manage Members
        </Button>

        <Button
          onClick={() => router.push(`/communities/${communityID}/posts`)}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <MessageSquare className="w-4 h-4 mr-3" />
          View Posts
        </Button>

        <Button
          onClick={() => router.push(`/communities/${communityID}/analytics`)}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <TrendingUp className="w-4 h-4 mr-3" />
          Analytics
        </Button>

        <Button
          onClick={() => router.push(`/communities/${communityID}/settings`)}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
}
