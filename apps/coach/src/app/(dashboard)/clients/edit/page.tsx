'use client'

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientForm } from "@/lib/components/clients/client-form";
import { ClientFormSkeleton } from "@/lib";
import { clientsAPI } from "@nlc-ai/api-client";
import { ClientWithDetails, UpdateClient, CreateClient, ClientFormErrors } from "@nlc-ai/types";
import { BackTo } from "@nlc-ai/shared";
import { User, CheckCircle } from "lucide-react";

const EditClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientID = searchParams.get('clientID');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [originalClient, setOriginalClient] = useState<ClientWithDetails | null>(null);

  const [formData, setFormData] = useState<CreateClient>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    source: "",
    tags: [],
  });

  useEffect(() => {
    if (!clientID) {
      router.push("/clients");
      return;
    }

    (() => loadClient(clientID))();
  }, [clientID, router]);

  const loadClient = async (id: string) => {
    try {
      setIsLoadingClient(true);
      const client = await clientsAPI.getClient(id);
      setOriginalClient(client);

      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || "",
        avatarUrl: client.avatarUrl || "",
        source: client.source || "",
        tags: client.tags || [],
      });
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to load client" });
    } finally {
      setIsLoadingClient(false);
    }
  };

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
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field as keyof ClientFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEditClient = async () => {
    if (!validateForm() || !clientID) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: UpdateClient = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined,
        source: formData.source?.trim() || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
      };

      await clientsAPI.updateClient(clientID, requestData);

      router.push("/clients?success=Client updated successfully");
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ email: "A client with this email already exists" });
      } else {
        setErrors({ general: error.message || "Failed to update client" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    // Check if form has changes
    const hasChanges = originalClient && (
      formData.firstName !== originalClient.firstName ||
      formData.lastName !== originalClient.lastName ||
      formData.email !== originalClient.email ||
      formData.phone !== (originalClient.phone || "") ||
      formData.avatarUrl !== (originalClient.avatarUrl || "") ||
      formData.source !== (originalClient.source || "") ||
      JSON.stringify(formData.tags) !== JSON.stringify(originalClient.tags || [])
    );

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

    router.push("/clients");
  };

  const handleBackToClients = () => {
    handleDiscard();
  };

  if (isLoadingClient) {
    return <ClientFormSkeleton title="Edit Client" onBack={handleBackToClients} />;
  }

  if (!originalClient) {
    return (
      <main className="flex-1 pt-2 sm:pt-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">Client not found</div>
          <button
            onClick={() => router.push("/clients")}
            className="text-[#7B21BA] hover:text-[#8B31CA] underline"
          >
            Back to Clients
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      {/* Absolute background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-1/4 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-1/4 -top-20 opacity-30 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        <div className="absolute w-56 h-56 right-12 bottom-1/4 opacity-25 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <BackTo title={'Edit Client'} onClick={handleBackToClients} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6">
                <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  <ClientForm
                    type="edit"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    onAction={handleEditClient}
                    onDiscard={handleDiscard}
                    isLoading={isLoading}
                    errors={errors}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Stats */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Client Summary</h3>
                      <p className="text-[#A0A0A0] text-sm">Current progress & stats</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {originalClient?.coursesBought || 0}
                          </div>
                          <div className="text-[#A0A0A0] text-xs">Courses Bought</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {originalClient?.coursesCompleted || 0}
                          </div>
                          <div className="text-[#A0A0A0] text-xs">Completed</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                      <div className="text-[#A0A0A0] text-xs font-medium mb-2">MEMBER SINCE</div>
                      <div className="text-white text-sm">
                        {originalClient && new Date(originalClient.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {originalClient?.lastInteractionAt && (
                      <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                        <div className="text-[#A0A0A0] text-xs font-medium mb-2">LAST INTERACTION</div>
                        <div className="text-white text-sm">
                          {new Date(originalClient.lastInteractionAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-400 text-sm font-medium">Currently Active</span>
                      </div>
                      <p className="text-[#A0A0A0] text-xs">
                        This client is actively engaged in your programs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="absolute w-56 h-56 right-12 -top-20 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-white text-sm">Joined Program</div>
                        <div className="text-[#A0A0A0] text-xs">
                          {originalClient && new Date(originalClient.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {originalClient?.courseEnrollments && originalClient.courseEnrollments.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-white text-sm">Course Enrollment</div>
                          <div className="text-[#A0A0A0] text-xs">
                            Latest: {originalClient.courseEnrollments[0]?.course?.title || 'Course enrolled'}
                          </div>
                        </div>
                      </div>
                    )}

                    {originalClient?.emailThreadsCount && originalClient.emailThreadsCount > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-white text-sm">Email Communication</div>
                          <div className="text-[#A0A0A0] text-xs">
                            {originalClient.emailThreadsCount} active thread{originalClient.emailThreadsCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    )}
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

export default EditClient;
