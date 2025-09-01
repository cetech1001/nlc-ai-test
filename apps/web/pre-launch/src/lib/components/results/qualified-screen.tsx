import React, {FC} from "react";
import {useRouter} from "next/navigation";
import { appConfig } from "@nlc-ai/web-shared";

export const QualifiedScreen: FC<{ email: string }> = ({ email }) => {
  const router = useRouter();

  const handleVerifyAccount = () => {
    router.push(`${appConfig.platforms.coach}/account-verification?email=${email}&type=password_reset`)
  }

  return (
    <>
      <h2 className="text-[40px] sm:text-5xl font-semibold text-white mb-2">
        You Qualify
      </h2>
      <h2 className="text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-l from-fuchsia-200 via-fuchsia-400 to-purple-600 mb-6">
        Welcome to the<br className={"block sm:hidden"}/> Inner Circle
      </h2>
      <p className="text-lg sm:text-xl text-white/90 mb-4">
        Based on your answers, you're exactly the kind of coach we built this for.
      </p>
      <p className="text-[16px] sm:text-xl mb-8 text-white/80">
        You've officially secured your spot inside the Next Level Coach Vault,<br className={"hidden sm:block"}/> <span className={"text-primary"}>one of only 100 coaches</span> to gain early access.
      </p>
      <p className="text-[16px] sm:text-xl mb-8 text-white/80">
        This is your invite into the room where the future of coaching is being built.
      </p>
      <p className="text-lg bg-clip-text text-transparent bg-gradient-to-t from-fuchsia-200 via-fuchsia-400 to-purple-600 mb-8">Let's make it count!</p>

      <div className="bg-[#171717] border-qualified p-1 rounded-xl mb-8">
        <div className="rounded-xl px-8 py-6">
          <h3 className="text-2xl font-semibold mb-2 text-white">AI‑Ready Coach</h3>
          <p className="text-[16px] sm:text-lg text-white/80">
            Eligible for the AI Vault + Be the first to access the software
          </p>
        </div>
      </div>

      <button onClick={handleVerifyAccount}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-purple-700 hover:from-fuchsia-300 hover:via-fuchsia-700 hover:to-purple-800 cursor-pointer text-white font-semibold py-3 px-12 rounded-lg text-xl transition-all duration-300 transform hover:scale-105">
        Join The AI Vault Now
      </button>
    </>
  );
}
