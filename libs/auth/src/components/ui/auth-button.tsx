import * as React from "react"
import { cn } from "@nlc-ai/ui"
import { Loader2 } from "lucide-react"

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  loading?: boolean
  icon?: React.ReactNode
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ variant = "primary", loading = false, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" ? "(auth)-button-primary" : "(auth)-button-secondary",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    )
  }
)

AuthButton.displayName = "AuthButton";
