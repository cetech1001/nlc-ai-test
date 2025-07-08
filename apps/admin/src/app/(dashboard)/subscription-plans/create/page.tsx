'use client'

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlanForm } from "@/app/(dashboard)/components/plan-form";
import { plansAPI, type CreatePlanRequest } from "@nlc-ai/api-client";

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

const CreateNewPlan = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleCreatePlan = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: CreatePlanRequest = {
        name: formData.planTitle.trim(),
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
      <div className="mb-8">
        <button
          onClick={handleBackToPlans}
          disabled={isLoading}
          className="flex items-center gap-2 text-white hover:text-[#7B21BA] transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-2xl font-semibold">Create New Plan</span>
        </button>
      </div>

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
