import {Button} from "@nlc-ai/web-ui";
import {Eye} from "lucide-react";
import {useRouter} from "next/navigation";
import {CommunityActivity} from "@nlc-ai/types";
import {FC} from "react";

interface IProps {
  communityID: string;
  activities: CommunityActivity[];
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'post_created':
      return 'from-green-500 to-emerald-600';
    case 'member_joined':
      return 'from-blue-500 to-cyan-600';
    case 'comment_added':
      return 'from-purple-500 to-violet-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'post_created':
      return 'P';
    case 'member_joined':
      return 'J';
    case 'comment_added':
      return 'C';
    default:
      return 'A';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export const CommunityDetailsRecentActivity: FC<IProps> = ({ communityID, activities }) => {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <Button
          onClick={() => router.push(`/communities/${communityID}/posts`)}
          variant="outline"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getActivityColor(activity.type)} flex items-center justify-center text-white text-sm font-bold`}>
                {activity.userAvatarUrl ? (
                  <img
                    src={activity.userAvatarUrl}
                    alt={activity.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getActivityIcon(activity.type)
                )}
              </div>
              <div className="flex-1">
                <p className="text-stone-200 text-sm">
                  <span className="font-medium">{activity.userName}</span> {activity.description}
                </p>
                <p className="text-stone-400 text-xs mt-1">{formatTimeAgo(activity.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-stone-400 text-sm">No recent activity</div>
          </div>
        )}
      </div>
    </div>
  );
}
