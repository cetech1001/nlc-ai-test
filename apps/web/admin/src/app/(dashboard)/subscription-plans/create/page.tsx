'use client'

import { useRouter } from "next/navigation";
import { PlanForm } from "@/lib/components/plans/plan-form";
import { plansAPI } from "@nlc-ai/web-api-client";
import {CreatePlanRequest} from "@nlc-ai/types";
import { BackTo } from "@nlc-ai/web-shared";

const CreateNewPlan = () => {
  const router = useRouter();

  const handleCreatePlan = async (requestData: CreatePlanRequest) => {
    await plansAPI.createPlan(requestData);
    router.push("/subscription-plans?success=Plan created successfully");
  };

  const handleDiscard = () => {
    router.push("/subscription-plans");
  };

  const handleBackToPlans = () => {
    handleDiscard();
  };

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      <BackTo title={'Create New Plan'} onClick={handleBackToPlans} />

      <PlanForm
        type="create"
        onAction={handleCreatePlan}
        onDiscard={handleDiscard}
      />
    </main>
  );
};

export default CreateNewPlan;
