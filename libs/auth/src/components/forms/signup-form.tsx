import { AuthInput } from "../ui/auth-input"
import { AuthButton } from "../ui/auth-button"
import { AuthFooter } from "../layout/auth-footer"
import { useAuthForm, signUpSchema } from "../../hooks/use-auth-form"
import type { SignUpFormData } from "../../types/auth"

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>
  onLogin: () => void
  loading?: boolean
  error?: string
}

export function SignUpForm({
                             onSubmit,
                             onLogin,
                             loading = false,
                             error
                           }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useAuthForm(signUpSchema)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <AuthInput
        label="Name"
        type="text"
        placeholder="Enter your full name"
        {...register("name")}
        error={errors.name?.message}
        required
      />

      <AuthInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        {...register("email")}
        error={errors.email?.message}
        required
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        showPasswordToggle
        {...register("password")}
        error={errors.password?.message}
        required
      />

      <AuthInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        showPasswordToggle
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
        required
      />

      <AuthButton type="submit" loading={loading} disabled={!isValid}>
        Sign Up
      </AuthButton>

      <AuthFooter>
        <p className="text-sm auth-text-secondary">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="auth-link hover:underline"
          >
            Sign Up
          </button>
        </p>
      </AuthFooter>
    </form>
  )
}
