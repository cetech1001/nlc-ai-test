'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nlc-ai/ui';
import { ArrowLeft, Save, User, Mail, Phone, Tag, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { clientsAPI } from '@nlc-ai/api-client';
import { UpdateClient, ClientWithDetails } from "@nlc-ai/types";
import {undefined} from "zod";

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-600/20 text-gray-400 border-gray-600/30' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
];

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

const EditClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const clientID = searchParams.get('clientID');

  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [formData, setFormData] = useState<UpdateClient>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    source: '',
    // status: 'active',
    tags: [],
  });
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showCommonTags, setShowCommonTags] = useState(false);

  useEffect(() => {
    (() => fetchClient())();
  }, [clientID]);

  const fetchClient = async () => {
    try {
      if (!clientID) {
        setErrors({ clientID: "No Client ID provided" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const clientData = await clientsAPI.getClient(clientID);
      setClient(clientData);
      setOriginalStatus(clientData.status);

      setFormData({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone || '',
        avatarUrl: clientData.avatarUrl || '',
        source: clientData.source || '',
        status: clientData.status || 'active',
        tags: clientData.tags || [],
      });
    } catch (error: any) {
      setErrors({ fetch: error.message || 'Failed to load client' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateClient, value: string | string[]) => {
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

    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
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
      const submitData: any = {
        ...formData,
        phone: formData.phone || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        source: formData.source || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
        status: undefined,
      };

      await clientsAPI.updateClient(clientID || '', submitData);
      router.push('/clients?success=updated');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to update client' });
    } finally {
      setIsSaving(false);
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
          <h1 className="text-3xl font-bold text-white">Edit Client</h1>
          <p className="text-[#A0A0A0] mt-1">
            Update client information and manage their profile
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
                <div className="p-4 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Status Change Detected</h4>
                      <p className="text-[#A0A0A0] text-sm mb-3">
                        Changing client status from <span className="text-white font-medium">{originalStatus}</span> to{' '}
                        <span className="text-white font-medium">{formData.status}</span>
                      </p>
                      <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-medium mb-1">⚡ Note:</p>
                        <p className="text-[#A0A0A0] text-sm">
                          This may affect their access to courses and email communications.
                        </p>
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

              {/* Client Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Client Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-white text-sm font-medium mb-2">Client Status</label>
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
                      Update Client
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Client Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client Stats */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
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
                        {client?.coursesBought || 0}
                      </div>
                      <div className="text-[#A0A0A0] text-xs">Courses Bought</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {client?.coursesCompleted || 0}
                      </div>
                      <div className="text-[#A0A0A0] text-xs">Completed</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                  <div className="text-[#A0A0A0] text-xs font-medium mb-2">MEMBER SINCE</div>
                  <div className="text-white text-sm">
                    {client && new Date(client.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {client?.lastInteractionAt && (
                  <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                    <div className="text-[#A0A0A0] text-xs font-medium mb-2">LAST INTERACTION</div>
                    <div className="text-white text-sm">
                      {new Date(client.lastInteractionAt).toLocaleDateString('en-US', {
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
                    <span className="text-blue-400 text-sm font-medium">
                      {showStatusChange ? 'Status Will Update' : 'Currently Active'}
                    </span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs">
                    {showStatusChange
                      ? 'Client status will change when you save these updates.'
                      : 'This client is actively engaged in your programs.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-white text-sm">Joined Program</div>
                    <div className="text-[#A0A0A0] text-xs">
                      {client && new Date(client.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {client?.courseEnrollments && client.courseEnrollments.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white text-sm">Course Enrollment</div>
                      <div className="text-[#A0A0A0] text-xs">
                        Latest: {client.courseEnrollments[0]?.course?.title || 'Course enrolled'}
                      </div>
                    </div>
                  </div>
                )}

                {client?.emailThreadsCount && client.emailThreadsCount > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-white text-sm">Email Communication</div>
                      <div className="text-[#A0A0A0] text-xs">
                        {client.emailThreadsCount} active thread{client.emailThreadsCount > 1 ? 's' : ''}
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

export default EditClient;
