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

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="78" height="75" viewBox="0 0 78 75" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M39 0L48.2051 28.3303H77.9933L53.8941 45.8394L63.0992 74.1697L39 56.6606L14.9008 74.1697L24.1059 45.8394L0.00668335 28.3303H29.7949L39 0Z" fill="url(#starGradient)"/>
    <defs>
      <linearGradient id="starGradient" x1="47.9455" y1="82" x2="74.7246" y2="8.69326" gradientUnits="userSpaceOnUse">
        <stop offset="0.0192308" stopColor="#FEBEFA"/>
        <stop offset="0.346154" stopColor="#B339D4"/>
        <stop offset="0.653846" stopColor="#7B21BA"/>
        <stop offset="1" stopColor="#7B26F0"/>
      </linearGradient>
    </defs>
  </svg>
);

const ClientRetentionAgentInsights: React.FC = () => {
  return (
    <div className="p-[30px] bg-[#070300]">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
        {/* Survey Response Rate */}
        <div className="relative w-full h-[371px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glows */}
          <div className="absolute w-[252px] h-[252px] bg-[#DF69FF] opacity-20 blur-[112.55px] left-[-50px] bottom-[-100px]"></div>
          <div className="absolute w-[252px] h-[252px] bg-[#DF69FF] opacity-50 blur-[112.55px] right-[-80px] top-[-150px]"></div>

          <div className="relative z-10">
            <div className="flex flex-col gap-[6px] mb-[30px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                Survey Response Rate
              </h3>
              <p className="text-[#C5C5C5] font-inter text-[14px] font-normal leading-[25.6px]">
                60% of average clients of clients responded this week.
              </p>
            </div>

            {/* Time Filter */}
            <div className="flex justify-end items-center gap-5 mb-[30px]">
              <span className="text-[#C5C5C5] font-inter text-[14px] font-normal">This Week</span>
              <div className="w-px h-4 bg-white"></div>
              <span className="text-[#C5C5C5] font-inter text-[14px] font-normal">Last Week</span>
              <div className="w-px h-4 bg-white"></div>
              <span className="text-[#DF69FF] font-inter text-[14px] font-bold">Custom</span>
            </div>

            {/* Chart Area */}
            <div className="relative h-[220px] mb-[20px]">
              {/* Background Area */}
              <svg width="980" height="220" className="absolute inset-0" viewBox="0 0 980 220">
                <path d="M125.719 141.795L0 127.348V209.422C0 215.816 5.18361 221 11.5779 221H970.422C976.816 221 982 215.816 982 209.422V0.758911L904.29 32.9449C903.166 33.4105 901.975 33.696 900.762 33.7909L788.588 42.559C787.833 42.618 787.074 42.6028 786.322 42.5136L641.662 25.3528C639.712 25.1214 637.735 25.3899 635.917 26.1329L546.802 62.5589C544.512 63.495 541.982 63.6729 539.584 63.0665L466.623 44.6213C464.191 44.0066 461.626 44.1981 459.312 45.167L386.259 75.7645C383.812 76.7892 381.088 76.9428 378.541 76.1993L287.492 49.616C284.35 48.6986 280.966 49.1541 278.178 50.8697L133.109 140.153C130.899 141.513 128.297 142.091 125.719 141.795Z" fill="url(#areaGradient)" fillOpacity="0.2"/>
              </svg>

              {/* Line Chart */}
              <svg width="980" height="141" className="absolute top-[40px]" viewBox="0 0 980 141">
                <path d="M2 126.65L127 142.495C129.58 142.822 132.195 142.268 134.421 140.924L279.551 53.2515C282.264 51.6122 285.533 51.1612 288.589 52.0042L379.635 77.1182C382.042 77.7823 384.6 77.6477 386.924 76.7348L460.403 47.8752C462.567 47.0253 464.937 46.8486 467.203 47.3681L540.496 64.1724C542.844 64.7106 545.301 64.5011 547.523 63.5731L637.068 26.1862C638.929 25.409 640.962 25.1332 642.964 25.3862L787.295 43.636C788.11 43.739 788.933 43.7548 789.751 43.6831L900.862 33.9445C901.981 33.8464 903.08 33.5855 904.124 33.1699L982 2.16589" stroke="url(#lineGradient)" strokeWidth="3.463" strokeLinecap="round"/>
              </svg>

              {/* Data Point Indicator */}
              <div className="absolute left-[487px] top-[51px] w-[176px] h-[114px]">
                <div className="absolute w-[176px] h-[98px] top-0 left-0 rounded-[17.262px] border border-[#B339D4] bg-[rgba(179,57,212,0.10)] backdrop-blur-[6.52px] p-[14px]">
                  <div className="text-[#F4F4F5] text-center font-inter text-[14px] font-normal leading-[160%] mb-[8px]">
                    Jun 10, 2025
                  </div>
                  <div className="w-[75px] h-[41px] mx-auto rounded-[6.905px] bg-[#B339D4] flex items-center justify-center">
                    <span className="text-[#F9F9F9] text-center font-inter text-[17px] font-semibold leading-[160%] tracking-[-0.345px]">
                      55%
                    </span>
                  </div>
                </div>
                <svg width="18" height="16" viewBox="0 0 18 16" className="absolute left-[80px] top-[98px]">
                  <ellipse cx="9.24675" cy="8" rx="8.26238" ry="8" fill="#B339D4"/>
                  <ellipse cx="9.24683" cy="8" rx="3.09839" ry="3" fill="#F9F9F9"/>
                </svg>
                <svg width="12" height="8" viewBox="0 0 12 8" className="absolute left-[82px] top-[108px]">
                  <path d="M7.47459 7.15864C6.79963 7.83781 5.70084 7.83781 5.02587 7.15864L1.45534 3.56587C0.373129 2.47691 1.14445 0.622937 2.6797 0.622937L9.82076 0.622937C11.356 0.622937 12.1273 2.47691 11.0451 3.56587L7.47459 7.15864Z" fill="#B339D4"/>
                </svg>
              </div>

              {/* Dotted vertical line */}
              <div className="absolute left-[575px] top-[30px] w-px h-[147px] border-l border-dashed border-white opacity-50"></div>
            </div>

            {/* Date Labels */}
            <div className="flex justify-between text-[#C5C5C5] font-inter text-[14px] font-normal">
              <span>Jun 07</span>
              <span>Jun 08</span>
              <span>Jun 09</span>
              <span>Jun 10</span>
              <span>Jun 11</span>
              <span>Jun 12</span>
              <span>Jun 13</span>
            </div>
          </div>

          <defs>
            <linearGradient id="areaGradient" x1="447.435" y1="49.3121" x2="543.849" y2="222.959" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B339D4"/>
              <stop offset="0.5" stopColor="#7B21BA"/>
              <stop offset="1" stopColor="#4B0BA3"/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="598.909" y1="143" x2="606.38" y2="0.687299" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7B26F0"/>
              <stop offset="0.346154" stopColor="#7B21BA"/>
              <stop offset="0.653846" stopColor="#B339D4"/>
              <stop offset="0.980769" stopColor="#FEBEFA"/>
            </linearGradient>
          </defs>
        </div>

        {/* Client Engagement Level */}
        <div className="relative w-full h-[371px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[252px] h-[252px] bg-[#DF69FF] opacity-20 blur-[112.55px] left-[-50px] bottom-[-100px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[41px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                Client Engagement Level
              </h3>
              <InfoIcon className="w-6 h-6" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-[30px]">
              2,680
            </div>

            {/* Pie Chart */}
            <div className="relative w-[261px] h-[261px] mx-auto mb-[30px]">
              <svg width="261" height="252" viewBox="0 0 261 252" className="absolute">
                <path d="M261 121.5C261 145.219 254.536 168.49 242.302 188.81C230.068 209.131 212.527 225.733 191.565 236.831C170.603 247.93 147.012 253.106 123.329 251.803C99.6458 250.499 76.7657 242.766 57.1481 229.434C37.5306 216.102 21.9175 197.675 11.9873 176.135C2.05712 154.595 -1.81469 130.755 0.788094 107.18C3.39088 83.6039 12.3698 61.1833 26.7598 42.328C41.1497 23.4727 60.4063 8.89573 82.4597 0.164175L97.2583 37.5411C81.9984 43.5829 68.6736 53.6695 58.7164 66.7165C48.7593 79.7635 42.5462 95.2776 40.7452 111.591C38.9442 127.904 41.6233 144.4 48.4946 159.305C55.3658 174.21 66.1694 186.96 79.7438 196.185C93.3183 205.411 109.15 210.762 125.538 211.664C141.926 212.566 158.249 208.984 172.754 201.304C187.259 193.624 199.396 182.136 207.862 168.076C216.327 154.015 220.8 137.912 220.8 121.5H261Z" fill="#DF69FF"/>
              </svg>
              <svg width="86" height="115" viewBox="0 0 86 115" className="absolute">
                <path d="M20.75 0.483679C40.737 12.0232 57.3063 28.6568 68.7683 48.6884C80.2303 68.72 86.1749 91.4329 85.9961 114.511L45.7974 114.2C45.9211 98.2306 41.8077 82.5142 33.8765 68.6533C25.9454 54.7923 14.4802 43.2826 0.650055 35.2978L20.75 0.483679Z" fill="#9C55FF"/>
              </svg>
              <svg width="115" height="53" viewBox="0 0 115 53" className="absolute">
                <path d="M0.613876 9.50249C19.0296 2.06204 38.9008 -1.07663 58.7133 0.325637C78.5258 1.7279 97.7568 7.6341 114.941 17.5942L94.7823 52.3743C82.8915 45.4823 69.5845 41.3955 55.8752 40.4252C42.1659 39.4549 28.4159 41.6267 15.673 46.7752L0.613876 9.50249Z" fill="url(#inactiveGradient)"/>
              </svg>
            </div>

            {/* Stats */}
            <div className="space-y-[18px]">
              <div>
                <div className="text-[#DF69FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  1,850
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Active Clients
                </div>
              </div>

              <div>
                <div className="text-[#9C55FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  450
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  At-Risk Clients
                </div>
              </div>

              <div>
                <div className="text-[#B347FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  380
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Inactive Clients
                </div>
              </div>
            </div>
          </div>

          <defs>
            <radialGradient id="inactiveGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#AC35FF" />
              <stop offset="51.36%" stopColor="#D496FF" />
              <stop offset="100%" stopColor="#AC35FF" />
            </radialGradient>
          </defs>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[20px]">
        {/* Churn Reduction */}
        <div className="relative w-[286px] h-[371px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-[#DF69FF] opacity-50 blur-[112.55px] left-[-16px] bottom-[-50px]"></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-[8px]">
              Churn Reduction
            </h3>
            <p className="text-[#C5C5C5] font-inter text-[14px] font-normal leading-[150%] mb-[100px] w-[226px]">
              Percentage decrease in client drop-off after proactive outreach.
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] text-center mt-[180px]">
              60%
            </div>

            {/* Half Circle Chart */}
            <div className="absolute left-[36px] top-[100px] w-[213px] h-[107px]">
              <svg width="213" height="107" viewBox="0 0 213 107">
                <path d="M0 106.5C2.46931e-06 78.2544 11.2205 51.1658 31.1931 31.1931C51.1657 11.2205 78.2544 3.03031e-06 106.5 0C134.746 -3.03031e-06 161.834 11.2205 181.807 31.1931C201.779 51.1657 213 78.2544 213 106.5L180.193 106.5C180.193 86.9553 172.429 68.2112 158.609 54.391C144.789 40.5709 126.045 32.8068 106.5 32.8068C86.9553 32.8068 68.2112 40.5709 54.391 54.391C40.5709 68.2112 32.8068 86.9553 32.8068 106.5H0Z" fill="#242424"/>
              </svg>
              <svg width="146" height="107" viewBox="0 0 146 107" className="absolute top-0 left-0">
                <path d="M0 106.5C1.51437e-06 89.1776 4.22537 72.1166 12.3097 56.7964C20.3941 41.4762 32.0934 28.3592 46.3933 18.5828C60.6932 8.80633 77.162 2.66553 94.3717 0.692844C111.581 -1.27984 129.013 0.97512 145.154 7.26222L133.247 37.8319C122.078 33.4815 110.016 31.9212 98.1078 33.2862C86.1994 34.6512 74.8038 38.9004 64.9089 45.6653C55.014 52.4301 46.9186 61.5065 41.3246 72.1074C35.7306 82.7083 32.8068 94.5137 32.8068 106.5H0Z" fill="url(#churnGradient)"/>
              </svg>
            </div>
          </div>

          <defs>
            <radialGradient id="churnGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEBEFA" />
              <stop offset="34.6%" stopColor="#B339D4" />
              <stop offset="65.4%" stopColor="#7B21BA" />
              <stop offset="100%" stopColor="#7B26F0" />
            </radialGradient>
          </defs>
        </div>

        {/* Client Satisfaction Trends */}
        <div className="relative w-[286px] h-[371px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-[#DF69FF] opacity-50 blur-[112.55px] left-[-16px] bottom-[-50px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[150%] w-[219px]">
                Client Satisfaction Trends
              </h3>
              <InfoIcon className="w-6 h-6 absolute right-[30px] top-[45px]" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] text-center mt-[200px]">
              4.5
            </div>

            {/* Star Icon */}
            <div className="absolute left-[103px] top-[100px]">
              <StarIcon className="w-[82px] h-[82px]" />
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="relative w-[286px] h-[371px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[223px] h-[223px] bg-[#DF69FF] opacity-50 blur-[112.55px] left-[-16px] bottom-[-50px]"></div>

          <div className="relative z-10">
            <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px] mb-[8px]">
              Success Stories
            </h3>
            <p className="text-[#C5C5C5] font-inter text-[14px] font-normal leading-[150%] mb-[100px] w-[226px]">
              Number of positive testimonials gathered.
            </p>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] text-center mt-[180px]">
              671
            </div>

            {/* Half Circle Chart */}
            <div className="absolute left-[36px] top-[100px] w-[213px] h-[107px]">
              <svg width="213" height="107" viewBox="0 0 213 107">
                <path d="M0 106.5C2.46931e-06 78.2544 11.2205 51.1658 31.1931 31.1931C51.1657 11.2205 78.2544 3.03031e-06 106.5 0C134.746 -3.03031e-06 161.834 11.2205 181.807 31.1931C201.779 51.1657 213 78.2544 213 106.5L180.193 106.5C180.193 86.9553 172.429 68.2112 158.609 54.391C144.789 40.5709 126.045 32.8068 106.5 32.8068C86.9553 32.8068 68.2112 40.5709 54.391 54.391C40.5709 68.2112 32.8068 86.9553 32.8068 106.5H0Z" fill="#242424"/>
              </svg>
              <svg width="206" height="107" viewBox="0 0 206 107" className="absolute top-0 left-0">
                <path d="M0 106.5C2.16627e-06 81.7207 8.6405 57.717 24.4335 38.6227C40.2264 19.5283 62.1832 6.53857 86.5226 1.89046C110.862 -2.75765 136.06 1.22683 157.778 13.1577C179.496 25.0886 196.374 44.2191 205.505 67.2545L175.007 79.3439C168.689 63.4044 157.01 50.167 141.982 41.9114C126.955 33.6557 109.518 30.8986 92.6766 34.1149C75.8348 37.3312 60.6417 46.3195 49.7137 59.532C38.7856 72.7444 32.8068 89.3539 32.8068 106.5H0Z" fill="url(#successGradient)"/>
              </svg>
            </div>
          </div>

          <defs>
            <radialGradient id="successGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEBEFA" />
              <stop offset="34.6%" stopColor="#B339D4" />
              <stop offset="65.4%" stopColor="#7B21BA" />
              <stop offset="100%" stopColor="#7B26F0" />
            </radialGradient>
          </defs>
        </div>

        {/* Top 3 Client Retention Templates */}
        <div className="relative w-full h-[371px] rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden p-[30px]">
          {/* Background glow */}
          <div className="absolute w-[252px] h-[252px] bg-[#DF69FF] opacity-20 blur-[112.55px] right-[-80px] bottom-[-100px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-[10px] mb-[42px]">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                Top 3 Client Retention Templates
              </h3>
              <InfoIcon className="w-6 h-6" />
            </div>

            <div className="text-[#F9F9F9] font-inter text-[40px] font-semibold leading-[25.6px] mb-[30px]">
              1,670
            </div>

            {/* Bar Chart */}
            <div className="flex justify-between items-end h-[219px] mb-[20px] px-[30px]">
              <div className="w-[55px] h-[94px] rounded-[8px] bg-gradient-to-b from-[#7B21BA] via-[#AC35FF] to-[#7B21BA]"></div>
              <div className="w-[55px] h-[136px] rounded-[8px] bg-gradient-to-b from-[#4B0BA3] via-[#9C63EA] to-[#4B0BA3]"></div>
              <div className="w-[55px] h-[219px] rounded-[8px] bg-gradient-to-r from-[#FEBEFA] via-[#B339D4] via-[#7B21BA] to-[#7B26F0]"></div>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[#C5C5C5] font-inter text-[14px] font-normal px-[30px]">
              <span className="text-center w-[55px]">FS 02</span>
              <span className="text-center w-[55px]">CD 25%</span>
              <span className="text-center w-[55px]">FS 01</span>
            </div>

            {/* Stats */}
            <div className="space-y-[18px] mt-[-250px]">
              <div>
                <div className="text-[#DF69FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  850 Retentions
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Feedback Survey 01
                </div>
              </div>

              <div>
                <div className="text-[#9C55FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  450 Retentions
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Client Drop-Off at 25%
                </div>
              </div>

              <div>
                <div className="text-[#B347FF] font-inter text-[20px] font-medium leading-[25.6px]">
                  370 Retentions
                </div>
                <div className="text-[#C5C5C5] font-inter text-base font-medium leading-[25.6px]">
                  Feedback Survey 02
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRetentionAgentInsights;
