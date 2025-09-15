import React from 'react';

const CoachReplicaAgentInsights: React.FC = () => {
  return (
    <div className="p-[30px] bg-[#070300] min-h-full">
      {/* Top Row - Three Cards */}
      <div className="flex gap-5 mb-5">
        {/* Appointment Setting Efficiency */}
        <div className="relative w-[570px] h-[209px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-4 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-3">
              Appointment Setting Efficiency
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-8">
              Number of calls booked directly through the agent.
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px]">
              49
            </div>
          </div>
        </div>

        {/* Total Client Interactions */}
        <div className="relative w-[570px] h-[209px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-4 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-3">
              Total Client Interactions
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-8">
              Number of interactions by all clients on your replica.
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px]">
              6287
            </div>
          </div>
        </div>

        {/* Highest Leads Captured In */}
        <div className="relative w-[570px] h-[209px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-4 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-3">
              Highest Leads Captured In
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-8">
              Maximum leads captured month in this year
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px]">
              March
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Three Cards */}
      <div className="flex gap-5">
        {/* Lead Capture Rate */}
        <div className="relative w-[286px] h-[386px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-8 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-6">
              Lead Capture Rate
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-8">
              Number of leads captured via the chatbot.
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
                        fill="url(#captureGradient)"/>
                  <defs>
                    <linearGradient id="captureGradient" x1="2" y1="2" x2="4.07116" y2="-25.7174" gradientUnits="userSpaceOnUse">
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

        {/* Client Interaction Quality */}
        <div className="relative w-[712px] h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-9 -top-[100px] w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Client Interaction Quality
              </h3>
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
                <g clipPath="url(#clip0)">
                  <path d="M12 0.5C5.3832 0.5 0 5.88327 0 12.5001C0 19.1169 5.3832 24.5 12 24.5C18.6168 24.5 24 19.1169 24 12.5001C24 5.88327 18.6168 0.5 12 0.5ZM12 22.3182C6.58618 22.3182 2.18182 17.9138 2.18182 12.5001C2.18182 7.08633 6.58618 2.68182 12 2.68182C17.4138 2.68182 21.8182 7.08633 21.8182 12.5001C21.8182 17.9138 17.4137 22.3182 12 22.3182Z" fill="#F9F9F9"/>
                  <path d="M12.0011 5.59094C11.1992 5.59094 10.5469 6.24374 10.5469 7.04614C10.5469 7.84782 11.1992 8.50003 12.0011 8.50003C12.803 8.50003 13.4554 7.84782 13.4554 7.04614C13.4554 6.24374 12.803 5.59094 12.0011 5.59094Z" fill="#F9F9F9"/>
                  <path d="M11.9972 10.6818C11.3947 10.6818 10.9062 11.1702 10.9062 11.7727V18.3181C10.9062 18.9206 11.3947 19.409 11.9972 19.409C12.5996 19.409 13.0881 18.9206 13.0881 18.3181V11.7727C13.0881 11.1702 12.5996 10.6818 11.9972 10.6818Z" fill="#F9F9F9"/>
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect width="24" height="24" fill="white" transform="translate(0 0.5)"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-8">
              87%
            </div>

            {/* Stats */}
            <div className="flex justify-between mb-6">
              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-[#DF69FF] font-inter text-xl font-medium leading-[25.6px]">5000</span>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Likes On Chat Interactions</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[#9C55FF] font-inter text-xl font-medium leading-[25.6px]">747</span>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Dislikes On Chat Interactions</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end gap-8 h-[247px]">
                {/* Likes Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-[55px] h-[208px] rounded-lg bg-[#242424] flex flex-col justify-end">
                    <div className="w-full h-[165px] rounded-b-lg"
                         style={{background: 'linear-gradient(164deg, #B339D4 12.41%, #E583FF 55.26%, #B339D4 90.59%)'}}>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[#F9F9F9] text-center font-inter text-sm font-medium mb-1">5000</div>
                    <div className="text-[#C5C5C5] text-center font-inter text-base font-medium w-12">Likes</div>
                  </div>
                </div>

                {/* Dislikes Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-[55px] h-[208px] rounded-lg bg-[#242424] flex flex-col justify-end">
                    <div className="w-full h-[43px] rounded-b-lg"
                         style={{background: 'linear-gradient(180deg, #4B0BA3 0%, #9C63EA 44.71%, #4B0BA3 100%)'}}>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[#F9F9F9] text-center font-inter text-sm font-medium mb-1">747</div>
                    <div className="text-[#C5C5C5] text-center font-inter text-base font-medium w-16">Dislikes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="relative w-[712px] h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-9 -top-[100px] w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%] mb-2">
              Conversion Metrics
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-6">
              Leads captured versus those that convert to paying clients.
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-8">
              47%
            </div>

            {/* Stats */}
            <div className="flex justify-between mb-6">
              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-[#DF69FF] font-inter text-xl font-medium leading-[25.6px]">528</span>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Leads Converted</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[#9C55FF] font-inter text-xl font-medium leading-[25.6px]">1248</span>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Leads Captured</span>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="flex flex-col gap-8 flex-1 max-w-[377px] ml-8">
                {/* Leads Converted Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] w-32">
                    Leads Converted
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full h-[55px] rounded-lg bg-[#242424] flex items-center">
                      <div className="h-full w-[192px] rounded-lg"
                           style={{background: 'linear-gradient(164deg, #B339D4 12.41%, #E583FF 55.26%, #B339D4 90.59%)'}}>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] text-right w-8">
                    528
                  </span>
                </div>

                {/* Total Leads Captured Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] w-40">
                    Total Leads Captured
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full h-[55px] rounded-lg bg-[#242424] flex items-center">
                      <div className="h-full w-[327px] rounded-lg"
                           style={{background: 'linear-gradient(180deg, #4B0BA3 0%, #9C63EA 44.71%, #4B0BA3 100%)'}}>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] text-right w-10">
                    1248
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachReplicaAgentInsights;
