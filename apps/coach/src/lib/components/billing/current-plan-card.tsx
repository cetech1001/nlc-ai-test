import { FC } from 'react';

interface CurrentPlanData {
  plan: string;
  amount: number;
  nextBilling: string;
  billingCycle: string;
}

interface IProps {
  currentPlan: CurrentPlanData;
  onChangePlan?: () => void;
  showChangeButton?: boolean;
}

export const CurrentPlanCardSkeleton: FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden animate-pulse">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-neutral-700 rounded w-32"></div>
          <div className="h-10 bg-neutral-700 rounded w-28"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CurrentPlanCard: FC<IProps> = ({
  currentPlan,
  onChangePlan,
  showChangeButton = true
}) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      {/* Glow orb background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-stone-50 text-xl font-semibold leading-relaxed">
            Current Plan
          </h2>
          {showChangeButton && onChangePlan && (
            <button
              onClick={onChangePlan}
              className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity font-medium text-sm"
            >
              Change Plan
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-stone-400 text-sm font-medium leading-tight">Plan</div>
            <div className="text-stone-50 text-base font-semibold">{currentPlan.plan}</div>
          </div>

          <div className="space-y-1">
            <div className="text-stone-400 text-sm font-medium leading-tight">Amount</div>
            <div className="text-stone-50 text-base font-semibold">${currentPlan.amount}</div>
          </div>

          <div className="space-y-1">
            <div className="text-stone-400 text-sm font-medium leading-tight">Next Billing</div>
            <div className="text-stone-50 text-base font-semibold">{currentPlan.nextBilling}</div>
          </div>

          <div className="space-y-1">
            <div className="text-stone-400 text-sm font-medium leading-tight">Billing Cycle</div>
            <div className="text-stone-50 text-base font-semibold">{currentPlan.billingCycle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
