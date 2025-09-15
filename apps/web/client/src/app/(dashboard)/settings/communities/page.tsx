'use client'

import { cn } from "@nlc-ai/web-ui";
import React from 'react';

interface CommunityCardProps {
  image: string;
  title: string;
  members: string;
  status: string;
  className?: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
 image,
 title,
 members,
 status,
 className
}) => {
  return (
    <div className={cn(
      "flex h-[110px] px-[30px] py-6 justify-between items-center flex-1 rounded-[30px] border border-[#2B2A2A] relative overflow-hidden",
      "bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]",
      className
    )}>
      {/* Glow Effect */}
      <div className="glow-circle -left-20 -bottom-1 w-[858px] h-[91px]"></div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-[10px]">
          <img
            src={image}
            alt={title}
            className="w-[61px] h-[62px] rounded-[20px] border border-[rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-white font-inter text-xl font-semibold leading-[25.6px]">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[#C5C5C5] font-inter text-base font-normal leading-[25.6px]">
              {members}
            </span>
            <svg className="w-[5px] h-[5px] fill-white opacity-20" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle opacity="0.2" cx="2.5" cy="3" r="2.5" fill="white"/>
            </svg>
            <span className="text-[#C5C5C5] font-inter text-base font-normal leading-[25.6px]">
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <button className="flex px-[18px] py-[13px] justify-center items-center gap-2 rounded-lg border border-white">
          <span className="text-white font-inter text-base font-medium leading-6 tracking-[-0.32px]">
            Settings
          </span>
        </button>

        {/* View Icon */}
        <svg className="w-8 h-8" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28.6741 13.1374C30.2202 14.7642 30.2202 17.2357 28.6741 18.8625C26.0663 21.6062 21.5877 25.3333 16.5003 25.3333C11.413 25.3333 6.93432 21.6062 4.3266 18.8625C2.78046 17.2357 2.78046 14.7642 4.3266 13.1374C6.93432 10.3937 11.413 6.66663 16.5003 6.66663C21.5877 6.66663 26.0663 10.3937 28.6741 13.1374Z" stroke="#595959" strokeWidth="2"/>
          <circle cx="16.5" cy="16" r="4" stroke="#595959" strokeWidth="2"/>
        </svg>

        {/* Pin Icon */}
        <svg className="w-8 h-8" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.8136 20.6864L4.5 28M21.6051 20.5015L23.8561 18.2506C24.3656 17.741 25.0567 17.4547 25.7774 17.4547C28.1981 17.4547 29.4104 14.5279 27.6987 12.8162L19.6837 4.80129C17.972 3.08957 15.0453 4.30188 15.0453 6.72261C15.0453 7.44325 14.759 8.13437 14.2494 8.64393L11.9984 10.8949C11.4889 11.4045 10.7977 11.6907 10.0771 11.6907C7.65637 11.6907 6.44406 14.6175 8.15578 16.3292L16.1707 24.3442C17.8825 26.0559 20.8092 24.8436 20.8092 22.4228C20.8092 21.7022 21.0955 21.0111 21.6051 20.5015Z" stroke="#595959" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

const communities = [
  {
    id: 1,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/3d6659a81090005043a4c9e2a8e3092dc2848c24?width=122",
    title: "Ultimate branding Course",
    members: "55.3k members",
    status: "Free"
  },
  {
    id: 2,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/ddc1ae4528aebec7dc7640621455acb2be51d317?width=122",
    title: "BNB BOSS Academy",
    members: "14 members",
    status: "Archived"
  },
  {
    id: 3,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/3d6659a81090005043a4c9e2a8e3092dc2848c24?width=122",
    title: "Ultimate branding Course",
    members: "55.3k members",
    status: "Free"
  },
  {
    id: 4,
    image: "https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=122",
    title: "BNB BOSS Academy",
    members: "14 members",
    status: "Archived"
  }
];

const CommunitiesSettings: React.FC = () => {
  return (
    // <SettingsLayout>
      <div className="flex w-full px-4 lg:px-[30px] py-[18px] flex-col items-start gap-[18px]">
        {/* Back Navigation */}
        <div className="flex items-center gap-5">
          <a href="/settings" className="flex w-8 h-8 justify-center items-center">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.66699 16.3659L25.667 16.3659" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.7334 24.3983L5.66673 16.3663L13.7334 8.33301" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <h2 className="text-[#F9F9F9] font-inter text-[30px] font-medium leading-[25.6px]">
            Communities
          </h2>
        </div>

        {/* Main Content */}
        <div className="h-[396px] self-stretch rounded-[30px] border border-[#2B2A2A] relative overflow-hidden bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
          {/* Glow Effect */}
          <div className="glow-circle right-[-133px] top-[-21px] w-[267px] h-[290px]"></div>

          <div className="flex w-full items-center border border-[#2B2A2A] rounded-[30px] h-[394px] relative">
            <div className="flex px-[37px] py-8 flex-col items-start gap-5 flex-1 relative z-10">
              <div className="flex w-full h-[330px] flex-col items-start gap-8">
                {/* Header */}
                <div className="flex w-full lg:w-[468px] flex-col items-start gap-1">
                  <div className="flex h-7 flex-col justify-center self-stretch">
                    <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                      Communities
                    </h3>
                  </div>
                  <p className="self-stretch text-[#C5C5C5] font-inter text-lg font-normal leading-[30px]">
                    Drag and drop to reorder, pin to sidebar, or hide
                  </p>
                </div>

                {/* Communities Grid */}
                <div className="flex flex-col items-start gap-4 self-stretch">
                  {/* First Row */}
                  <div className="flex flex-col lg:flex-row items-start gap-4 self-stretch">
                    <CommunityCard
                      image={communities[0].image}
                      title={communities[0].title}
                      members={communities[0].members}
                      status={communities[0].status}
                    />
                    <CommunityCard
                      image={communities[1].image}
                      title={communities[1].title}
                      members={communities[1].members}
                      status={communities[1].status}
                    />
                  </div>

                  {/* Second Row */}
                  <div className="flex flex-col lg:flex-row items-start gap-4 self-stretch">
                    <CommunityCard
                      image={communities[2].image}
                      title={communities[2].title}
                      members={communities[2].members}
                      status={communities[2].status}
                    />
                    <CommunityCard
                      image={communities[3].image}
                      title={communities[3].title}
                      members={communities[3].members}
                      status={communities[3].status}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    // </SettingsLayout>
  );
};

export default CommunitiesSettings;
