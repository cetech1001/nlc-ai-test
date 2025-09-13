import React from "react";

export const CommunityImageGrid = ({ mainImage, previewImage }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <img
          src={mainImage}
          alt="Airbnb Arbitrage Course"
          className="w-full h-auto rounded-2xl border border-white/15 object-cover"
        />
      </div>
      <div>
        <img
          src={previewImage}
          alt="Course Preview"
          className="w-full h-[120px] sm:h-[167px] rounded-2xl border border-white/15 object-cover"
        />
      </div>
    </div>
  );
};
