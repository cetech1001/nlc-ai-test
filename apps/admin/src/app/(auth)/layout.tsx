'use client'

import {BackgroundBlobs} from "@/app/(auth)/components/background-blobs";
import {GlowOrbs} from "@/app/(auth)/components/glow-orbs";

export default function AuthLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden font-inter"
      style={{ background: "#070300" }}
    >
      <div className="absolute inset-0 opacity-10 blur-[2px]">
        <BackgroundBlobs/>
      </div>
      <GlowOrbs/>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
