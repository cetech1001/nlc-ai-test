import { AuthInput } from "../ui/auth-input"
import { AuthButton } from "../ui/auth-button"
import { AuthFooter } from "../layout/auth-footer"
import { useAuthForm, forgotPasswordSchema } from "../../hooks/use-auth-form"
import type { ForgotPasswordFormData } from "../../types/auth"

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>
  onBackToLogin: () => void
  loading?: boolean
  error?: string
  success?: boolean
}

export function ForgotPasswordForm({
                                     onSubmit,
                                     onBackToLogin,
                                     loading = false,
                                     error,
                                     success = false
                                   }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useAuthForm(forgotPasswordSchema)

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400">
            Check your email! We've sent you a link to reset your password.
          </p>
        </div>
        <AuthButton onClick={onBackToLogin}>
          Back to Login
        </AuthButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <AuthInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        {...register("email")}
        error={errors.email?.message}
        required
      />

      <AuthButton type="submit" loading={loading} disabled={!isValid}>
        Reset Password
      </AuthButton>

      <AuthFooter>
        <p className="text-sm auth-text-secondary">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onBackToLogin}
            className="auth-link hover:underline"
          >
            Login
          </button>
        </p>
      </AuthFooter>
    </form>
  )
}
