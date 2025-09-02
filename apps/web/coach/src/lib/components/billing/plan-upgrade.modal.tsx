import {useState} from 'react';
import {BillingCycle, Plan} from '@nlc-ai/sdk-billing';
import {Button} from '@nlc-ai/web-ui';
import {Check, CreditCard, X} from 'lucide-react';
import {useSubscription} from '@/lib/hooks/use-subscription';

interface PlanUpgradeModalProps {
  plan: Plan;
  currentPlan?: Plan;
  coachID: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PlanUpgradeModal = ({
 plan,
 currentPlan,
 coachID,
 isOpen,
 onClose,
 onSuccess
}: PlanUpgradeModalProps) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.ANNUAL);
  const { createSubscription, isLoading, error, clearError } = useSubscription();

  if (!isOpen) return null;

  const isUpgrade = currentPlan && plan.monthlyPrice > currentPlan.monthlyPrice;
  const isDowngrade = currentPlan && plan.monthlyPrice < currentPlan.monthlyPrice;

  const selectedPrice = billingCycle === BillingCycle.ANNUAL ? plan.annualPrice : plan.monthlyPrice;
  const displayPrice = Math.floor(selectedPrice / 100);
  const savings = billingCycle === BillingCycle.ANNUAL
    ? Math.floor(((plan.monthlyPrice * 12) - plan.annualPrice) / 100)
    : 0;

  const handleConfirm = async () => {
    try {
      clearError();
      await createSubscription(coachID, plan.id, billingCycle);
      onSuccess();
      onClose();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-neutral-700 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {isUpgrade ? 'Upgrade Plan' : isDowngrade ? 'Downgrade Plan' : 'Subscribe to Plan'}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Plan Details */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">{plan.name}</h4>
            <p className="text-neutral-400 text-sm mb-3">{plan.description}</p>

            {plan.features && (
              <div className="space-y-2">
                {plan.features.slice(0, 3).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing Cycle Selection */}
          <div className="space-y-3">
            <label className="text-white font-medium">Billing Cycle</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-neutral-800/30 border-neutral-700">
                <input
                  type="radio"
                  name="billing"
                  value="annual"
                  checked={billingCycle === BillingCycle.ANNUAL}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle.ANNUAL)}
                  className="text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Annual</span>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${Math.floor(plan.annualPrice / 100)}/year
                      </div>
                      {savings > 0 && (
                        <div className="text-green-400 text-xs">
                          Save ${savings}/year
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-neutral-800/30 border-neutral-700">
                <input
                  type="radio"
                  name="billing"
                  value="monthly"
                  checked={billingCycle === BillingCycle.MONTHLY}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle.MONTHLY)}
                  className="text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Monthly</span>
                    <div className="text-white font-semibold">
                      ${Math.floor(plan.monthlyPrice / 100)}/month
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-neutral-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-300">Total</span>
              <span className="text-white text-xl font-bold">
                ${displayPrice}/{billingCycle === BillingCycle.ANNUAL ? 'year' : 'month'}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Confirm {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscription'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
