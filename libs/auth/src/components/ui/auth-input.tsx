import * as React from "react"
import { cn } from "@nlc-ai/ui"
import { Eye, EyeOff } from "lucide-react"

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  showPasswordToggle?: boolean
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, hint, showPasswordToggle = false, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const id = React.useId()

    const inputType = showPasswordToggle && showPassword ? "text" : type

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium auth-text-primary">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={cn(
              "w-full (auth)-input",
              error && "border-red-400 focus:border-red-400 focus:shadow-red-400/20",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 auth-text-muted hover:auth-text-secondary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && <p className="auth-error">{error}</p>}
        {hint && !error && <p className="text-xs auth-text-muted">{hint}</p>}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput";
