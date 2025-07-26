'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nlc-ai/ui';
import { ArrowLeft, Save, User, Mail, Phone, Tag, Globe, Sparkles, Users } from 'lucide-react';
import { clientsAPI } from '@nlc-ai/api-client';
import type { CreateClient } from '@nlc-ai/types';

const initialFormData: CreateClient = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  source: '',
  tags: [],
};

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'course_signup', label: 'Course Signup' },
  { value: 'consultation', label: 'Free Consultation' },
  { value: 'other', label: 'Other' },
];

const commonTags = [
  'VIP Client',
  'High Priority',
  'Long-term',
  'New Client',
  'Returning Client',
  'Group Program',
  '1-on-1 Coaching',
  'Fitness',
  'Nutrition',
  'Mindset',
  'Business',
  'Life Coaching',
  'Wellness',
  'Weight Loss',
  'Muscle Building',
];

const CreateClient = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateClient>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [showCommonTags, setShowCommonTags] = useState(false);

  const handleInputChange = (field: keyof CreateClient, value: string | string[]) => {
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
        phone: formData.phone || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        source: formData.source || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
      };

      await clientsAPI.createClient(submitData);
      router.push('/clients?success=created');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create client' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      const newTags = [...(formData.tags || []), tag.trim()];
      handleInputChange('tags', newTags);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleInputChange('tags', newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Add New Client</h1>
          <p className="text-[#A0A0A0] mt-1">Create a new client profile and start tracking their journey</p>
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

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Avatar URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Client Details</h3>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Client Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">How did they find you?</option>
                    {sourceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Tags</label>
                  <div className="space-y-3">
                    {/* Tag Input */}
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Add a tag and press Enter"
                      />
                    </div>

                    {/* Selected Tags */}
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-violet-600/20 text-violet-300 border border-violet-600/30 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-violet-400 hover:text-violet-200 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Common Tags Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowCommonTags(!showCommonTags)}
                      className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
                    >
                      {showCommonTags ? 'Hide' : 'Show'} common tags
                    </button>

                    {/* Common Tags */}
                    {showCommonTags && (
                      <div className="flex flex-wrap gap-2">
                        {commonTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddTag(tag)}
                            disabled={formData.tags?.includes(tag)}
                            className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                              formData.tags?.includes(tag)
                                ? 'bg-[#3A3A3A] text-[#666] border-[#3A3A3A] cursor-not-allowed'
                                : 'bg-[#2A2A2A] text-[#A0A0A0] border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white hover:border-violet-500'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                      Create Client
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Client Benefits */}
        <div className="lg:col-span-1">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
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
  );
}

export default CreateClient;
