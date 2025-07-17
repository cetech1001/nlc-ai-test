'use client'

import { useState, useEffect } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { Button } from '@nlc-ai/ui';
import { ArrowLeft, Save, Calendar, User, Mail, Phone, MapPin, FileText, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { leadsAPI } from '@nlc-ai/api-client';
import {EditLeadFormData, Lead} from "@nlc-ai/types";

const statusOptions = [
  {
    value: 'contacted',
    label: 'Not Converted',
    color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    bgColor: 'from-yellow-600/10 to-orange-600/10 border-yellow-600/20'
  },
  {
    value: 'scheduled',
    label: 'Scheduled',
    color: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    bgColor: 'from-blue-600/10 to-cyan-600/10 border-blue-600/20'
  },
  {
    value: 'converted',
    label: 'Converted',
    color: 'bg-green-600/20 text-green-400 border-green-600/30',
    bgColor: 'from-green-600/10 to-emerald-600/10 border-green-600/20'
  },
  {
    value: 'unresponsive',
    label: 'No Show',
    color: 'bg-red-600/20 text-red-400 border-red-600/30',
    bgColor: 'from-red-600/10 to-pink-600/10 border-red-600/20'
  },
];

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'other', label: 'Other' },
];

const EditLead = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const leadID = searchParams.get('leadID');

  const [lead, setLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<EditLeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: '',
    status: '',
    meetingDate: '',
    meetingTime: '',
    notes: '',
  });
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusChange, setShowStatusChange] = useState(false);

  useEffect(() => {
    (() => fetchLead())();
  }, [leadID]);

  const fetchLead = async () => {
    try {
      if (!leadID) {
        setErrors({ leadID: "No Lead ID provided" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const leadData = await leadsAPI.getLead(leadID);
      setLead(leadData);
      setOriginalStatus(leadData.status);

      setFormData({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone || '',
        source: leadData.source || '',
        status: leadData.status,
        meetingDate: leadData.meetingDate ? leadData.meetingDate.toISOString().split('T')[0] : '',
        meetingTime: leadData.meetingTime || '',
        notes: leadData.notes || '',
      });
    } catch (error: any) {
      setErrors({ fetch: error.message || 'Failed to load lead' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditLeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Show status change warning if status changed
    if (field === 'status' && value !== originalStatus) {
      setShowStatusChange(true);
    } else if (field === 'status' && value === originalStatus) {
      setShowStatusChange(false);
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        meetingDate: formData.meetingDate || undefined,
        meetingTime: formData.meetingTime || undefined,
      };

      await leadsAPI.updateLead(leadID || '', submitData);
      router.push('/leads?success=updated');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to update lead' });
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-[#2A2A2A] rounded-2xl"></div>
            </div>
            <div className="h-96 bg-[#2A2A2A] rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">{errors.fetch}</div>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Lead</h1>
          <p className="text-[#A0A0A0] mt-1">
            Update lead information and manage automated sequences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 space-y-8">
              {/* Status Change Warning */}
              {showStatusChange && (
                <div className={`p-4 bg-gradient-to-br ${statusOptions.find(s => s.value === formData.status)?.bgColor} border rounded-xl`}>
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

              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        errors.firstName ? 'border-red-500' : 'border-[#3A3A3A]'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        errors.lastName ? 'border-red-500' : 'border-[#3A3A3A]'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                          errors.email ? 'border-red-500' : 'border-[#3A3A3A]'
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Lead Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Lead Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Select source</option>
                      {sourceOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Lead Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.status === 'scheduled' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Meeting Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="date"
                          value={formData.meetingDate}
                          onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Meeting Time</label>
                      <input
                        type="time"
                        value={formData.meetingTime}
                        onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Additional Notes</h3>
                </div>

                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  placeholder="Add any additional notes about this lead..."
                />
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Update Lead
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Automation Preview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Automation */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
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

          {/* Lead Timeline */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lead Timeline</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-white text-sm">Lead Created</div>
                    <div className="text-[#A0A0A0] text-xs">
                      {lead && new Date(lead.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {lead?.lastContactedAt && (
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white text-sm">Last Contacted</div>
                      <div className="text-[#A0A0A0] text-xs">
                        {new Date(lead.lastContactedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {lead?.convertedAt && (
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-white text-sm">Converted</div>
                      <div className="text-[#A0A0A0] text-xs">
                        {new Date(lead.convertedAt).toLocaleDateString('en-US', {
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
  );
}

export default EditLead;
