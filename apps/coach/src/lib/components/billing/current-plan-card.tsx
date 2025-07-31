import {FC} from 'react';
import {BillingCycle, Subscription} from "@nlc-ai/types";
import {Button} from "@nlc-ai/ui";
import { formatCurrency, toTitleCase } from '@nlc-ai/utils';

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

interface IProps {
  subscription?: Subscription;
  onChangePlan?: () => void;
}

export const CurrentPlanCard: FC<IProps> = ({
  subscription,
  onChangePlan,
}) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
      <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
            Current Plan
          </h2>
        </div>

        <div className={"flex justify-between"}>
          <div className="grid grid-cols-1 sm:grid-cols-7 w-full gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Plan</div>
              <div className="text-stone-50 text-base font-medium">{subscription?.plan?.name}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Next Billing</div>
              <div className="text-stone-50 text-base font-medium">
                {new Date(subscription?.currentPeriodStart || '').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Amount</div>
              <div className="text-stone-50 text-base font-medium">
                {formatCurrency(subscription?.billingCycle === BillingCycle.MONTHLY
                  ? subscription?.plan?.monthlyPrice
                  : subscription?.plan?.annualPrice)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Billing Cycle</div>
              <div className="text-stone-50 text-base font-medium">{toTitleCase(subscription?.billingCycle)}</div>
            </div>
          </div>
          <div className="space-y-1">
            <Button
              className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex'}
            >
              Change Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
