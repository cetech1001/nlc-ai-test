"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AuthLayout,
  LoginForm,
  type LoginFormData
} from "@nlc-ai/auth"

export default function CoachLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userType: "coach" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const result = await response.json()
      // Handle successful login (set tokens, redirect, etc.)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Implement Google OAuth for coaches
      window.location.href = "/api/auth/google?userType=coach"
    } catch (err) {
      setError("Google sign in failed")
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Enter your email and password to access your account."
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={() => router.push("/auth/forgot-password")}
        onSignUp={() => router.push("/auth/signup")}
        onGoogleSignIn={handleGoogleSignIn}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  )
}
