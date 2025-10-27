import React from 'react';

export interface PresenceIndicatorProps {
  status: 'online' | 'away' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
                                                                      status,
                                                                      size = 'md',
                                                                      showLabel = false,
                                                                      label,
                                                                      className = ''
                                                                    }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };

  const textColorClasses = {
    online: 'text-green-400',
    away: 'text-yellow-400',
    offline: 'text-gray-400'
  };

  const labels = {
    online: 'Online',
    away: 'Away',
    offline: 'Offline'
  };

  const displayLabel = label || labels[status];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className={`rounded-full ${sizeClasses[size]} ${colorClasses[status]}
          ${status === 'online' ? 'animate-pulse shadow-lg shadow-green-500/50' : ''}
          ${status === 'away' ? 'shadow-md shadow-yellow-500/30' : ''}`}
        title={displayLabel}
      />
      {showLabel && (
        <span className={`text-xs font-medium ${textColorClasses[status]}`}>
          {displayLabel}
        </span>
      )}
    </div>
  );
};
