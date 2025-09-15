import React from "react";

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 8.5L12 15.5L5 8.5" stroke="#F9F9F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
