import React from 'react';

export const WelcomeHero = () => {
  return (
    <div className="glass-card rounded-4xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
      <div className="absolute left-[30px] -bottom-[142px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute right-[13px] -bottom-[190px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute left-[591px] -top-[197px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-20 xl:gap-40">
        <div className="flex-1 space-y-5 sm:space-y-6 lg:space-y-7 text-center lg:text-left lg:pl-8">
          <div className="space-y-4 sm:space-y-5">
            <h1 className="text-2xl font-semibold text-foreground leading-tight sm:leading-[40px] lg:leading-[44px]">
              Welcome Video Lorem ipsum dolor sit amet
            </h1>
            <p className="text-base text-foreground leading-relaxed sm:leading-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-[363px] lg:flex-shrink-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/1734bfade88c3d6e7e300572cadae9498dbce974?width=726"
            alt="Welcome video thumbnail"
            className="w-full h-40 sm:h-44 lg:h-48 rounded-2xl lg:rounded-3xl border border-border object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="flex items-center gap-2 sm:gap-2.5 px-3 py-2 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 20 20" fill="none">
                <g clipPath="url(#clip0_42564_13673)">
                  <path d="M13.2998 9.60886L9.14688 6.58999C8.99447 6.47952 8.79215 6.46288 8.6251 6.54873C8.45672 6.63392 8.35156 6.80696 8.35156 6.99397V13.0297C8.35156 13.2187 8.45672 13.3911 8.6251 13.4763C8.69631 13.5122 8.77418 13.5302 8.85271 13.5302C8.9552 13.5302 9.05903 13.4976 9.14688 13.433L13.2998 10.4168C13.4309 10.3203 13.5075 10.1712 13.5075 10.0128C13.5081 9.85178 13.4296 9.70337 13.2998 9.60886Z" fill="white"/>
                  <path d="M10.0003 0.0012207C4.47639 0.0012207 0 4.47761 0 10.0016C0 15.5235 4.47639 19.9986 10.0003 19.9986C15.5229 19.9986 20 15.5228 20 10.0016C20.0007 4.47761 15.5229 0.0012207 10.0003 0.0012207ZM10.0003 18.3301C5.40015 18.3301 1.67049 14.6024 1.67049 10.0016C1.67049 5.40271 5.40015 1.67038 10.0003 1.67038C14.5998 1.67038 18.3288 5.40204 18.3288 10.0016C18.3295 14.6024 14.5998 18.3301 10.0003 18.3301Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_42564_13673">
                    <rect width="20" height="20" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span className="text-xs sm:text-sm font-bold text-white">Play Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
