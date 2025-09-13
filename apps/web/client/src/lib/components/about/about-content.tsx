import React from "react";

export const AboutContent = ({ description }: any) => {
  return (
    <div className="space-y-4 sm:space-y-6 text-dark-900 text-base sm:text-lg lg:text-xl leading-6 sm:leading-7 lg:leading-8">
      <p>{description.intro}</p>

      <div className="space-y-1 sm:space-y-2">
        {description.benefits.map((benefit: string, index: number) => (
          <p key={index}>{benefit}</p>
        ))}
      </div>

      <p>{description.conclusion}</p>
    </div>
  );
};
