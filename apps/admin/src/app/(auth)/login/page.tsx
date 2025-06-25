'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Checkbox, EyeLash } from "@nlc-ai/ui";

import { Logo } from "@/app/(auth)/components/logo";
import { GoogleIcon } from "@/app/(auth)/components/google-icon";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignUp = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div
      className="w-full max-w-[425px] sm:max-w-[500px] lg:max-w-[612px] relative"
      style={{
        maxWidth: "849px",
        background:
          "linear-gradient(198deg, rgba(38, 38, 38, 0.30) 10.03%, rgba(19, 19, 19, 0.30) 75.61%)",
        backdropFilter: "blur(21px)",
        borderRadius: "36px",
        border: "1px solid rgba(239, 239, 239, 0.2)",
      }}
    >
      <div className="relative px-6 sm:px-8 lg:px-[119px] py-12 lg:py-16">
        <div className="flex justify-center mb-10 lg:mb-14">
          <Logo />
        </div>

        <div className="text-center mb-2 lg:mb-[65px]">
          <h1 className="text-[32px] lg:text-[40px] font-semibold text-[#F9F9F9] leading-[1.2] mb-3">
            Login
          </h1>
          <p className="text-[18px] lg:text-[20px] text-[#898989] leading-[1.2]">
            Enter your email and password to access your account.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="block text-[14px] text-[#F9F9F9] leading-6">
              Email<span className="text-[#FF3030]">*</span>
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[64px] px-4 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-[14px] text-[#F9F9F9] leading-6">
                Password<span className="text-[#FF3030]">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[64px] px-4 pr-12 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CACACA] hover:text-[#F9F9F9] transition-colors"
                >
                  <EyeLash/>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-[6px] cursor-pointer">
                <div className="relative">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checkedState) => setRememberMe(checkedState === 'indeterminate' ? false : checkedState)}
                    className="w-8 h-8 border-2 border-[#CACACA] data-[state=checked]:bg-magenta data-[state=checked]:border-magenta rounded-lg"
                  />
                </div>
                <span className="text-[16px] leading-5 text-[#F9F9F9]">
                  Remember me
                </span>
              </label>
              <button
                onClick={handleForgotPassword}
                className="text-[16px] leading-5 text-[#F9F9F9] hover:text-magenta-light transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center min-h-[64px] bg-transparent border-[#EFEFEF] hover:bg-white/5 text-[#F9F9F9]/50 hover:text-[#F9F9F9] transition-all duration-200 rounded-[12px] gap-[14px]"
          >
            <GoogleIcon />
            <span className="text-[16px] leading-5">
              Sign up with google
            </span>
          </Button>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full min-h-[64px] text-[16px] leading-[22px] font-semibold text-white border-0 hover:opacity-90 transition-opacity rounded-[8px] mb-[29px]"
          style={{
            background:
              "linear-gradient(19deg, #FEBEFA 6.78%, #B339D4 34.87%, #7B21BA 61.32%, #7B26F0 91.07%)",
          }}
        >
          Login
        </Button>

        <div className="text-center space-y-[6px]">
          <p className="text-[16px] leading-6 text-[#F9F9F9]">
            Don't have an account?{" "}
            <button
              onClick={handleSignUp}
              className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
            >
              Sign Up
            </button>
          </p>
          <p className="text-[14px] leading-normal text-[#828282]">
            Using this platform means you agree to the{" "}
            <button className="underline hover:text-[#F9F9F9] transition-colors">
              Terms of Use
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
