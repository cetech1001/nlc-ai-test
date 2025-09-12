import React from 'react';
import {LessonCard} from "@/lib";

const Classroom = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <div className="glass-card rounded-4xl p-10 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute left-[30px] -bottom-[142px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
        <div className="absolute right-[13px] -bottom-[190px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
        <div className="absolute left-[591px] -top-[197px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />

        <div className="relative z-10 flex items-center gap-40">
          {/* Left content */}
          <div className="flex-1 pl-8 space-y-7">
            <div className="space-y-5">
              <h1 className="text-[32px] font-semibold text-foreground leading-[44px]">
                Welcome Video Lorem ipsum dolor sit amet
              </h1>
              <p className="text-xl text-foreground leading-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>

          {/* Right video thumbnail */}
          <div className="relative">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/1734bfade88c3d6e7e300572cadae9498dbce974?width=726"
              alt="Welcome video thumbnail"
              className="w-[363px] h-48 rounded-3xl border border-border"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border border-white/20 bg-white/10">
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="none">
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
                <span className="text-sm font-bold text-white">Play Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Lesson Cards Grid */}
      <div className="space-y-6">
        {/* First row */}
        <div className="flex gap-6">
          <LessonCard
            image="https://api.builder.io/api/v1/image/assets/TEMP/ea1242f159b13c64ef772881089c587ebdfbd5fd?width=1016"
            title="Email notifications"
            description="If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online."
            locked
          />
          <LessonCard
            image="https://api.builder.io/api/v1/image/assets/TEMP/67d7ac3fa1ad750fdac7006414f332a680bcf9c6?width=1016"
            title="Email notifications"
            description="If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online."
            locked
          />
          <LessonCard
            image="https://api.builder.io/api/v1/image/assets/TEMP/b0f5f52f71547a27270cba30b3a1644a4ab8fc80?width=1016"
            title="Email notifications"
            description="If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online."
            locked
          />
        </div>

        {/* Second row */}
        <div className="flex gap-6">
          <LessonCard
            image="https://api.builder.io/api/v1/image/assets/TEMP/ea1242f159b13c64ef772881089c587ebdfbd5fd?width=1016"
            title="Email notifications"
            description="If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online."
            locked
          />
          <LessonCard
            image="https://api.builder.io/api/v1/image/assets/TEMP/67d7ac3fa1ad750fdac7006414f332a680bcf9c6?width=1016"
            title="Email notifications"
            description="If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online."
            locked
          />
          <LessonCard
            image="https://api.builder.io/api/v1/image/assets/TEMP/b0f5f52f71547a27270cba30b3a1644a4ab8fc80?width=1016"
            title="Email notifications"
            description="If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online."
            locked
          />
        </div>
      </div>
    </div>
  );
}



export default Classroom;
