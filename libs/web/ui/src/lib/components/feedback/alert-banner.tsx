'use client'

import * as React from "react";
import { cn } from "../../utils";

export interface AlertBannerProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onDismiss?: () => void;
  className?: string;
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ message, type = "info", onDismiss, className, ...props }, ref) => {
    const typeStyles = {
      success: "bg-green-800/20 border-green-600 text-green-400",
      error: "bg-red-800/20 border-red-600 text-red-400",
      warning: "bg-yellow-800/20 border-yellow-600 text-yellow-400",
      info: "bg-blue-800/20 border-blue-600 text-blue-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "mb-6 p-4 rounded-lg border",
          typeStyles[type],
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="hover:opacity-70 transition-opacity cursor-pointer text-sm underline ml-4"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }
);

AlertBanner.displayName = "AlertBanner";

export { AlertBanner };
