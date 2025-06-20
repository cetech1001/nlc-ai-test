import { AuthInput } from "../ui/auth-input"
import { AuthButton } from "../ui/auth-button"
import { AuthFooter } from "../layout/auth-footer"
import { useAuthForm, loginSchema } from "../../hooks/use-auth-form"
import type { LoginFormData } from "../../types/auth"

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  onForgotPassword: () => void
  onSignUp: () => void
  onGoogleSignIn?: () => Promise<void>
  loading?: boolean
  error?: string
}

export function LoginForm({
                            onSubmit,
                            onForgotPassword,
                            onSignUp,
                            onGoogleSignIn,
                            loading = false,
                            error
                          }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useAuthForm(loginSchema)

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

      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        showPasswordToggle
        {...register("password")}
        error={errors.password?.message}
        required
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="auth-checkbox"
            {...register("rememberMe")}
          />
          <span className="text-sm auth-text-secondary">Remember me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm auth-link hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {onGoogleSignIn && (
        <AuthButton
          type="button"
          variant="secondary"
          onClick={onGoogleSignIn}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
          loading={loading}
        >
          Sign up with google
        </AuthButton>
      )}

      <AuthButton type="submit" loading={loading} disabled={!isValid}>
        Login
      </AuthButton>

      <AuthFooter>
        <p className="text-sm auth-text-secondary">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSignUp}
            className="auth-link hover:underline"
          >
            Sign Up
          </button>
        </p>
      </AuthFooter>
    </form>
  )
}
