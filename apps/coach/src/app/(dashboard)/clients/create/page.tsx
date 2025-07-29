'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientForm } from "@/lib/components/clients/client-form";
import { clientsAPI } from "@nlc-ai/api-client";
import { CreateClient, ClientFormErrors } from "@nlc-ai/types";
import { BackTo } from "@nlc-ai/shared";
import { Sparkles } from "lucide-react";

const CreateNewClient = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const [formData, setFormData] = useState<CreateClient>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    source: "",
    tags: [],
  });

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: ClientFormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev: CreateClient) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field as keyof ClientFormErrors]) {
      setErrors((prev: ClientFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateClient = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: CreateClient = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined,
        source: formData.source?.trim() || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
      };

      await clientsAPI.createClient(requestData);

      // Redirect to clients page with success message
      router.push("/clients?success=Client created successfully");
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ email: "A client with this email already exists" });
      } else {
        setErrors({ general: error.message || "Failed to create client" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    const hasChanges = Object.values(formData).some((value: any) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value.trim() !== "";
    });

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

    router.push("/clients");
  };

  const handleBackToClients = () => {
    handleDiscard();
  };

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      {/* Absolute background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-1/4 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-1/4 -top-20 opacity-30 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        <div className="absolute w-56 h-56 right-12 bottom-1/4 opacity-25 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <BackTo title={'Create New Client'} onClick={handleBackToClients} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6">
                <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  <ClientForm
                    type="create"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    onAction={handleCreateClient}
                    onDiscard={handleDiscard}
                    isLoading={isLoading}
                    errors={errors}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client Benefits Sidebar */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Client Benefits</h3>
                      <p className="text-[#A0A0A0] text-sm">What you can track</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                      <h4 className="text-white font-medium mb-2">Progress Tracking</h4>
                      <p className="text-[#A0A0A0] text-sm mb-4">Monitor their journey and achievements over time</p>

                      <div className="space-y-2">
                        <div className="text-[#A0A0A0] text-xs font-medium mb-2">TRACK:</div>
                        {[
                          'Course enrollments & progress',
                          'Email interactions & engagement',
                          'Meeting schedules & outcomes',
                          'Custom notes & milestones'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-[#0A0A0A] rounded-lg">
                            <div className="w-6 h-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full flex items-center justify-center text-xs text-violet-400 font-medium">
                              {index + 1}
                            </div>
                            <span className="text-white text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-400 text-sm font-medium">Smart Organization</span>
                      </div>
                      <p className="text-[#A0A0A0] text-xs">
                        Use tags to organize clients by program type, priority level, or any custom categories that work for your coaching business.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">AI Email Assistant</span>
                      </div>
                      <p className="text-[#A0A0A0] text-xs">
                        Get AI-powered email response suggestions based on client interactions and coaching context.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateNewClient;
