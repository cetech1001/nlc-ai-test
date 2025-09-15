import React from 'react';

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
);

const ClientEmailAgentInsights: React.FC = () => {
  return (
    <div className="p-[30px] bg-[#070300]">
      {/* Top Row Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[21px] mb-[21px]">
        {/* Total Email Processed */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-gradient-radial from-[#D497FF] to-[#7B21BA] opacity-50 blur-[112.55px] right-[-50px] bottom-[-50px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Total Email Processed
              </h3>
              <InfoIcon className="w-6 h-6" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-[57px]">
              5,650
            </div>

            {/* Pie Chart */}
            <div className="relative w-[325px] h-[163px] mx-auto">
              <svg width="325" height="163" viewBox="0 0 325 163" className="absolute">
                <path d="M0 162.5C1.86559e-06 141.16 4.20319 120.029 12.3696 100.314C20.536 80.5985 32.5056 62.6847 47.5952 47.5951C62.6847 32.5056 80.5985 20.536 100.314 12.3696C120.029 4.20318 141.16 -2.79838e-06 162.5 0C183.84 2.79838e-06 204.971 4.20319 224.686 12.3696C244.401 20.536 262.315 32.5056 277.405 47.5952C292.494 62.6847 304.464 80.5986 312.63 100.314C320.797 120.029 325 141.16 325 162.5L274.943 162.5C274.943 147.734 272.034 133.112 266.383 119.47C260.733 105.828 252.45 93.4323 242.009 82.991C231.568 72.5498 219.172 64.2673 205.53 58.6165C191.888 52.9658 177.266 50.0573 162.5 50.0573C147.734 50.0573 133.112 52.9657 119.47 58.6165C105.828 64.2673 93.4323 72.5498 82.991 82.991C72.5498 93.4323 64.2673 105.828 58.6165 119.47C52.9658 133.112 50.0573 147.734 50.0573 162.5H0Z" fill="#9C55FF"/>
              </svg>
              <svg width="249" height="163" viewBox="0 0 249 163" className="absolute">
                <path d="M0 162.5C2.53694e-06 133.481 7.77094 104.991 22.5054 79.9909C37.2398 54.9907 58.4002 34.3923 83.7878 20.3359C109.175 6.27948 137.864 -0.722023 166.873 0.0588414C195.881 0.839706 224.152 9.37445 248.746 24.7763L222.179 67.2014C205.16 56.544 185.598 50.6384 165.526 50.098C145.453 49.5577 125.602 54.4025 108.035 64.1288C90.4676 73.8552 75.8256 88.1084 65.6301 105.407C55.4345 122.706 50.0573 142.42 50.0573 162.5H0Z" fill="url(#emailsGradient)"/>
              </svg>
              <div className="absolute top-[100px] left-[220px] text-[#F9F9F9] font-inter text-[28px] font-semibold">
                Emails
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-[18px] mt-[30px]">
              <div>
                <div className="text-[#DF69FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  5,250
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Manually Approved
                </div>
              </div>

              <div>
                <div className="text-[#9C55FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  400
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Flagged for Review
                </div>
              </div>
            </div>
          </div>

          <defs>
            <radialGradient id="emailsGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEBEFA" />
              <stop offset="34.6%" stopColor="#B339D4" />
              <stop offset="65.4%" stopColor="#7B21BA" />
              <stop offset="100%" stopColor="#7B26F0" />
            </radialGradient>
          </defs>
        </div>

        {/* Response Time Saved */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-gradient-radial from-[#D497FF] to-[#7B21BA] opacity-50 blur-[112.55px] left-[-150px] top-[-150px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Response Time Saved
              </h3>
              <InfoIcon className="w-6 h-6" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-[57px]">
              534 Hrs
            </div>

            {/* Bar Chart */}
            <div className="relative w-[218px] h-[247px] ml-[220px]">
              {/* Platform Bar */}
              <div className="absolute left-[5px] top-0 w-[55px] h-[208px] rounded-[8px] bg-[#242424]"></div>
              <div className="absolute left-[5px] top-[112px] w-[55px] h-[96px] rounded-b-[8px] bg-gradient-to-br from-[#B339D4] via-[#E583FF] to-[#B339D4]"></div>
              <div className="absolute left-[13px] top-[79px] text-[#F9F9F9] text-center font-inter text-[14px] font-medium">
                1,298
              </div>
              <div className="absolute left-0 top-[221px] text-[#C5C5C5] font-inter text-base font-medium w-[65px] text-center">
                Platform
              </div>

              {/* Manually Bar */}
              <div className="absolute left-[156px] top-0 w-[55px] h-[208px] rounded-[8px] bg-[#242424]"></div>
              <div className="absolute left-[156px] top-[45px] w-[55px] h-[163px] rounded-b-[8px] bg-gradient-to-b from-[#4B0BA3] via-[#9C63EA] to-[#4B0BA3]"></div>
              <div className="absolute left-[165px] top-[19px] text-[#F9F9F9] text-center font-inter text-[14px] font-medium">
                1,832
              </div>
              <div className="absolute left-[149px] top-[221px] text-[#C5C5C5] font-inter text-base font-medium w-[69px] text-center">
                Manually
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-[18px] mt-[-80px]">
              <div>
                <div className="text-[#DF69FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  1,298 Hrs
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Consumed Through Platform
                </div>
              </div>

              <div>
                <div className="text-[#9C55FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  1,832 Hrs
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Would Have Been Consumed Manually
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy & Tone-Match */}
        <div className="relative w-[286px] h-[385px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-gradient-radial from-[#D497FF] to-[#7B21BA] opacity-50 blur-[112.55px] left-[-50px] bottom-[-50px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%] w-[142px]">
                Accuracy & Tone-Match
              </h3>
              <InfoIcon className="w-6 h-6 ml-[40px] mt-[40px]" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] text-center mt-[200px]">
              60%
            </div>

            {/* Half Circle Chart */}
            <div className="absolute left-[36px] top-[95px] w-[213px] h-[107px]">
              <svg width="213" height="107" viewBox="0 0 213 107">
                <path d="M0 106.5C2.46931e-06 78.2544 11.2205 51.1658 31.1931 31.1931C51.1657 11.2205 78.2544 3.03031e-06 106.5 0C134.746 -3.03031e-06 161.834 11.2205 181.807 31.1931C201.779 51.1657 213 78.2544 213 106.5L180.193 106.5C180.193 86.9553 172.429 68.2112 158.609 54.391C144.789 40.5709 126.045 32.8068 106.5 32.8068C86.9553 32.8068 68.2112 40.5709 54.391 54.391C40.5709 68.2112 32.8068 86.9553 32.8068 106.5H0Z" fill="#242424"/>
              </svg>
              <svg width="146" height="107" viewBox="0 0 146 107" className="absolute top-0 left-0">
                <path d="M0 106.5C1.51437e-06 89.1776 4.22537 72.1166 12.3097 56.7964C20.3941 41.4762 32.0934 28.3592 46.3933 18.5828C60.6932 8.80633 77.162 2.66553 94.3717 0.692844C111.581 -1.27984 129.013 0.97512 145.154 7.26222L133.247 37.8319C122.078 33.4815 110.016 31.9212 98.1078 33.2862C86.1994 34.6512 74.8038 38.9004 64.9089 45.6653C55.014 52.4301 46.9186 61.5065 41.3246 72.1074C35.7306 82.7083 32.8068 94.5137 32.8068 106.5H0Z" fill="url(#accuracyGradient)"/>
              </svg>
            </div>
          </div>

          <defs>
            <radialGradient id="accuracyGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEBEFA" />
              <stop offset="34.6%" stopColor="#B339D4" />
              <stop offset="65.4%" stopColor="#7B21BA" />
              <stop offset="100%" stopColor="#7B26F0" />
            </radialGradient>
          </defs>
        </div>
      </div>

      {/* Bottom Row Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[21px]">
        {/* Approval Outcomes Efficiency */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-gradient-radial from-[#D497FF] to-[#7B21BA] opacity-50 blur-[112.55px] left-[-150px] top-[-150px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Approval Outcomes Efficiency
              </h3>
              <InfoIcon className="w-6 h-6" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-[40px]">
              67%
            </div>

            {/* Bar Chart */}
            <div className="relative w-[381px] h-[247px] ml-[450px] mt-[-100px]">
              {/* As-Is Bar */}
              <div className="absolute left-0 top-[45px] w-[55px] h-[163px] rounded-[8px] bg-gradient-to-br from-[#B339D4] via-[#E583FF] to-[#B339D4]"></div>
              <div className="absolute left-[8px] top-[19px] text-[#F9F9F9] text-center font-inter text-[14px] font-medium">
                1,200
              </div>
              <div className="absolute left-[7px] top-[221px] text-[#C5C5C5] font-inter text-base font-medium w-[41px] text-center">
                As-Is
              </div>

              {/* Edits Bar */}
              <div className="absolute left-[151px] top-[111px] w-[55px] h-[97px] rounded-[8px] bg-gradient-to-b from-[#4B0BA3] via-[#9C63EA] to-[#4B0BA3]"></div>
              <div className="absolute left-[166px] top-[84px] text-[#F9F9F9] text-center font-inter text-[14px] font-medium">
                621
              </div>
              <div className="absolute left-[159px] top-[221px] text-[#C5C5C5] font-inter text-base font-medium w-[39px] text-center">
                Edits
              </div>

              {/* Regenerated Bar */}
              <div className="absolute left-[304px] top-[183px] w-[55px] h-[25px] rounded-[8px] bg-gradient-to-b from-[#7B21BA] via-[#AC35FF] to-[#7B21BA]"></div>
              <div className="absolute left-[322px] top-[19px] text-[#F9F9F9] text-center font-inter text-[14px] font-medium">
                32
              </div>
              <div className="absolute left-[282px] top-[221px] text-[#C5C5C5] font-inter text-base font-medium w-[99px] text-center">
                Regenerated
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-[18px] mt-[-200px]">
              <div>
                <div className="text-[#DF69FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  1200
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Mails Sent As-Is
                </div>
              </div>

              <div>
                <div className="text-[#9C55FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  621
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Mails Sent With Some Edits
                </div>
              </div>

              <div>
                <div className="text-[#B347FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  32
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Mail Responses Deleted/Regenerated
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tone Match */}
        <div className="relative w-full h-[385px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-gradient-radial from-[#D497FF] to-[#7B21BA] opacity-50 blur-[112.55px] left-[-150px] top-[-150px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%]">
                Tone Match
              </h3>
              <InfoIcon className="w-6 h-6" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-[40px]">
              85.6%
            </div>

            {/* Horizontal Bar Chart */}
            <div className="relative w-[377px] h-[219px] ml-[330px] mt-[-50px]">
              {/* Above 3 Stars */}
              <div className="absolute left-0 top-[67px] text-[#C5C5C5] font-inter text-base font-medium w-[108px]">
                Above 3 Stars
              </div>
              <div className="absolute right-0 top-[67px] text-[#C5C5C5] font-inter text-base font-medium w-[31px] text-right">
                600
              </div>
              <div className="absolute left-0 top-0 w-[55px] h-[377px] transform rotate-90 origin-left rounded-[8px] bg-[#242424]"></div>
              <div className="absolute left-0 top-0 w-[55px] h-[244px] transform rotate-90 origin-left rounded-b-[8px] bg-gradient-to-br from-[#B339D4] via-[#E583FF] to-[#B339D4]"></div>

              {/* Below 3 Stars */}
              <div className="absolute left-0 top-[193px] text-[#C5C5C5] font-inter text-base font-medium w-[106px]">
                Below 3 Stars
              </div>
              <div className="absolute right-0 top-[193px] text-[#C5C5C5] font-inter text-base font-medium w-[28px] text-right">
                102
              </div>
              <div className="absolute left-0 top-[126px] w-[55px] h-[377px] transform rotate-90 origin-left rounded-[8px] bg-[#242424]"></div>
              <div className="absolute left-0 top-[126px] w-[55px] h-[102px] transform rotate-90 origin-left rounded-b-[8px] bg-gradient-to-b from-[#4B0BA3] via-[#9C63EA] to-[#4B0BA3]"></div>
            </div>

            {/* Stats */}
            <div className="space-y-[18px] mt-[-150px]">
              <div>
                <div className="text-[#DF69FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  600
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Responses Rated Above 3
                </div>
              </div>

              <div>
                <div className="text-[#9C55FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  102
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Responses Rated Below 3
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEmailAgentInsights;
