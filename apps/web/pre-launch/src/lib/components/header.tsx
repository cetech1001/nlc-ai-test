'use client';
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Header = () => {
  const router = useRouter();

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
    </div>
  );
};
