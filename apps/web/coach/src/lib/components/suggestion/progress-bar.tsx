'use client'

import React from 'react';

interface ProgressBarProps {
  percentage: number;
  width?: number;
  height?: number;
  uniqueID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
                                                   percentage,
                                                   width = 632,
                                                   height = 4,
                                                   uniqueID = 'default'
                                                 }) => (
  <div className="flex flex-col items-start self-stretch relative w-full">
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
    >
      <path
        opacity="0.2"
        d={`M2 ${height/2}H${width-2}`}
        stroke="white"
        strokeWidth={height}
        strokeLinecap="round"
      />
      <path
        d={`M2 ${height/2}H${Math.min(width-2, 2 + (percentage / 100) * (width-4))}`}
        stroke={`url(#gradient-${uniqueID})`}
        strokeWidth={height}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={`gradient-${uniqueID}`}
          x1="2"
          y1={height/2}
          x2={width-2}
          y2={height/2}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0192308" stopColor="#FEBEFA"/>
          <stop offset="0.346154" stopColor="#B339D4"/>
          <stop offset="0.653846" stopColor="#7B21BA"/>
          <stop offset="1" stopColor="#7B26F0"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
);
