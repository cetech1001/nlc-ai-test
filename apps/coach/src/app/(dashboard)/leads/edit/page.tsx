'use client'

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeadForm } from "@/lib/components/leads/lead-form";
import { LeadFormSkeleton } from "@/lib";
import { leadsAPI } from "@nlc-ai/api-client";
import { Lead, LeadFormData, LeadFormErrors } from "@nlc-ai/types";
import { BackTo } from "@nlc-ai/shared";
import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

const EditLead = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadID = searchParams.get('leadID');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLead, setIsLoadingLead] = useState(true);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [originalLead, setOriginalLead] = useState<Lead | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [showStatusChange, setShowStatusChange] = useState(false);

  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "",
    meetingDate: "",
    meetingTime: "",
    notes: "",
  });

  useEffect(() => {
    if (!leadID) {
      router.push("/leads");
      return;
    }

    (() => loadLead(leadID))();
  }, [leadID, router]);

  const loadLead = async (id: string) => {
    try {
      setIsLoadingLead(true);
      const lead = await leadsAPI.getLead(id);
      setOriginalLead(lead);
      setOriginalStatus(lead.status);

      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        source: lead.source || "",
        status: lead.status,
        meetingDate: lead.meetingDate ? lead.meetingDate.toISOString().split('T')[0] : "",
        meetingTime: lead.meetingTime || "",
        notes: lead.notes || "",
      });
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to load lead" });
    } finally {
      setIsLoadingLead(false);
    }
  };

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

    // Show status change warning if status changed
    if (field === 'status' && value !== originalStatus) {
      setShowStatusChange(true);
    } else if (field === 'status' && value === originalStatus) {
      setShowStatusChange(false);
    }

    // Clear field error when user starts typing
    if (errors[field as keyof LeadFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEditLead = async () => {
    if (!validateForm() || !leadID) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData = {
        ...formData,
        meetingDate: formData.meetingDate || undefined,
        meetingTime: formData.meetingTime || undefined,
      };

      await leadsAPI.updateLead(leadID, requestData);

      router.push("/leads?success=Lead updated successfully");
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ email: "A lead with this email already exists" });
      } else {
        setErrors({ general: error.message || "Failed to update lead" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    // Check if form has changes
    const hasChanges = originalLead && (
      formData.name !== originalLead.name ||
      formData.email !== originalLead.email ||
      formData.phone !== (originalLead.phone || "") ||
      formData.source !== (originalLead.source || "") ||
      formData.status !== originalLead.status ||
      formData.meetingDate !== (originalLead.meetingDate ? originalLead.meetingDate.toISOString().split('T')[0] : "") ||
      formData.meetingTime !== (originalLead.meetingTime || "") ||
      formData.notes !== (originalLead.notes || "")
    );

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
        emails: ['Welcome email', 'Value guide', '3-day follow-up', 'Case study'],
        triggerNote: 'Will restart nurture sequence from beginning'
      },
      scheduled: {
        title: 'Meeting Preparation Sequence',
        description: 'Confirms meeting, sends preparation materials, and reminder notifications',
        emails: ['Meeting confirmation', 'Prep materials', '24h reminder', '1h reminder'],
        triggerNote: 'Will send meeting confirmation immediately'
      },
      converted: {
        title: 'Onboarding & Success Sequence',
        description: 'Celebrates conversion, provides onboarding, and ensures successful start',
        emails: ['Welcome aboard', 'Onboarding guide', 'First week check-in', 'Success tips'],
        triggerNote: 'Will send congratulations and onboarding sequence'
      },
      unresponsive: {
        title: 'Re-engagement & Recovery Sequence',
        description: 'Attempts to re-engage with value offers and alternative communication',
        emails: ['Check-in email', 'Value offer', 'Different approach', 'Final attempt'],
        triggerNote: 'Will attempt re-engagement over 2-week period'
      }
    };
    return automations[status as keyof typeof automations] || automations.contacted;
  };

  const currentAutomation = getStatusAutomation(formData.status);
  const originalAutomation = getStatusAutomation(originalStatus);

  if (isLoadingLead) {
    return <LeadFormSkeleton title="Edit Lead" onBack={handleBackToLeads} />;
  }

  if (!originalLead) {
    return (
      <main className="flex-1 pt-2 sm:pt-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">Lead not found</div>
          <button
            onClick={() => router.push("/leads")}
            className="text-[#7B21BA] hover:text-[#8B31CA] underline"
          >
            Back to Leads
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
        <BackTo title={'Edit Lead'} onClick={handleBackToLeads} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6">
                <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  {/* Status Change Warning */}
                  {showStatusChange && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-medium mb-1">Status Change Detected</h4>
                          <p className="text-[#A0A0A0] text-sm mb-3">
                            Changing status from <span className="text-white font-medium">{originalAutomation.title}</span> to{' '}
                            <span className="text-white font-medium">{currentAutomation.title}</span>
                          </p>
                          <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
                            <p className="text-yellow-400 text-sm font-medium mb-1">⚡ Auto-Trigger:</p>
                            <p className="text-[#A0A0A0] text-sm">{currentAutomation.triggerNote}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <LeadForm
                    type="edit"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    onAction={handleEditLead}
                    onDiscard={handleDiscard}
                    isLoading={isLoading}
                    errors={errors}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Automation */}
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
                      <h3 className="text-lg font-semibold text-white">Active Automation</h3>
                      <p className="text-[#A0A0A0] text-sm">Current email sequence</p>
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
                        <span className="text-blue-400 text-sm font-medium">
                          {showStatusChange ? 'Will Update on Save' : 'Currently Active'}
                        </span>
                      </div>
                      <p className="text-[#A0A0A0] text-xs">
                        {showStatusChange
                          ? 'Email sequence will change when you save these updates.'
                          : 'This email sequence is currently running for this lead.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Timeline */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="absolute w-56 h-56 right-12 -top-20 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-white mb-4">Lead Timeline</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-white text-sm">Lead Created</div>
                        <div className="text-[#A0A0A0] text-xs">
                          {originalLead && new Date(originalLead.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {originalLead?.lastContactedAt && (
                      <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-white text-sm">Last Contacted</div>
                          <div className="text-[#A0A0A0] text-xs">
                            {new Date(originalLead.lastContactedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {originalLead?.convertedAt && (
                      <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-white text-sm">Converted</div>
                          <div className="text-[#A0A0A0] text-xs">
                            {new Date(originalLead.convertedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
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

export default EditLead;
