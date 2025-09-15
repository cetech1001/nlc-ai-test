import React from 'react';

const LeadFollowUpAgentInsights: React.FC = () => {
  return (
    <div className="p-[30px] bg-[#070300] min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Follow-up Success Rates */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-4 bottom-16 w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%] mb-6">
              Follow-up
              <br />
              Success Rates
            </h3>

            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-6 w-[226px]">
              Percentage decrease in client drop-off after proactive outreach.
            </p>

            {/* Semicircle Chart */}
            <div className="relative flex justify-center mt-12">
              <div className="relative w-[213px] h-[107px]">
                {/* Background semicircle */}
                <svg className="absolute inset-0" width="213" height="107" viewBox="0 0 213 107" fill="none">
                  <path d="M0 106.5C2.46931e-06 78.2544 11.2205 51.1658 31.1931 31.1931C51.1657 11.2205 78.2544 3.03031e-06 106.5 0C134.746 -3.03031e-06 161.834 11.2205 181.807 31.1931C201.779 51.1657 213 78.2544 213 106.5L180.193 106.5C180.193 86.9553 172.429 68.2112 158.609 54.391C144.789 40.5709 126.045 32.8068 106.5 32.8068C86.9553 32.8068 68.2112 40.5709 54.391 54.391C40.5709 68.2112 32.8068 86.9553 32.8068 106.5H0Z" fill="#242424"/>
                </svg>

                {/* Progress semicircle - 80% */}
                <svg className="absolute inset-0" width="193" height="107" viewBox="0 0 193 107" fill="none">
                  <path d="M0 106.5C1.96619e-06 84.0094 7.12006 62.0961 20.3397 43.9009C33.5593 25.7056 52.1999 12.1624 73.5897 5.21247C94.9795 -1.7375 118.021 -1.73749 139.41 5.21249C160.8 12.1625 179.441 25.7056 192.66 43.9009L166.119 63.1843C156.972 50.5939 144.073 41.2227 129.272 36.4136C114.472 31.6045 98.5284 31.6045 83.7276 36.4136C68.9268 41.2227 56.0284 50.5939 46.881 63.1842C37.7336 75.7745 32.8068 90.9375 32.8068 106.5H0Z"
                        fill="url(#gradient1)"/>
                  <defs>
                    <linearGradient id="gradient1" x1="2" y1="2" x2="4.07116" y2="-25.7174" gradientUnits="userSpaceOnUse">
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
                    80%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Conversion Boost */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-9 -top-[100px] w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Lead Conversion Boost
              </h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0)">
                  <path d="M12 0C5.3832 0 0 5.38327 0 12.0001C0 18.6169 5.3832 24 12 24C18.6168 24 24 18.6169 24 12.0001C24 5.38327 18.6168 0 12 0ZM12 21.8182C6.58618 21.8182 2.18182 17.4138 2.18182 12.0001C2.18182 6.58633 6.58618 2.18182 12 2.18182C17.4138 2.18182 21.8182 6.58633 21.8182 12.0001C21.8182 17.4138 17.4137 21.8182 12 21.8182Z" fill="#F9F9F9"/>
                  <path d="M12.0011 5.09094C11.1992 5.09094 10.5469 5.74374 10.5469 6.54614C10.5469 7.34782 11.1992 8.00003 12.0011 8.00003C12.803 8.00003 13.4554 7.34782 13.4554 6.54614C13.4554 5.74374 12.803 5.09094 12.0011 5.09094Z" fill="#F9F9F9"/>
                  <path d="M11.9972 10.1818C11.3947 10.1818 10.9062 10.6702 10.9062 11.2727V17.8181C10.9062 18.4206 11.3947 18.909 11.9972 18.909C12.5996 18.909 13.0881 18.4206 13.0881 17.8181V11.2727C13.0881 10.6702 12.5996 10.1818 11.9972 10.1818Z" fill="#F9F9F9"/>
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-8">
              67%
            </div>

            {/* Stats */}
            <div className="space-y-6 mb-6">
              <div className="flex flex-col">
                <span className="text-[#DF69FF] font-inter text-xl font-medium leading-[25.6px]">1,232</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Leads Converted</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[#9C55FF] font-inter text-xl font-medium leading-[25.6px]">1,832</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Follow-up Emails Sent</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex justify-end">
              <div className="flex items-end gap-4 h-[208px]">
                {/* Conversions Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-[55px] h-[208px] rounded-lg bg-[#242424] flex flex-col justify-end">
                    <div className="w-full h-[96px] rounded-b-lg"
                         style={{background: 'linear-gradient(164deg, #B339D4 12.41%, #E583FF 55.26%, #B339D4 90.59%)'}}>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[#F9F9F9] text-center font-inter text-sm font-medium mb-1">1,232</div>
                    <div className="text-[#C5C5C5] text-center font-inter text-base font-medium w-24">Conversions</div>
                  </div>
                </div>

                {/* Follow-Ups Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-[55px] h-[208px] rounded-lg bg-[#242424] flex flex-col justify-end">
                    <div className="w-full h-[163px] rounded-b-lg"
                         style={{background: 'linear-gradient(180deg, #4B0BA3 0%, #9C63EA 44.71%, #4B0BA3 100%)'}}>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[#F9F9F9] text-center font-inter text-sm font-medium mb-1">1,832</div>
                    <div className="text-[#C5C5C5] text-center font-inter text-base font-medium w-32">Follow-Ups Sent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Response Rate After Follow-Up */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
             style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
          {/* Background glow */}
          <div className="absolute -left-9 -top-[100px] w-[223px] h-[223px] opacity-50 blur-[112.55px]"
               style={{background: 'radial-gradient(50% 50% at 50% 50%, #D497FF 0%, #7B21BA 100%)'}}></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Response Rate After Follow-Up
              </h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip1)">
                  <path d="M12 0C5.3832 0 0 5.38327 0 12.0001C0 18.6169 5.3832 24 12 24C18.6168 24 24 18.6169 24 12.0001C24 5.38327 18.6168 0 12 0ZM12 21.8182C6.58618 21.8182 2.18182 17.4138 2.18182 12.0001C2.18182 6.58633 6.58618 2.18182 12 2.18182C17.4138 2.18182 21.8182 6.58633 21.8182 12.0001C21.8182 17.4138 17.4137 21.8182 12 21.8182Z" fill="#F9F9F9"/>
                  <path d="M12.0011 5.09094C11.1992 5.09094 10.5469 5.74374 10.5469 6.54614C10.5469 7.34782 11.1992 8.00003 12.0011 8.00003C12.803 8.00003 13.4554 7.34782 13.4554 6.54614C13.4554 5.74374 12.803 5.09094 12.0011 5.09094Z" fill="#F9F9F9"/>
                  <path d="M11.9972 10.1818C11.3947 10.1818 10.9062 10.6702 10.9062 11.2727V17.8181C10.9062 18.4206 11.3947 18.909 11.9972 18.909C12.5996 18.909 13.0881 18.4206 13.0881 17.8181V11.2727C13.0881 10.6702 12.5996 10.1818 11.9972 10.1818Z" fill="#F9F9F9"/>
                </g>
                <defs>
                  <clipPath id="clip1">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-8">
              65%
            </div>

            {/* Stats */}
            <div className="space-y-6 mb-6">
              <div className="flex flex-col">
                <span className="text-[#DF69FF] font-inter text-xl font-medium leading-[25.6px]">1,232</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Leads Converted</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[#9C55FF] font-inter text-xl font-medium leading-[25.6px]">1,832</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Follow-up Emails Sent</span>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flex flex-col gap-8">
              {/* Responses Received Bar */}
              <div className="flex items-center justify-between">
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] w-40">
                  Responses Received
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full h-[55px] rounded-lg bg-[#242424] flex items-center">
                    <div className="h-full w-[244px] rounded-lg"
                         style={{background: 'linear-gradient(164deg, #B339D4 12.41%, #E583FF 55.26%, #B339D4 90.59%)'}}>
                    </div>
                  </div>
                </div>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] text-right w-10">
                  1232
                </span>
              </div>

              {/* Follow-Ups Sent Bar */}
              <div className="flex items-center justify-between">
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] w-40">
                  Follow-Ups Sent
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full h-[55px] rounded-lg bg-[#242424] flex items-center">
                    <div className="h-full w-[327px] rounded-lg"
                         style={{background: 'linear-gradient(180deg, #4B0BA3 0%, #9C63EA 44.71%, #4B0BA3 100%)'}}>
                    </div>
                  </div>
                </div>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px] text-right w-10">
                  1832
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highest Conversion Courses */}
      <div className="relative w-full h-[371px] rounded-[30px] border border-[#454444] p-[30px] overflow-hidden"
           style={{background: 'linear-gradient(202deg, rgba(38, 38, 38, 0.30) 11.62%, rgba(19, 19, 19, 0.30) 87.57%)'}}>
        {/* Background glow */}
        <div className="absolute right-[-80px] bottom-[-100px] w-[252px] h-[252px] opacity-20 blur-[112.55px] bg-[#DF69FF]"></div>

        <div className="relative z-10 flex">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                Highest Conversion Courses
              </h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip2)">
                  <path d="M12 0C5.3832 0 0 5.38327 0 12.0001C0 18.6169 5.3832 24 12 24C18.6168 24 24 18.6169 24 12.0001C24 5.38327 18.6168 0 12 0ZM12 21.8182C6.58618 21.8182 2.18182 17.4138 2.18182 12.0001C2.18182 6.58633 6.58618 2.18182 12 2.18182C17.4138 2.18182 21.8182 6.58633 21.8182 12.0001C21.8182 17.4138 17.4137 21.8182 12 21.8182Z" fill="#F9F9F9"/>
                  <path d="M12.0011 5.09094C11.1992 5.09094 10.5469 5.74374 10.5469 6.54614C10.5469 7.34782 11.1992 8.00003 12.0011 8.00003C12.803 8.00003 13.4554 7.34782 13.4554 6.54614C13.4554 5.74374 12.803 5.09094 12.0011 5.09094Z" fill="#F9F9F9"/>
                  <path d="M11.9972 10.1818C11.3947 10.1818 10.9062 10.6702 10.9062 11.2727V17.8181C10.9062 18.4206 11.3947 18.909 11.9972 18.909C12.5996 18.909 13.0881 18.4206 13.0881 17.8181V11.2727C13.0881 10.6702 12.5996 10.1818 11.9972 10.1818Z" fill="#F9F9F9"/>
                </g>
                <defs>
                  <clipPath id="clip2">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-6">
              1,670
            </div>

            {/* Course Stats */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <span className="text-[#DF69FF] font-inter text-xl font-medium leading-[25.6px]">850 Conversions</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Course 01</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[#9C55FF] font-inter text-xl font-medium leading-[25.6px]">450 Conversions</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Course 02</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[#B347FF] font-inter text-xl font-medium leading-[25.6px]">370 Conversions</span>
                <span className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">Course 03</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-end gap-4 h-[219px] mr-12">
            {/* Course 03 */}
            <div className="flex flex-col items-center">
              <div className="w-[55px] h-[94px] rounded-lg"
                   style={{background: 'linear-gradient(180deg, #7B21BA 9.13%, #AC35FF 50.96%, #7B21BA 86.06%)'}}>
              </div>
              <div className="text-[#C5C5C5] text-center font-inter text-sm font-normal leading-[25.6px] mt-2">
                C 03
              </div>
            </div>

            {/* Course 02 */}
            <div className="flex flex-col items-center">
              <div className="w-[55px] h-[136px] rounded-lg"
                   style={{background: 'linear-gradient(180deg, #4B0BA3 0%, #9C63EA 44.71%, #4B0BA3 100%)'}}>
              </div>
              <div className="text-[#C5C5C5] text-center font-inter text-sm font-normal leading-[25.6px] mt-2">
                C 02
              </div>
            </div>

            {/* Course 01 */}
            <div className="flex flex-col items-center">
              <div className="w-[55px] h-[219px] rounded-lg"
                   style={{background: 'linear-gradient(20deg, #FEBEFA 17.72%, #B339D4 41.99%, #7B21BA 64.82%, #7B26F0 90.51%)'}}>
              </div>
              <div className="text-[#C5C5C5] text-center font-inter text-sm font-normal leading-[25.6px] mt-2">
                C 01
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFollowUpAgentInsights;
