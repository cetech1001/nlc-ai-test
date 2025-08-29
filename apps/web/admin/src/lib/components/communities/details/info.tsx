import {Crown} from "lucide-react";
import {FC, useEffect, useState} from "react";
import {Community} from "@nlc-ai/sdk-community";
import { appConfig } from "@nlc-ai/web-shared";
import { formatCurrency } from "@nlc-ai/web-utils";
import {sdkClient} from "@/lib";

export const CommunityDetailsInfo: FC<{ community: Community }> = ({ community }) => {
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    if (community.ownerID) {
      (() => lookupOwner())();
    }
  }, [community.ownerID]);

  const lookupOwner = async () => {
    const owner = await sdkClient.users.profile.lookupProfile(community.ownerType, community.ownerID);
    setOwner(owner);
  }

  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Information</h3>

      <div className="space-y-4 text-sm">
        <div>
          <span className="text-stone-400 block">Community ID</span>
          <span className="text-stone-200 font-mono text-xs">#{community.id.split('-')[0]}</span>
        </div>

        <div>
          <span className="text-stone-400 block">Owner</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-stone-200">{owner?.firstName} {owner?.lastName}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-200 font-mono text-xs">{community.ownerType}</span>
          </div>
        </div>

        {community.coachID && (
          <div>
            <span className="text-stone-400 block">Coach ID</span>
            <span className="text-stone-200 font-mono text-xs">{community.coachID}</span>
          </div>
        )}

        {community.courseID && (
          <div>
            <span className="text-stone-400 block">Course ID</span>
            <span className="text-stone-200 font-mono text-xs">{community.courseID}</span>
          </div>
        )}

        {community.slug && (
          <div>
            <span className="text-stone-400 block">Community URL</span>
            <span className="text-stone-200 font-mono text-xs">
              {`${appConfig.publicUrl}/communities/${community.slug}`}
            </span>
          </div>
        )}

        <div>
          <span className="text-stone-400 block">Pricing</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-stone-200 capitalize">{community.pricingType}</span>
            {community.pricingAmount && (
              <>
                <span className="text-stone-400">•</span>
                <span className="text-stone-200">
                  {formatCurrency(community.pricingAmount)}
                </span>
              </>
            )}
          </div>
        </div>

        {community.isSystemCreated && (
          <div>
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
              <Crown className="w-3 h-3" />
              System Created
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
