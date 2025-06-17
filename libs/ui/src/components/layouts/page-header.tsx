import * as React from "react"
import { cn } from "../../utils/cn"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  children,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn("pb-5 border-b border-gray-200", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
