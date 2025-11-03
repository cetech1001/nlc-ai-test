'use client';
import { Header } from '@/lib';


export const HeroSection = () => {
  return (
    <>
      <div className="relative">
        <Header />

        <div className="container mx-auto px-6 pt-12 sm:pt-8">
          <div className="text-center max-w-6xl mx-auto">
            <h1 className="text-[40px] md:text-6xl lg:text-[76px] font-bold mb-6 leading-tight">
              <span className="text-white">Your Coaching Business.</span>
              <br/>
              <span className="text-primary">
                On Autopilot.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              AI Agents designed for you that handle client emails, content creation, client
              retention, lead qualifiers and lead follow-ups, so you don't have to!
            </p>

            <div className="mb-20 relative">
              <div
                className="absolute -top-72 left-1/2 -translate-x-1/2 w-[48rem] h-[32rem] opacity-70 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgba(212, 151, 255, 0.35) 0%, rgba(123, 33, 186, 0.15) 70%, transparent 100%)",
                }}></div>
              <div
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-purple-500/30 to-violet-600/30 rounded-full blur-3xl animate-pulse"
                style={{animationDelay: '1s'}}></div>

              <div
                className="rounded-3xl p-1 max-w-4xl mx-auto border border-purple-500/20 relative overflow-hidden video-box">
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 w-32 h-0.5 bg-gradient-to-r from-fuchsia-500 via-fuchsia-200 to-purple-900 animate-shimmer-reverse"></div>
                </div>

                <div
                  className="aspect-video w-full h-full z-20 bg-background rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <iframe
                    src="https://player.vimeo.com/video/1127299038?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    frameBorder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    title="PreLaunch VSL Final"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
