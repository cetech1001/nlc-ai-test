import { Button } from "@nlc-ai/ui";
import {Check} from "lucide-react";
import {Plan, TransformedPlan} from "@nlc-ai/types";
import {transformPlan} from "@nlc-ai/utils";


interface IProps {
  plan: Plan;
  currentPlan?: Plan;
  action: (plan: TransformedPlan) => string;
  onActionClick: (plan: Plan) => void;
}

export const PlanCard = ({ plan: rawPlan, currentPlan, action, onActionClick }: IProps) => {
  let plan = transformPlan(rawPlan, currentPlan);

  const renderActionButton = () => {
    if (plan.isCurrentPlan) {
      return (
        <div className="p-2.5 rounded-[10px] border border-fuchsia-400 flex justify-center items-center">
          <div className="text-stone-50 text-base font-semibold font-['Inter'] leading-normal">Current Plan</div>
        </div>
      );
    }

    if (action(plan) === 'Edit Plan') {
      return (
        <Button
          onClick={() => onActionClick(rawPlan)}
          className={'w-full p-2.5 rounded-[10px] flex justify-center items-center border border-fuchsia-400'}
        >
          <div
            className={"text-fuchsia-400 text-base font-semibold font-['Inter'] leading-normal"}>Edit Plan</div>
        </Button>
      );
    }

    return (
      <Button
        onClick={() => onActionClick(rawPlan)}
        className={'w-full p-2.5 rounded-[10px] flex justify-center items-center bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600'}
      >
        <div
          className={"text-stone-50 text-base font-semibold font-['Inter'] leading-normal"}>{action(plan)}</div>
      </Button>
    );
  }

  return (
    <div className="w-auto h-full shadow-[0px_2px_12px_0px_rgba(0,0,0,0.09)] flex flex-col">
      <div
        className="w-auto px-6 pt-7 pb-5 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-tl-[20px] rounded-tr-[20px] flex flex-col gap-2.5">
        <div className="flex flex-col gap-3">
          <div className={`w-6 h-6 ${plan.colorClass} rounded-full border-[3px] border-stone-950`}/>
          <div className="flex flex-col gap-1">
            <div className="text-stone-50 text-3xl font-bold font-['Inter']">{plan.title}</div>
            <div
              className="opacity-80 text-stone-50 text-base font-normal font-['Inter'] leading-normal">{plan.subtitle}</div>
          </div>
        </div>
      </div>

      <div
        className="w-auto px-6 py-5 bg-neutral-900/70 rounded-bl-[20px] rounded-br-[20px] border-t border-stone-50/20 flex flex-col gap-5 flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="text-stone-50 text-2xl font-semibold font-['Inter']">${plan.price}</div>
              <div className="text-stone-50/50 text-xs font-normal font-['Inter']">{plan.billingCycle}</div>
            </div>
            <div>
              <span className="text-stone-50/50 text-sm font-normal font-['Inter']">or </span>
              <span className="text-stone-50 text-sm font-semibold font-['Inter']">{plan.monthlyBilling}</span>
            </div>
          </div>
        </div>

        <div className="w-full mt-auto">
          {renderActionButton()}
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-2">
            <div className="text-stone-50 text-xs font-semibold font-['Inter']">What's Included:</div>
          </div>
          <div className="flex flex-col gap-2.5">
            {plan.features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center gap-2">
                <div className="w-3 h-3 relative overflow-hidden">
                  <Check className="w-2.5 h-2 text-stone-50"/>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-stone-50 text-base font-normal font-['Inter']">{feature}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
