import React, { FormEvent, useEffect, useState } from 'react';
import { Button } from '@nlc-ai/web-ui';
import { User, Mail, Phone, Building, Globe, MapPin, FileText, Save } from "lucide-react";
import { CreateCoach, ExtendedCoach } from "@nlc-ai/sdk-users";

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

interface CoachFormProps {
  onDiscard: () => void;
  onSave: (formData: CreateCoach) => void;
  coach?: ExtendedCoach;
}

const initialFormData: CreateCoach = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  websiteUrl: '',
  timezone: '',
  bio: '',
};

export const CoachForm: React.FC<CoachFormProps> = ({
                                                      onDiscard,
                                                      onSave,
                                                      coach,
                                                    }) => {
  const [formData, setFormData] = useState<CreateCoach>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (coach) {
      setFormData({
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
        phone: coach.phone || '',
        businessName: coach.businessName || '',
        websiteUrl: coach.websiteUrl || '',
        timezone: coach.timezone || '',
        bio: coach.bio || '',
      });
    }
  }, [coach]);

  const handleInputChange = (field: keyof CreateCoach, value: string) => {
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

    if (formData.websiteUrl && !formData.websiteUrl.includes('.')) {
      newErrors.websiteUrl = 'Please enter a valid URL';
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
      setErrors({ submit: error.message || 'Failed to save coach' });
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 bg-background border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.firstName ? 'border-red-500' : 'border-[#3A3A3A]'
                }`}
                placeholder="Enter first name"
                disabled={isLoading}
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
                className={`w-full px-4 py-3 bg-background border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.lastName ? 'border-red-500' : 'border-[#3A3A3A]'
                }`}
                placeholder="Enter last name"
                disabled={isLoading}
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

        {/* Business Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Business Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter business name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.websiteUrl ? 'border-red-500' : 'border-[#3A3A3A]'
                  }`}
                  placeholder="example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.websiteUrl && <p className="text-red-400 text-sm mt-1">{errors.websiteUrl}</p>}
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Timezone</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <select
                value={formData.timezone || ''}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading}
              >
                <option value="">Select timezone</option>
                {timezoneOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Bio & Additional Information</h3>
          </div>

          <textarea
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            placeholder="Enter a brief bio or description of coaching expertise..."
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
              {coach ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {coach ? 'Update Coach' : 'Create Coach'}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};
