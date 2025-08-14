'use client'

import { ReactNode } from 'react';
import { Search, Settings2 } from 'lucide-react';
import { Button } from '@nlc-ai/ui';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  showActionOnMobile?: boolean;
}

export const PageHeader = ({
  title,
  subtitle,
  children,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  showSearch = false,
  showFilterButton = false,
  onFilterClick,
  actionButton,
  className = "",
  showActionOnMobile = false
}: PageHeaderProps) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div className={"flex"}>
        <div className="min-w-0 flex-1 w-full sm:w-1/3">
          <h2 className="text-stone-50 text-2xl font-medium leading-relaxed mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-300 text-sm leading-tight">
              {subtitle}
            </p>
          )}
        </div>
        {actionButton && children && showActionOnMobile && (
          <Button
            onClick={actionButton.onClick}
            className={`${
              actionButton.variant === 'secondary'
                ? 'bg-transparent border border-white/50 text-white hover:bg-white/10'
                : 'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white'
            } rounded-lg transition-colors flex sm:hidden`}
          >
            {actionButton.icon && (
              <span className="w-4 h-4 mr-2">{actionButton.icon}</span>
            )}
            {actionButton.label}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-2/3 justify-start sm:justify-end">
        {children ? (
          children
        ) : (
          <>
            {showSearch && onSearchChange && (
              <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
                />
                <Search className="w-5 h-5 text-white" />
              </div>
            )}

            {actionButton && (
              <Button
                onClick={actionButton.onClick}
                className={`${
                  actionButton.variant === 'secondary'
                    ? 'bg-transparent border border-white/50 text-white hover:bg-white/10'
                    : 'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white'
                } rounded-lg transition-colors`}
              >
                {actionButton.icon && (
                  <span className="w-4 h-4 mr-2">{actionButton.icon}</span>
                )}
                {actionButton.label}
              </Button>
            )}

            {showFilterButton && onFilterClick && (
              <button
                onClick={onFilterClick}
                className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity p-2"
              >
                <Settings2 className="w-8 h-8 text-white" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
