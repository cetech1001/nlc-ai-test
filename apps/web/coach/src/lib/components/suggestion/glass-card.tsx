'use client'

import React from 'react';

interface GlowOrbProps {
  size?: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: 'purple' | 'pink';
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowOrbs?: GlowOrbProps[];
  padding?: string;
  onClick?: () => void;
}

const GlowOrb: React.FC<GlowOrbProps> = ({
                                           size = 252,
                                           position,
                                           color = 'purple'
                                         }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-[-74px] left-[-70px]';
      case 'top-right':
        return 'top-[-74px] right-[-70px]';
      case 'bottom-left':
        return 'bottom-[-200px] left-[30px]';
      case 'bottom-right':
        return 'bottom-[-74px] right-[-70px]';
      default:
        return 'top-[-74px] left-[-70px]';
    }
  };

  const getGradientColor = () => {
    return color === 'pink'
      ? 'bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600'
      : 'bg-gradient-to-l from-[#D497FF] to-[#7B21BA]';
  };

  return (
    <div
      className={`absolute rounded-full opacity-40 blur-[112.55px] ${getGradientColor()} ${getPositionClasses()}`}
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
    />
  );
};

export const GlassCard: React.FC<GlassCardProps> = ({
                                               children,
                                               className = '',
                                               glowOrbs = [],
                                               padding = 'p-[30px]',
  onClick
                                             }) => {
  return (
    <div onClick={onClick} className={`rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] ${padding} relative overflow-hidden ${className}`}>
      {/* Render glow orbs */}
      {glowOrbs.map((orb, index) => (
        <GlowOrb
          key={index}
          size={orb.size}
          position={orb.position}
          color={orb.color}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
