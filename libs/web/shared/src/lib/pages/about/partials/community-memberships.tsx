import React from 'react';
import { Users } from 'lucide-react';
import { CommunityResponse } from '@nlc-ai/types';
import { CommunityMembershipsSkeleton } from './skeletons';

interface CommunityMembershipsProps {
  communities: CommunityResponse[];
  isLoading: boolean;
}

export const CommunityMemberships: React.FC<CommunityMembershipsProps> = ({
                                                                            communities,
                                                                            isLoading
                                                                          }) => {
  if (isLoading) {
    return <CommunityMembershipsSkeleton />;
  }

  if (communities.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-stone-400 mx-auto mb-4" />
        <p className="text-stone-300">No community memberships</p>
      </div>
    );
  }

  const getPricingLabel = (community: CommunityResponse) => {
    if (community.pricingType === 'free') return 'Free';
    if (community.oneTimePrice) return `$${(community.oneTimePrice / 100).toFixed(2)}`;
    if (community.monthlyPrice) return `$${(community.monthlyPrice / 100).toFixed(2)}/mo`;
    if (community.annualPrice) return `$${(community.annualPrice / 100).toFixed(2)}/yr`;
    return 'Paid';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {communities.map((community) => (
        <div key={community.id} className="relative glass-card rounded-2xl p-6 hover:border-purple-400/50 transition-colors cursor-pointer overflow-hidden bg-gradient-to-b from-neutral-800/50 to-neutral-900/50">
          {/* Glow Orb */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute w-32 h-32 -right-6 -bottom-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600/20 to-violet-800/20 rounded-[9px] border border-purple-600/20 flex items-center justify-center flex-shrink-0">
              {community.avatarUrl ? (
                <img
                  src={community.avatarUrl}
                  alt={community.name}
                  className="w-full h-full rounded-[9px] object-cover"
                />
              ) : (
                <Users className="w-6 h-6 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground text-lg font-semibold mb-1 truncate">
                {community.name}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>{community.memberCount} members</span>
                <div className="w-1 h-1 bg-[#4B4B4B] rounded-full"></div>
                <span>{getPricingLabel(community)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
