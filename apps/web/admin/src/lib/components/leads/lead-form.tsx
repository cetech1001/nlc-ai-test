import React, {Dispatch, FormEvent, SetStateAction, useEffect, useState} from 'react';
import { Button } from '@nlc-ai/web-ui';
import {Calendar, User, Mail, Phone, MapPin, FileText, Save} from "lucide-react";
import {Lead, LeadFormData, LeadStatus} from "@nlc-ai/sdk-leads";

const statusOptions = [
  { value: LeadStatus.CONTACTED, label: 'Not Converted', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
  { value: LeadStatus.SCHEDULED, label: 'Scheduled', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  { value: LeadStatus.CONVERTED, label: 'Converted', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
  { value: LeadStatus.UNRESPONSIVE, label: 'No Show', color: 'bg-red-600/20 text-red-400 border-red-600/30' },
];

const sourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Email Campaign', label: 'Email Campaign' },
  { value: 'Cold Outreach', label: 'Cold Outreach' },
  { value: 'Networking', label: 'Networking Event' },
  { value: 'Advertisement', label: 'Advertisement' },
  { value: 'Other', label: 'Other' },
];

interface LeadFormProps {
  onDiscard: () => void;
  onSave: (formData: LeadFormData) => void;
  setStatus: Dispatch<SetStateAction<LeadStatus>>;
  lead?: Lead;
  setShowStatusChange?: Dispatch<SetStateAction<boolean>>;
}

const initialFormData: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  source: '',
  status: LeadStatus.CONTACTED,
  meetingDate: '',
  meetingTime: '',
  notes: '',
};

export const LeadForm: React.FC<LeadFormProps> = ({
  onDiscard,
  onSave,
                                                    setStatus,
  lead,
  setShowStatusChange
}) => {
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setStatus(formData.status);
  }, [formData.status]);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        source: lead.source || '',
        status: lead.status,
        meetingDate: lead.meetingDate ? new Date(lead.meetingDate).toISOString().split('T')[0] : '',
        meetingTime: lead.meetingTime || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'status' && value !== lead?.status) {
      setShowStatusChange?.(true);
    } else if (field === 'status' && value === lead?.status) {
      setShowStatusChange?.(false);
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      onSave(formData);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create lead' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-background border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.name ? 'border-red-500' : 'border-[#3A3A3A]'
                }`}
                placeholder="Enter full name"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
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
                  className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.email ? 'border-red-500' : 'border-[#3A3A3A]'
                  }`}
                  placeholder="Enter email address"
                  disabled={isLoading}
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
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Enter phone number"
                  disabled={isLoading}
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
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading}
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
                className="w-full px-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.status === LeadStatus.SCHEDULED && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Meeting Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <input
                    type="date"
                    value={formData.meetingDate || ''}
                    onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Meeting Time</label>
                <input
                  type="time"
                  value={formData.meetingTime || ''}
                  onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isLoading}
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
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            placeholder="Add any additional notes about this lead..."
            disabled={isLoading}
          />
        </div>
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
          onClick={onDiscard}
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
  );
};
