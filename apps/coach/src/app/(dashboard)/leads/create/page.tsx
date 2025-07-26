'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nlc-ai/ui';
import { ArrowLeft, Save, Calendar, User, Mail, Phone, MapPin, FileText, Sparkles } from 'lucide-react';
import { leadsAPI } from '@nlc-ai/api-client';
import { CreateLeadFormData } from '@nlc-ai/types';

const initialFormData: CreateLeadFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  source: '',
  status: 'contacted',
  meetingDate: '',
  meetingTime: '',
  notes: '',
};

const statusOptions = [
  { value: 'contacted', label: 'Not Converted', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  { value: 'converted', label: 'Converted', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
  { value: 'unresponsive', label: 'No Show', color: 'bg-red-600/20 text-red-400 border-red-600/30' },
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

const CreateLead = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateLeadFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateLeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        meetingDate: formData.meetingDate || undefined,
        meetingTime: formData.meetingTime || undefined,
      };

      await leadsAPI.createLead(submitData);
      router.push('/leads?success=created');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create lead' });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-white">Add New Lead</h1>
          <p className="text-[#A0A0A0] mt-1">Create a new lead and set up automated follow-up sequences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 space-y-8">
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
                    <label className="block text-white text-sm font-medium mb-2">Initial Status</label>
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
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Create Lead
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Automation Preview */}
        <div className="lg:col-span-1">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
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
  );
}

export default CreateLead;
