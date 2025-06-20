import { AuthInput } from "../ui/auth-input"
import { AuthButton } from "../ui/auth-button"
import { AuthFooter } from "../layout/auth-footer"
import { useAuthForm, verificationSchema } from "../../hooks/use-auth-form"
import type { VerificationFormData } from "../../types/auth"

interface VerificationFormProps {
  onSubmit: (data: VerificationFormData) => Promise<void>
  onResendCode: () => void
  email: string
  loading?: boolean
  error?: string
  resendCountdown?: number
}

export function VerificationForm({
                                   onSubmit,
                                   onResendCode,
                                   email,
                                   loading = false,
                                   error,
                                   resendCountdown = 0
                                 }: VerificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useAuthForm(verificationSchema)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm auth-text-secondary">
          Enter the verification code we've sent you to{" "}
          <span className="auth-text-primary font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <AuthInput
        label="Verification Code"
        type="text"
        placeholder="Enter verification code"
        {...register("code")}
        error={errors.code?.message}
        required
      />

      <AuthButton type="submit" loading={loading} disabled={!isValid}>
        Verify
      </AuthButton>

      <AuthFooter>
        <p className="text-sm auth-text-secondary">
          Didn't Receive Code?{" "}
          {resendCountdown > 0 ? (
            <span className="auth-text-muted">
              Resend {String(Math.floor(resendCountdown / 60)).padStart(2, '0')}:
              {String(resendCountdown % 60).padStart(2, '0')}
            </span>
          ) : (
            <button
              type="button"
              onClick={onResendCode}
              className="auth-link hover:underline"
            >
              Resend
            </button>
          )}
        </p>
      </AuthFooter>
    </form>
  )
}
