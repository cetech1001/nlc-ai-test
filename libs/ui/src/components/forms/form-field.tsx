import * as React from "react"
import { cn } from "../../utils/cn"
import { Label } from "../primitives/label"

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          // @ts-expect-error says overload doesn't match this call
          id,
          className: cn(
            ((children as React.ReactElement).props as any).className,
            error && "border-red-300 focus:border-red-500 focus:ring-red-500"
          ),
        })}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}
