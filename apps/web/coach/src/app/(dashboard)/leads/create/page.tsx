'use client'

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {LeadForm} from "@/lib/components/leads/lead-form";
import {sdkClient} from "@/lib";
import {CreateLead, LeadFormData, LeadFormErrors, LeadStatus} from "@nlc-ai/sdk-leads";
import {BackTo} from "@nlc-ai/web-shared";
import {Sparkles} from "lucide-react";

const CreateNewLead = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LeadFormErrors>({});

  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: LeadStatus.CONTACTED,
    meetingDate: "",
    meetingTime: "",
    notes: "",
  });

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: LeadFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field as keyof LeadFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateLead = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: CreateLead = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        source: formData.source?.trim() || undefined,
        status: formData.status as any,
        meetingDate: formData.meetingDate || undefined,
        meetingTime: formData.meetingTime || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      await sdkClient.leads.createLead(requestData);

      // Redirect to leads page with success message
      router.push("/leads?success=created");
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ email: "A lead with this email already exists" });
      } else {
        setErrors({ general: error.message || "Failed to create lead" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    const hasChanges = Object.values(formData).some((value) => {
      return value && value.trim() !== "";
    });

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

    router.push("/leads");
  };

  const handleBackToLeads = () => {
    handleDiscard();
  };

  const getStatusAutomation = (status: string) => {
    const automations = {
      contacted: {
        title: 'Welcome & Nurture Sequence',
        description: 'Sends welcome email, value content, and gentle follow-ups to build trust',
        emails: ['Welcome email', 'Value guide', '3-day follow-up', 'Case study']
      },
      scheduled: {
        title: 'Meeting Preparation Sequence',
        description: 'Confirms meeting, sends preparation materials, and reminder notifications',
        emails: ['Meeting confirmation', 'Prep materials', '24h reminder', '1h reminder']
      },
      converted: {
        title: 'Onboarding & Success Sequence',
        description: 'Celebrates conversion, provides onboarding, and ensures successful start',
        emails: ['Welcome aboard', 'Onboarding guide', 'First week check-in', 'Success tips']
      },
      unresponsive: {
        title: 'Re-engagement & Recovery Sequence',
        description: 'Attempts to re-engage with value offers and alternative communication',
        emails: ['Check-in email', 'Value offer', 'Different approach', 'Final attempt']
      }
    };
    return automations[status as keyof typeof automations] || automations.contacted;
  };

  const currentAutomation = getStatusAutomation(formData.status);

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      {/* Absolute background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-1/4 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-1/4 -top-20 opacity-30 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        <div className="absolute w-56 h-56 right-12 bottom-1/4 opacity-25 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <BackTo title={'Create New Lead'} onClick={handleBackToLeads} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <LeadForm
              type="create"
              formData={formData}
              handleInputChange={handleInputChange}
              onAction={handleCreateLead}
              onDiscard={handleDiscard}
              isLoading={isLoading}
              errors={errors}
            />
          </div>

          {/* Automation Preview Sidebar */}
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
                      <h3 className="text-lg font-semibold text-white">Smart Automation</h3>
                      <p className="text-[#A0A0A0] text-sm">AI-powered email sequences</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                      <h4 className="text-white font-medium mb-2">{currentAutomation.title}</h4>
                      <p className="text-[#A0A0A0] text-sm mb-4">{currentAutomation.description}</p>

                      <div className="space-y-2">
                        <div className="text-[#A0A0A0] text-xs font-medium mb-2">AUTOMATED EMAILS:</div>
                        {currentAutomation.emails.map((email, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-[#0A0A0A] rounded-lg">
                            <div className="w-6 h-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full flex items-center justify-center text-xs text-violet-400 font-medium">
                              {index + 1}
                            </div>
                            <span className="text-white text-sm">{email}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-400 text-sm font-medium">Auto-Trigger Enabled</span>
                      </div>
                      <p className="text-[#A0A0A0] text-xs">
                        Email sequence will automatically start when this lead is created with the selected status.
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

export default CreateNewLead;
