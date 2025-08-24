'use client'

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {BackTo, PlanCard} from "@nlc-ai/web-shared";
import { AlertBanner } from '@nlc-ai/web-ui';
import {Plan, TransformedPlan} from "@nlc-ai/sdk-billing";
import {MakePaymentSkeleton, PaymentModal, sdkClient} from "@/lib";
import {ExtendedCoach} from "@nlc-ai/sdk-users";

const AdminMakePaymentPage = () => {
  const router = useRouter();

  const params = useParams();
  const coachID = params.coachID as string;

  const [coach, setCoach] = useState<ExtendedCoach | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!coachID) {
        setError("No coach ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [coachData, plansData] = await Promise.all([
          sdkClient.users.coaches.getCoach(coachID),
          sdkClient.billing.plans.getPlans(false)
        ]);

        setCoach(coachData);
        setPlans(plansData);
      } catch (err: any) {
        setError(err.message || "Failed to load coach and plan data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [coachID]);

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlanForPayment(plan.name);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    setSuccessMessage(`Payment completed successfully for ${coach?.firstName} ${coach?.lastName} - ${selectedPlanForPayment}`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    if (coachID) {
      sdkClient.users.coaches.getCoach(coachID).then(setCoach).catch(console.error);
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

  const currentSubscription = coach.subscriptions?.[0];
  const currentPlan = currentSubscription?.plan?.name || 'No Plan';
  const subscriptionStatus = currentSubscription?.status || 'none';
  const billingCycle = currentSubscription?.billingCycle || 'Monthly';

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

        <div className="py-4">
          <BackTo onClick={() => router.back()} title={"Make Payment"}/>
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
                  {new Date(coach.createdAt || '').toLocaleDateString('en-US', {
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
                currentPlan={coach.subscriptions?.[0]?.plan}
                action={(plan: TransformedPlan) => plan.isCurrentPlan ? 'Current Plan' : 'Upgrade Plan'}
                onActionClick={handleUpgrade}
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
          coachID={coach.id}
          selectedPlan={selectedPlanForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      ) : null}
    </div>
  );
}

export default AdminMakePaymentPage;
