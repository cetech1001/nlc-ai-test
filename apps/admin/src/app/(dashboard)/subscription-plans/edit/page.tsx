'use client'

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanForm } from "@/app/(dashboard)/components/plan-form";
import { PlanFormSkeleton } from "@/lib/skeletons/plan-form.skeleton";
import { plansAPI, type UpdatePlanRequest, type Plan } from "@nlc-ai/api-client";

interface FormData {
  planTitle: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  maxClients: string;
  maxAiAgents: string;
  features: string[];
  isActive: boolean;
}

interface FormErrors {
  planTitle?: string;
  monthlyPrice?: string;
  annualPrice?: string;
  maxClients?: string;
  maxAiAgents?: string;
  features?: string;
  general?: string;
}

const EditPlan = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [originalPlan, setOriginalPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState<FormData>({
    planTitle: "",
    description: "",
    monthlyPrice: "",
    annualPrice: "",
    maxClients: "",
    maxAiAgents: "",
    features: [],
    isActive: true,
  });

  useEffect(() => {
    if (!planId) {
      router.push("/subscription-plans");
      return;
    }

    loadPlan(planId);
  }, [planId, router]);

  const loadPlan = async (id: string) => {
    try {
      setIsLoadingPlan(true);
      const plan = await plansAPI.getPlan(id);
      setOriginalPlan(plan);

      setFormData({
        planTitle: plan.name,
        description: plan.description || "",
        monthlyPrice: (plan.monthlyPrice / 100).toString(), // Convert from cents
        annualPrice: (plan.annualPrice / 100).toString(), // Convert from cents
        maxClients: plan.maxClients?.toString() || "",
        maxAiAgents: plan.maxAiAgents?.toString() || "",
        features: plan.features || [],
        isActive: plan.isActive,
      });
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to load plan" });
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Plan title validation
    if (!formData.planTitle.trim()) {
      newErrors.planTitle = "Plan title is required";
    } else if (formData.planTitle.trim().length < 2) {
      newErrors.planTitle = "Plan title must be at least 2 characters";
    }

    // Monthly price validation
    if (!formData.monthlyPrice.trim()) {
      newErrors.monthlyPrice = "Monthly price is required";
    } else {
      const price = parseFloat(formData.monthlyPrice);
      if (isNaN(price) || price < 0) {
        newErrors.monthlyPrice = "Monthly price must be a valid positive number";
      }
    }

    // Annual price validation
    if (!formData.annualPrice.trim()) {
      newErrors.annualPrice = "Annual price is required";
    } else {
      const price = parseFloat(formData.annualPrice);
      if (isNaN(price) || price < 0) {
        newErrors.annualPrice = "Annual price must be a valid positive number";
      }
    }

    // Max clients validation (optional)
    if (formData.maxClients.trim()) {
      const maxClients = parseInt(formData.maxClients);
      if (isNaN(maxClients) || maxClients < 0) {
        newErrors.maxClients = "Max clients must be a valid positive number";
      }
    }

    // Max AI agents validation (optional)
    if (formData.maxAiAgents.trim()) {
      const maxAgents = parseInt(formData.maxAiAgents);
      if (isNaN(maxAgents) || maxAgents < 0) {
        newErrors.maxAiAgents = "Max AI agents must be a valid positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEditPlan = async () => {
    if (!validateForm() || !planId) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: UpdatePlanRequest = {
        name: formData.planTitle.trim(),
        description: formData.description.trim() || undefined,
        monthlyPrice: Math.round(parseFloat(formData.monthlyPrice) * 100), // Convert to cents
        annualPrice: Math.round(parseFloat(formData.annualPrice) * 100), // Convert to cents
        maxClients: formData.maxClients.trim() ? parseInt(formData.maxClients) : undefined,
        maxAiAgents: formData.maxAiAgents.trim() ? parseInt(formData.maxAiAgents) : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        isActive: formData.isActive,
      };

      await plansAPI.updatePlan(planId, requestData);

      // Redirect to plans page with success message
      router.push("/subscription-plans?success=Plan updated successfully");
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ planTitle: "A plan with this name already exists" });
      } else {
        setErrors({ general: error.message || "Failed to update plan" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    // Check if form has changes
    const hasChanges = originalPlan && (
      formData.planTitle !== originalPlan.name ||
      formData.description !== (originalPlan.description || "") ||
      formData.monthlyPrice !== (originalPlan.monthlyPrice / 100).toString() ||
      formData.annualPrice !== (originalPlan.annualPrice / 100).toString() ||
      formData.maxClients !== (originalPlan.maxClients?.toString() || "") ||
      formData.maxAiAgents !== (originalPlan.maxAiAgents?.toString() || "") ||
      JSON.stringify(formData.features) !== JSON.stringify(originalPlan.features || []) ||
      formData.isActive !== originalPlan.isActive
    );

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

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
      <div className="mb-8">
        <button
          onClick={handleBackToPlans}
          disabled={isLoading}
          className="flex items-center gap-2 text-white hover:text-[#7B21BA] transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-2xl font-semibold">Edit Plan</span>
        </button>
      </div>

      <PlanForm
        type="edit"
        formData={formData}
        handleInputChange={handleInputChange}
        onAction={handleEditPlan}
        onDiscard={handleDiscard}
        isLoading={isLoading}
        errors={errors}
      />
    </main>
  );
};

export default EditPlan;
