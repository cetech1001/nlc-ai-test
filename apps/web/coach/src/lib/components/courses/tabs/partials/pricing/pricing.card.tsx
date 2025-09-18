import { cn } from "@nlc-ai/web-ui";
import React from "react";

interface PricingCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  isDisabled?: boolean;
  availabilityBadge?: string;
  onSelect: () => void;
  children?: React.ReactNode;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  isSelected,
  isDisabled = false,
  availabilityBadge,
  onSelect,
  children
}) => {
  return (
    <div className="space-y-4 w-full">
      <div
        className={cn(
          "flex p-4 md:p-6 flex-col items-start gap-4 self-stretch rounded-2xl border border-[#454444] cursor-pointer transition-colors",
          "bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]",
          isSelected && "border-[#DF69FF]",
          isDisabled && "opacity-60 cursor-not-allowed"
        )}
        onClick={!isDisabled ? onSelect : undefined}
      >
        <div className="flex items-center gap-4 w-full">
          <div className={cn(
            "flex w-5 h-5 p-1 justify-center items-center gap-[10px] rounded-full border flex-shrink-0",
            isSelected ? "border-[#DF69FF]" : "border-white/40"
          )}>
            {isSelected && (
              <div className="w-3 h-3 rounded-full bg-[#DF69FF]"></div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
            <span className={cn(
              "font-inter text-lg md:text-xl font-medium leading-6",
              isDisabled ? "text-[#F9F9F9]/60" : "text-[#F9F9F9]"
            )}>
              {title}
            </span>

            {availabilityBadge && (
              <div className="flex px-[6px] py-1 justify-center items-center gap-[10px] rounded-lg bg-[#333] self-start">
                <span className="text-white font-inter text-xs md:text-sm font-semibold leading-5">
                  {availabilityBadge}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="self-stretch text-[#838383] font-inter text-sm md:text-base font-normal">
          {description}
        </p>
      </div>

      {isSelected && children && (
        <div className="ml-0 sm:ml-9 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
