'use client'

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {useRouter} from "next/navigation";
import {PlanForm} from "@/app/(dashboard)/components/plan-form";


const EditNewPlan = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    planTitle: "Enterprise",
    monthlyPrice: "2400",
    annualPrice: "2400",
    description: "",
    features: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditPlan = () => {
    console.log("Editing plan:", formData);
    router.push("/subscription-plans");
  };

  const handleDiscard = () => {
    router.push("/subscription-plans");
  };

  const handleBackToPlans = () => {
    router.push("/subscription-plans");
  };

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      <div className="mb-8">
        <button
          onClick={handleBackToPlans}
          className="flex items-center gap-2 text-white hover:text-[#7B21BA] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-2xl font-semibold">Edit Plan</span>
        </button>
      </div>

      <PlanForm type={"edit"} formData={formData}
                handleInputChange={handleInputChange}
                onAction={handleEditPlan}
                onDiscard={handleDiscard}/>
    </main>
  );
};

export default EditNewPlan;
