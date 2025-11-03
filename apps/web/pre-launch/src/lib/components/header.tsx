'use client';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export const Header = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="pt-6 px-3 z-20 w-full">
      <div className="flex items-center justify-between w-full space-x-3 sm:px-8">
        <img
          src={'/images/logo-large.png'}
          style={{ width: '192px' }}
          alt={'Logo'}
          className="cursor-pointer"
          onClick={() => router.push('/')}
        />

        <div className="flex items-center space-x-4">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 0 1 4.5 6h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center text-white/70 text-sm">
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="mx-2">|</span>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <button
          onClick={() => {
            router.push(process.env.NEXT_PUBLIC_COACH_PLATFORM_URL || '/');
          }}
          className="btn-primary"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="z-10 flex items-center justify-center">
              Login →
            </span>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="sm:hidden mt-3 px-1">
          <div className="mx-auto w-full max-w-sm rounded-md bg-black/30 backdrop-blur-md ring-1 ring-white/15 shadow-lg overflow-hidden">
            <Link
              href="/terms"
              className="block px-4 py-3 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Terms of Service
            </Link>
            <div className="h-px bg-white/10" />
            <Link
              href="/privacy"
              className="block px-4 py-3 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
