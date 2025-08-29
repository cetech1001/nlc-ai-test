import {Button} from "@nlc-ai/web-ui";
import {useRouter} from "next/navigation";
import {FC} from "react";
import {Community} from "@nlc-ai/sdk-community";

export const CommunityDetailsRecentMembers: FC<{ community: Community }> = ({ community }) => {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Recent Members</h3>
        <Button
          onClick={() => router.push(`/communities/${community.id}/members`)}
          variant="outline"
          size="sm"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {community.members?.slice(0, 5).map((member, index) => (
          <div key={member.id || index} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {member.userName ? member.userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-stone-200 text-sm font-medium truncate">
                {member.userName || 'Unknown User'}
              </div>
              <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        member.role === 'owner' ? 'bg-yellow-600/20 text-yellow-400' :
                          member.role === 'admin' ? 'bg-purple-600/20 text-purple-400' :
                            member.role === 'moderator' ? 'bg-blue-600/20 text-blue-400' :
                              'bg-gray-600/20 text-gray-400'
                      }`}>
                        {member.role}
                      </span>
                <span className="text-stone-400 text-xs">•</span>
                <span className="text-stone-400 text-xs">{member.userType}</span>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${
              member.status === 'active' ? 'bg-green-400' : 'bg-red-400'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}
