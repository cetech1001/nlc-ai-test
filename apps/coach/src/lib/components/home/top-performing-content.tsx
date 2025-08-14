import React, {useState} from "react";
import {Play} from "lucide-react";

const topPerformingContent = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    duration: "01:20",
    time: "08:57 PM",
    date: "14 APR",
    impressions: "11,121",
    engagement: "7,180",
    platform: "instagram"
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    duration: "01:20",
    time: "08:57 PM",
    date: "14 APR",
    impressions: "11,121",
    engagement: "7,180",
    platform: "facebook"
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1609902726285-00668009f004?w=400&h=300&fit=crop",
    duration: "01:20",
    time: "08:57 PM",
    date: "14 APR",
    impressions: "11,121",
    engagement: "7,180",
    platform: "tiktok"
  }
];

export const TopPerformingContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Year");

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden h-full">
      <div className="absolute w-32 h-32 lg:w-64 lg:h-64 -left-8 -top-8 lg:-left-16 lg:-top-16 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[80px] lg:blur-[112px]" />
      <div className="absolute w-24 h-24 lg:w-48 lg:h-48 -right-6 -bottom-6 lg:-right-12 lg:-bottom-12 opacity-40 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[60px] lg:blur-[80px]" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between mb-6">
          <div>
            <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-1">
              Top Performing Content
            </h3>
            <p className="text-stone-300 text-sm">What works best for your viewers</p>
          </div>

          <div className="flex items-center gap-3">
            {["Week", "Month", "Year"].map((period, index, array) => (
              <React.Fragment key={period}>
                <button
                  onClick={() => setSelectedPeriod(period)}
                  className={`text-sm font-normal leading-relaxed transition-colors whitespace-nowrap ${
                    selectedPeriod === period
                      ? "text-fuchsia-400 font-medium"
                      : "text-stone-300 hover:text-stone-50"
                  }`}
                >
                  {period}
                </button>
                {index < array.length - 1 && (
                  <div className="w-3 h-0 border-t-[0.5px] border-white/30 rotate-90" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {topPerformingContent.map((content) => (
            <div key={content.id} className="relative group cursor-pointer bg-neutral-800/50 rounded-xl overflow-hidden border border-neutral-700/50 hover:border-fuchsia-400/30 transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={content.thumbnail}
                  alt="Content thumbnail"
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 left-2">
                  {content.platform === 'instagram' && (
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs">📷</span>
                    </div>
                  )}
                  {content.platform === 'facebook' && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">f</span>
                    </div>
                  )}
                  {content.platform === 'tiktok' && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center shadow-lg border border-white/20">
                      <span className="text-white text-xs">🎵</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  {content.duration}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                  {content.time} {content.date}
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-stone-400 block">Impressions</span>
                      <div className="text-white font-medium">{content.impressions}</div>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Engagement</span>
                      <div className="text-white font-medium">{content.engagement}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
