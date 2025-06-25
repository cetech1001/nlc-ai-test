'use client'

import {useRouter} from "next/navigation";
import {useState} from "react";
import {Logo} from "@/app/(auth)/components/logo";
import { Input, EyeLashIcon, Button } from "@nlc-ai/ui";

export default function ResetPassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleResetPassword = () => {
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div
      className="w-full max-w-[425px] sm:max-w-[500px] lg:max-w-[612px] relative"
      style={{
        maxWidth: "849px",
        background:
          "linear-gradient(198deg, rgba(38, 38, 38, 0.30) 10.03%, rgba(19, 19, 19, 0.30) 75.61%)",
        backdropFilter: "blur(21px)",
        borderRadius: "24px",
        border: "1px solid rgba(239, 239, 239, 0.2)",
      }}
    >
      <div className="relative px-6 sm:px-8 lg:px-[119px] py-12 lg:py-16">
        <div className="flex justify-center mb-10 lg:mb-14">
          <Logo />
        </div>

        <div className="text-center mb-8">
          <h1 className="self-stretch text-center justify-center text-stone-50 text-4xl font-semibold font-['Inter'] leading-[48px]">
            Password Reset
          </h1>
          <div className="self-stretch text-center justify-center text-zinc-500 text-xl font-normal font-['Inter'] leading-normal">
            Create a new password to reset your account access.
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="block text-[14px] text-[#F9F9F9] leading-6">
              New Password<span className="text-[#FF3030]">*</span>
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
                <EyeLashIcon/>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[14px] text-[#F9F9F9] leading-6">
              Confirm New Password<span className="text-[#FF3030]">*</span>
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-[64px] px-4 pr-12 text-[16px] leading-5 border-[#EFEFEF] bg-transparent text-[#F9F9F9] placeholder:text-[#F9F9F9]/50 focus:border-magenta-light focus:ring-magenta-light/20 rounded-[12px]"
            />
          </div>
        </div>


        <Button
          onClick={handleResetPassword}
          className="w-full min-h-[64px] text-[16px] leading-[22px] font-semibold text-white border-0 hover:opacity-90 transition-opacity rounded-[8px] mb-[29px]"
          style={{
            background:
              "linear-gradient(19deg, #FEBEFA 6.78%, #B339D4 34.87%, #7B21BA 61.32%, #7B26F0 91.07%)",
          }}
        >
          Reset Password
        </Button>

        <div className="text-center space-y-[6px]">
          <p className="text-[16px] leading-6 text-[#F9F9F9]">
            Remember your password?{" "}
            <button
              onClick={handleLogin}
              className="text-[#DF69FF] hover:text-[#FEBEFA] transition-colors"
            >
              Login
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
