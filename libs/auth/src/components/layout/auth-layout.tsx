import * as React from "react"
import { cn } from "@nlc-ai/ui"
import { BrandLogo } from "../ui/brand-logo"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className={cn("relative z-10 flex min-h-screen items-center justify-center p-4", className)}>
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <BrandLogo className="mx-auto" />

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold auth-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm auth-text-secondary">{subtitle}</p>
            )}
          </div>

          {/* Card Content */}
          <div className="auth-card p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
