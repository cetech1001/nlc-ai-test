import {Star} from "lucide-react";

export const TestimonialOpportunity = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-stone-50 text-md font-medium leading-relaxed">
            New Testimonial Opportunity
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-stone-300 text-sm mb-4">
            Rachel: "You've boosted my confidence, helping me achieve goals I once thought were out of reach."
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Approve for Social
          </button>
          <div className="flex gap-3">
            <button className="flex-1 bg-neutral-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors">
              View
            </button>
            <button className="flex-1 bg-neutral-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-neutral-600 transition-colors">
              Save for Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
