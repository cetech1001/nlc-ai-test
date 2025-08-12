'use client'

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanForm } from "@/lib/components/plans/plan-form";
import { PlanFormSkeleton } from "@/lib/skeletons/plan-form.skeleton";
import { plansAPI } from "@nlc-ai/web-api-client";
import {Plan, UpdatePlanRequest} from "@nlc-ai/types";
import { BackTo } from "@nlc-ai/web-shared";

const EditPlan = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planID = searchParams.get('id');

  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [originalPlan, setOriginalPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (!planID) {
      router.push("/subscription-plans");
      return;
    }

    (() => loadPlan(planID))();
  }, [planID, router]);

  const loadPlan = async (id: string) => {
    try {
      setIsLoadingPlan(true);
      const plan = await plansAPI.getPlan(id);
      setOriginalPlan(plan);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handleEditPlan = async (requestData: UpdatePlanRequest) => {
    if (planID) {
      await plansAPI.updatePlan(planID, requestData);
      router.push("/subscription-plans?success=Plan updated successfully");
    }
  };

  const handleDiscard = () => {
    router.push("/subscription-plans");
  };

  const handleBackToPlans = () => {
    handleDiscard();
  };

  if (isLoadingPlan) {
    return <PlanFormSkeleton />;
  }

  if (!originalPlan) {
    return (
      <main className="flex-1 pt-2 sm:pt-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">Plan not found</div>
          <button
            onClick={() => router.push("/subscription-plans")}
            className="text-[#7B21BA] hover:text-[#8B31CA] underline"
          >
            Back to Plans
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      <BackTo title={'Edit Plan'} onClick={handleBackToPlans} />

      <PlanForm
        type="edit"
        onAction={handleEditPlan}
        onDiscard={handleDiscard}
        originalPlan={originalPlan}
      />
    </main>
  );
};

export default EditPlan;
