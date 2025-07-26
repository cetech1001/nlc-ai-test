import {Phone} from "lucide-react";

export const CourseCompletionRate = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-stone-50 text-xl font-medium leading-relaxed">
            Leads to Follow Up
          </h3>
        </div>

        <div className="space-y-2 text-stone-300 text-sm">
          <p>2 leads opened last email.</p>
          <p>1 booked a call.</p>
          <p>1 ghosted again.</p>
        </div>
      </div>
    </div>
  );
};
