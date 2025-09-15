import React from 'react';

const ContentCreationAgentInsights: React.FC = () => {
  return (
    <div className="p-[30px] bg-[#070300] min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Style Efficiency */}
        <div className="lg:col-span-4 relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute right-[-80px] -top-[200px] w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-1">
                Style Efficiency
              </h3>
              <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
                The data is based on the number of view each category gets
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-6">
              {/* Controversial */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold">Controversial</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal">11,121 views</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[82%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>

              {/* Informative */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold">Informative</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal">3,150 views</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[33%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>

              {/* Conversational */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold">Conversational</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal">8,352 views</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[76%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>

              {/* Entertainment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold">Entertainment</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal">5,280 views</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[55%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>

              {/* Case Studies */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold">Case Studies</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal">4,375 views</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[41%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Growth */}
        <div className="lg:col-span-8 relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-16 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%] mb-2">
                  Social Media Growth
                </h3>
                <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%]">
                  Increase in followers and engagement.
                </p>
                <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mt-4">
                  87%
                </div>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">Engagement</span>
                <div className="w-px h-4 bg-white"></div>
                <span className="text-[#DF69FF] font-inter text-sm font-bold leading-[25.6px]">Followers</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-center gap-4 h-[180px] mb-4">
              <div className="w-[70px] h-[48px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="w-[70px] h-[82px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="w-[70px] h-[103px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="w-[70px] h-[125px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="w-[70px] h-[148px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="w-[70px] h-[164px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="w-[70px] h-[180px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
            </div>

            {/* Month Labels */}
            <div className="flex justify-between text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px] px-2">
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>

            {/* Hover tooltip - positioned as example */}
            <div className="absolute top-[150px] left-[453px] w-[131px] h-[53px]">
              <div className="relative">
                <div className="w-[120px] h-[48px] rounded-[17.262px] border border-[#B339D4] bg-[rgba(179,57,212,0.10)] backdrop-blur-[6.5px] flex items-center justify-center">
                  <span className="text-[#F4F4F5] font-inter text-sm font-normal leading-[160%]">250 Followers</span>
                </div>
                <svg className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M7.47459 7.15864C6.79963 7.83781 5.70084 7.83781 5.02587 7.15864L1.45534 3.56587C0.373129 2.47691 1.14445 0.622937 2.6797 0.622937L9.82076 0.622937C11.356 0.622937 12.1273 2.47691 11.0451 3.56587L7.47459 7.15864Z" fill="#B339D4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Virality Factor */}
        <div className="lg:col-span-2 relative w-full h-[386px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-8 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-6">
              Virality Factor
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-6">
              Number of posts that exceeded average engagement by 2x or more.
            </p>

            {/* Semicircle Chart */}
            <div className="relative flex justify-center mt-12">
              <div className="relative w-[213px] h-[107px]">
                {/* Background semicircle */}
                <svg className="absolute inset-0" width="213" height="107" viewBox="0 0 213 107" fill="none">
                  <path d="M0 106.5C2.46931e-06 78.2544 11.2205 51.1658 31.1931 31.1931C51.1657 11.2205 78.2544 3.03031e-06 106.5 0C134.746 -3.03031e-06 161.834 11.2205 181.807 31.1931C201.779 51.1657 213 78.2544 213 106.5L180.193 106.5C180.193 86.9553 172.429 68.2112 158.609 54.391C144.789 40.5709 126.045 32.8068 106.5 32.8068C86.9553 32.8068 68.2112 40.5709 54.391 54.391C40.5709 68.2112 32.8068 86.9553 32.8068 106.5H0Z" fill="#242424"/>
                </svg>

                {/* Progress semicircle - 85% */}
                <svg className="absolute inset-0" width="146" height="107" viewBox="0 0 146 107" fill="none">
                  <path d="M0 106.5C1.51437e-06 89.1776 4.22537 72.1166 12.3097 56.7964C20.3941 41.4762 32.0934 28.3592 46.3933 18.5828C60.6932 8.80633 77.162 2.66553 94.3717 0.692844C111.581 -1.27984 129.013 0.97512 145.154 7.26222L133.247 37.8319C122.078 33.4815 110.016 31.9212 98.1078 33.2862C86.1994 34.6512 74.8038 38.9004 64.9089 45.6653C55.014 52.4301 46.9186 61.5065 41.3246 72.1074C35.7306 82.7083 32.8068 94.5137 32.8068 106.5H0Z"
                        fill="url(#viralityGradient)"/>
                  <defs>
                    <linearGradient id="viralityGradient" x1="2" y1="2" x2="4.07116" y2="-25.7174" gradientUnits="userSpaceOnUse">
                      <stop offset="0.0192308" stopColor="#FEBEFA"/>
                      <stop offset="0.346154" stopColor="#B339D4"/>
                      <stop offset="0.653846" stopColor="#7B21BA"/>
                      <stop offset="1" stopColor="#7B26F0"/>
                    </linearGradient>
                  </defs>
                </svg>

                {/* Percentage display */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                  <span className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px]">
                    85
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Boost */}
        <div className="lg:col-span-6 relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-9 -top-[100px] w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%] mb-2">
              Efficiency Boost
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-6">
              Time saved on content ideation and creation.
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-8">
              87%
            </div>

            {/* Stats */}
            <div className="flex justify-between mb-6">
              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-[#DF69FF] font-inter text-xl font-medium leading-[25.6px]">1,240 Hrs</span>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Saved through our platform</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[#9C55FF] font-inter text-xl font-medium leading-[25.6px]">2,426 Hrs</span>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Would have taken manually</span>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="flex flex-col gap-8 flex-1 max-w-[377px] ml-8">
                {/* Time Saved Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] w-24">
                    Time Saved
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full h-[55px] rounded-lg bg-[#242424] flex items-center">
                      <div className="h-full w-[192px] rounded-lg"
                           style={{background: 'linear-gradient(164deg, #B339D4 12.41%, #E583FF 55.26%, #B339D4 90.59%)'}}>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] text-right w-10">
                    1240
                  </span>
                </div>

                {/* Manual Time Requirement Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] w-52">
                    Manual Time Requirement
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full h-[55px] rounded-lg bg-[#242424] flex items-center">
                      <div className="h-full w-[327px] rounded-lg"
                           style={{background: 'linear-gradient(180deg, #4B0BA3 0%, #9C63EA 44.71%, #4B0BA3 100%)'}}>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] text-right w-10">
                    2426
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Average Engagement */}
        <div className="lg:col-span-4 relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-16 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-1">
                Average Engagement
              </h3>
              <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
                How your content is performing
              </p>
            </div>

            {/* Engagement Metrics */}
            <div className="space-y-6 mb-8">
              {/* Likes */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold leading-[25.6px]">Likes</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">11,121</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[57%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>

              {/* Shares */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold leading-[25.6px]">Shares</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">1,150</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[33%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9F9] font-inter text-sm font-semibold leading-[25.6px]">Comments</span>
                  <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">2,652</span>
                </div>
                <div className="relative w-full h-1">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 w-[50%] rounded-full"
                       style={{background: 'linear-gradient(90deg, #FEBEFA 0%, #B339D4 25%, #7B21BA 50%, #7B26F0 100%)'}}>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Time To Post */}
            <div className="flex justify-between items-center">
              <span className="text-[#F9F9F9] font-inter text-sm font-semibold leading-[25.6px]">Best Time To Post</span>
              <span className="text-[#9C55FF] font-inter text-sm font-normal leading-[25.6px]">9:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreationAgentInsights;
