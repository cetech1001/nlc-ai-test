'use client'

import PaymentModal from "@/app/(dashboard)/coaches/make-payment/components/payment-modal";
import {useEffect, useState} from "react";
import {getPlans} from "@/app/data";
import {PlanCard} from "@/app/(dashboard)/components/plan-card";
import {MakePaymentSkeleton} from "@/app/(dashboard)/coaches/make-payment/components/make-payment-page.skeleton";

export default function MakePayment() {
  const coachName = "Charlie Levin";
  const coachEmail = "charlie.levin@email.com";
  const dateJoined = "Jun 26, 2025";
  const currentPlan: string = "Solo Agent";
  const billingCycle = "Monthly";
  const status = "Active";

  const plans = getPlans(currentPlan);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleUpgrade = (planTitle: string) => {
    setSelectedPlanForPayment(planTitle);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    console.log(`Payment completed for ${coachName} - ${selectedPlanForPayment}`);
  };

  if (isLoading) {
    return <MakePaymentSkeleton/>;
  }

  return (
    <div>
      <div className={`transition-all duration-300 ${ isPaymentModalOpen ? 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' : ''}`}>

        <div className="py-8">
          <h2 className="text-stone-50 text-2xl font-medium font-['Inter'] leading-relaxed">Make Payment</h2>
        </div>

        <div className="mb-8">
          <div className="flex flex-col px-4 gap-4 justify-center w-full h-72 sm:h-44 bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700">
            <div>
              <h3 className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">{coachName}</h3>
            </div>

            <div className="w-full flex flex-col gap-2 sm:grid sm:grid-cols-7 sm:gap-0">
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">User ID</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">#1234</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5 grid-cols-subgrid col-span-2">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Email</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">{coachEmail}</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Date Joined</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">{dateJoined}</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Current Plan</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">Starter</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Billing Cycle</div>
                <div className="text-stone-50 text-base font-medium font-['Inter']">{billingCycle}</div>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Account Status</div>
                <div className="flex items-center gap-2">
                  <div className="text-green-600 text-base font-medium font-['Inter']">{status}</div>
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

        <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} action={'Upgrade Plan'} onActionClick={handleUpgrade}/>
          ))}
        </div>
      </div>
      {isPaymentModalOpen ? (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          coachName={coachName}
          selectedPlan={selectedPlanForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      ) : null}
    </div>
  );
}
