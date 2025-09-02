import { PlanCard } from "@nlc-ai/web-shared";
import {FC} from "react";
import {Plan, Subscription, TransformedPlan} from "@nlc-ai/sdk-billing";


const SubscriptionPlansSkeleton = () => {
  return (
    <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700 p-6 h-80 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
            <div className="h-8 bg-neutral-700 rounded"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface IProps {
  plans: Plan[];
  handleUpgrade: (plan: Plan) => void;
  currentSubscription?: Subscription | null;
  isLoading?: boolean;
}

export const SubscriptionPlans: FC<IProps> = ({ plans, currentSubscription, handleUpgrade, isLoading }) => {
  if (isLoading) {
    return <SubscriptionPlansSkeleton/>
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-stone-400 text-lg mb-4">No subscription plans available</div>
      </div>
    );
  }

  return (
    <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          currentPlan={currentSubscription?.plan}
          action={(plan: TransformedPlan) => plan.isCurrentPlan ? 'Current Plan' : 'Upgrade Plan'}
          onActionClick={currentSubscription?.plan?.id === plan.id ? (_: Plan) => {} : handleUpgrade}
        />
      ))}
    </div>
  );
}
