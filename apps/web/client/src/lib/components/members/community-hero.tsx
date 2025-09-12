import React, {FC} from "react";

export const CommunityHero: FC<{ community: any; }> = ({ community }) => {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-dark-600">
      <div className="absolute left-[30px] -bottom-[142px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute right-[13px] -bottom-[190px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute left-[591px] -top-[197px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative flex flex-col lg:flex-row items-start gap-6 p-4 sm:p-6 lg:p-8">
        <img
          src={community.image}
          alt={community.name}
          className="w-full lg:w-[310px] h-[192px] rounded-2xl border border-white/15 object-cover"
        />

        <div className="flex-1 space-y-5 w-full">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-semibold text-dark-900">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-dark-900/70 break-all">
                  {community.url}
                </p>
              </div>

              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
                <p className="text-sm sm:text-base text-dark-900 max-w-[606px] leading-relaxed">
                  {community.description}
                </p>

                <div className="flex items-center gap-3 sm:gap-6 justify-center xl:justify-end">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold text-dark-900">{community.stats.members}</div>
                    <div className="text-xs sm:text-sm text-dark-900/70">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold text-dark-900">{community.stats.online}</div>
                    <div className="text-xs sm:text-sm text-dark-900/70">Online</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold text-dark-900">{community.stats.admins}</div>
                    <div className="text-xs sm:text-sm text-dark-900/70">Admins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button className="btn-secondary w-full sm:w-auto">
              Invite People
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-3 text-white opacity-40">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <span className="text-sm sm:text-base">Contact UBC Admin team</span>
              </div>
              <div className="flex items-center gap-3 text-white opacity-40">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <span className="text-sm sm:text-base">Rules & Legal Pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
