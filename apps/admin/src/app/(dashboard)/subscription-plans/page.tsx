'use client'

import { Plus } from "lucide-react";
import {useRouter} from "next/navigation";
import {PlanCard} from "@/app/(dashboard)/components/plan-card";
import {getPlans} from "@/app/data";
import { Button } from "@nlc-ai/ui";
import {useEffect, useState} from "react";
import {PlansPageSkeleton} from "@/app/(dashboard)/subscription-plans/components/plans-page.skeleton";


const SubscriptionPlans = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const plans = getPlans("");

  const handleEditPlan = (planTitle: string) => {
    console.log(`Editing plan: ${planTitle}`);
    router.push("/subscription-plans/edit");
  };

  const handleCreateNewPlan = () => {
    router.push("/subscription-plans/create");
  };
  
  if (isLoading) {
    return <PlansPageSkeleton/>
  }

  return (
    <div className="mb-8 pt-2 sm:pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-white text-2xl font-semibold">
          Existing Plans
        </h2>
        <Button
          onClick={handleCreateNewPlan}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg hover:bg-[#8B31CA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <PlanCard
            key={index}
            plan={plan}
            action={"Edit Plan"}
            onActionClick={handleEditPlan}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
