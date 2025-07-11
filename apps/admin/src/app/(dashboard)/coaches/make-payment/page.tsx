'use client'

import PaymentModal from "@/lib/modals/payment-modal";
import {useEffect, useState} from "react";
import {PlanCard} from "@/app/(dashboard)/components/plan-card";
import {MakePaymentSkeleton} from "@/lib/skeletons/make-payment-page.skeleton";
import { useSearchParams } from "next/navigation";
import { coachesAPI, plansAPI, type Plan } from "@nlc-ai/api-client";
import { AlertBanner } from '@nlc-ai/ui';
import type { CoachDetail } from "@nlc-ai/types";

interface TransformedPlan {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  monthlyPrice: number;
  billingCycle: string;
  monthlyBilling: string;
  features: string[];
  isCurrentPlan: boolean;
  colorClass: string;
}

const getColorClass = (planName: string) => {
  const colorMap: Record<string, string> = {
    'Solo Agent': 'bg-[#9C55FF]',
    'Starter Pack': 'bg-[#B347FF]',
    'Growth Pro': 'bg-fuchsia-400',
    'Scale Elite': 'bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 rotate-45',
  };
  return colorMap[planName] || 'bg-[#7B21BA]';
};

const transformPlan = (plan: Plan, currentPlanName?: string): TransformedPlan => ({
  id: plan.id,
  title: plan.name,
  subtitle: plan.description || `Access to ${plan.maxAiAgents || 'unlimited'} agents`,
  price: Math.floor(plan.annualPrice / 100), // Convert from cents to dollars
  monthlyPrice: Math.floor(plan.monthlyPrice / 100),
  billingCycle: "per user/month billed annually",
  monthlyBilling: `$${Math.floor(plan.monthlyPrice / 100)} billed monthly`,
  features: plan.features || [],
  isCurrentPlan: plan.name === currentPlanName,
  colorClass: getColorClass(plan.name),
});

export default function MakePayment() {
  const searchParams = useSearchParams();
  const coachId = searchParams.get('coachId');

  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [plans, setPlans] = useState<TransformedPlan[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!coachId) {
        setError("No coach ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Fetch coach data and plans in parallel
        const [coachData, plansData] = await Promise.all([
          coachesAPI.getCoach(coachId),
          plansAPI.getPlans(false) // Only get active plans
        ]);

        setCoach(coachData);

        // Get current plan name from coach's active subscription
        const currentPlanName = coachData.subscriptions?.[0]?.plan?.name;

        // Transform plans data to match the expected format
        const transformedPlans = plansData.map(plan =>
          transformPlan(plan, currentPlanName)
        );

        setPlans(transformedPlans);
      } catch (err: any) {
        setError(err.message || "Failed to load coach and plan data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [coachId]);

  const handleUpgrade = (planTitle: string) => {
    setSelectedPlanForPayment(planTitle);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    setSuccessMessage(`Payment completed successfully for ${coach?.firstName} ${coach?.lastName} - ${selectedPlanForPayment}`);

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    // Optionally refresh coach data to show updated subscription
    if (coachId) {
      coachesAPI.getCoach(coachId).then(setCoach).catch(console.error);
    }
  };

  const clearError = () => {
    setError("");
  };

  const clearSuccessMessage = () => {
    setSuccessMessage("");
  };

  if (isLoading) {
    return <MakePaymentSkeleton/>;
  }

  if (error) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error} onDismiss={clearError} />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message="Coach not found" onDismiss={clearError} />
      </div>
    );
  }

  // Get current subscription details
  const currentSubscription = coach.subscriptions?.[0];
  const currentPlan = currentSubscription?.plan?.name || 'No Plan';
  const subscriptionStatus = currentSubscription?.status || 'none';
  const billingCycle = currentSubscription?.billingCycle || 'Monthly';

  // Format the status for display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-600' };
      case 'canceled':
        return { text: 'Canceled', color: 'text-red-600' };
      case 'past_due':
        return { text: 'Past Due', color: 'text-yellow-600' };
      case 'trialing':
        return { text: 'Trial', color: 'text-blue-600' };
      case 'none':
        return { text: 'No Subscription', color: 'text-gray-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const statusDisplay = getStatusDisplay(subscriptionStatus);

  return (
    <div>
      <div className={`transition-all duration-300 ${ isPaymentModalOpen ? 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' : ''}`}>

        {successMessage && (
          <div className="mb-6">
            <AlertBanner type="success" message={successMessage} onDismiss={clearSuccessMessage} />
          </div>
        )}

        <div className="py-8">
          <h2 className="text-stone-50 text-2xl font-medium font-['Inter'] leading-relaxed">Make Payment</h2>
        </div>

        <div className="mb-8">
          <div className="flex flex-col px-4 gap-4 justify-center w-full h-72 sm:h-44 bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700">
            <div>
              <h3 className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">
                {coach.firstName} {coach.lastName}
              </h3>
            </div>

            <div className="w-full flex flex-col gap-2 sm:grid sm:grid-cols-7 sm:gap-0">
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">User ID</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">#{coach.id.slice(-8)}</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5 grid-cols-subgrid col-span-2">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Email</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">{coach.email}</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Date Joined</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">
                  {new Date(coach.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Current Plan</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">{currentPlan}</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Billing Cycle</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">
                  {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}
                </div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Account Status</div>
                <div className="flex items-center gap-2">
                  <div className={`text-base font-medium font-['Inter'] ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </div>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="rgb(245 245 245)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">Select Plan</h3>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-stone-400 text-lg mb-4">No subscription plans available</div>
          </div>
        ) : (
          <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                action={plan.isCurrentPlan ? 'Current Plan' : 'Upgrade Plan'}
                onActionClick={plan.isCurrentPlan ? () => {} : () => handleUpgrade(plan.title)}
              />
            ))}
          </div>
        )}
      </div>
      {isPaymentModalOpen ? (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          coachName={`${coach.firstName} ${coach.lastName}`}
          coachId={coach.id}
          selectedPlan={selectedPlanForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      ) : null}
    </div>
  );
}
