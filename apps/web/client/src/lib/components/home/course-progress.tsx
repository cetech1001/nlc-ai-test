import React from "react";

export const CourseProgress = () => {
  return (
    <div className="glass-card rounded-4xl w-full h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[400px] overflow-hidden">
      <div className="absolute -left-11 -bottom-13 w-56 h-56 bg-streak-gradient opacity-50 blur-[112.55px] rounded-full" />
      <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 lg:p-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 sm:mb-3">Course Progress</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">See more lessons to fully complete the training</p>
        </div>

        <div className="relative mx-auto">
          <svg
            width="100%"
            height="auto"
            viewBox="0 0 226 113"
            className="transform max-w-[180px] sm:max-w-[200px] lg:max-w-[226px]"
          >
            <path
              d="M0 112.472C2.62001e-06 82.6425 11.9053 54.0349 33.0969 32.9423C54.2885 11.8497 83.0305 3.20023e-06 113 0C142.969 -3.20023e-06 171.711 11.8497 192.903 32.9423C214.095 54.0348 226 82.6425 226 112.472L191.191 112.472C191.191 91.8313 182.953 72.0361 168.289 57.441C153.626 42.8459 133.738 34.6464 113 34.6464C92.2625 34.6464 72.3743 42.8459 57.7107 57.441C43.0471 72.0361 34.8091 91.8313 34.8091 112.472H0Z"
              fill="#242424"
            />
            <path
              d="M0 112.472C1.59929e-06 94.1782 4.46231 76.1606 13 59.9813C21.5377 43.802 33.8931 29.9495 48.9948 19.6248C64.0966 9.30014 81.4888 2.815 99.6636 0.731695C117.838 -1.35161 136.247 1.0298 153.293 7.66944L140.718 39.9533C128.923 35.359 116.185 33.7112 103.609 35.1527C91.033 36.5943 78.9984 41.0817 68.5486 48.2259C58.0989 55.3701 49.5496 64.9554 43.6419 76.1508C37.7342 87.3461 34.6464 99.8135 34.6464 112.472H0Z"
              fill="url(#progressGradient)"
            />
            <defs>
              <linearGradient id="progressGradient" x1="2" y1="2" x2="3.49827" y2="-25.7914" gradientUnits="userSpaceOnUse">
                <stop offset="0.0192308" stopColor="#FEBEFA"/>
                <stop offset="0.346154" stopColor="#B339D4"/>
                <stop offset="0.653846" stopColor="#7B21BA"/>
                <stop offset="1" stopColor="#7B26F0"/>
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-end justify-center pb-1 sm:pb-2">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-foreground leading-none">65</span>
              <span className="text-lg sm:text-xl lg:text-2xl text-foreground">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
