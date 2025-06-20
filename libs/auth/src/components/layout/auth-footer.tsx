import * as React from "react"
import {cn} from "@nlc-ai/ui";

interface AuthFooterProps {
  children: React.ReactNode
  className?: string
}

export function AuthFooter({ children, className }: AuthFooterProps) {
  return (
    <div className={cn("mt-6 text-center space-y-2", className)}>
      {children}
      <p className="text-xs auth-text-muted">
        Using this platform means you agree to the{" "}
        <a href="/terms" className="auth-link hover:underline">
          Terms of Use
        </a>
        .
      </p>
    </div>
  )
}
