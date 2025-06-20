import { cn } from "@nlc-ai/ui"

interface BrandLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-15 h-15",
    lg: "w-20 h-20"
  }

  return (
    <div className={cn("auth-logo", sizeClasses[size], className)}>
      {/* The CSS pseudo-element creates the arrow/play icon */}
    </div>
  )
}
