'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanForm } from "@/lib/components/plans/plan-form";
import { plansAPI } from "@nlc-ai/api-client";
import {CreatePlanRequest, PlanFormData, PlanFormErrors} from "@nlc-ai/types";
import { BackTo } from "@nlc-ai/shared";

const CreateNewPlan = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PlanFormErrors>({});

  const [formData, setFormData] = useState<PlanFormData>({
    planTitle: "",
    color: "",
    description: "",
    monthlyPrice: "",
    annualPrice: "",
    maxClients: "",
    maxAiAgents: "",
    features: [],
    isActive: true,
  });

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: PlanFormErrors = {};

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
    if (errors[field as keyof PlanFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: CreatePlanRequest = {
        name: formData.planTitle.trim(),
        color: formData.color,
        description: formData.description.trim() || undefined,
        monthlyPrice: Math.round(parseFloat(formData.monthlyPrice) * 100), // Convert to cents
        annualPrice: Math.round(parseFloat(formData.annualPrice) * 100), // Convert to cents
        maxClients: formData.maxClients.trim() ? parseInt(formData.maxClients) : undefined,
        maxAiAgents: formData.maxAiAgents.trim() ? parseInt(formData.maxAiAgents) : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        isActive: formData.isActive,
      };

      await plansAPI.createPlan(requestData);

      // Redirect to plans page with success message
      router.push("/subscription-plans?success=Plan created successfully");
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ planTitle: "A plan with this name already exists" });
      } else {
        setErrors({ general: error.message || "Failed to create plan" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    const hasChanges = Object.values(formData).some((value, index) => {
      const initialValues = ["", "", "", "", "", "", [], true];
      return JSON.stringify(value) !== JSON.stringify(initialValues[index]);
    });

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

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
        formData={formData}
        handleInputChange={handleInputChange}
        onAction={handleCreatePlan}
        onDiscard={handleDiscard}
        isLoading={isLoading}
        errors={errors}
      />
    </main>
  );
};

export default CreateNewPlan;
