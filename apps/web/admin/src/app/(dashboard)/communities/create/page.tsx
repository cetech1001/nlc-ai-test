'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Lock, Globe, UserCheck, Save, X, /*Palette*/ } from 'lucide-react';
import { BackTo } from "@nlc-ai/web-shared";
import { Button, Input, Textarea } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import { sdkClient } from "@/lib";
import { CommunityType, CommunityVisibility } from '@nlc-ai/sdk-community';

interface CreateCommunityForm {
  name: string;
  description: string;
  type: CommunityType;
  visibility: CommunityVisibility;
  coachID: string;
  courseID: string;
  avatarUrl: string;
  bannerUrl: string;
  settings: {
    allowMemberPosts: boolean;
    requireApproval: boolean;
    allowFileUploads: boolean;
    maxPostLength: number;
    allowPolls: boolean;
    allowEvents: boolean;
    moderationLevel: string;
  };
}

interface FormErrors {
  name?: string;
  description?: string;
  coachID?: string;
  courseID?: string;
  maxPostLength?: string;
  general?: string;
}

const COMMUNITY_COLORS = [
  { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#10B981', label: 'Emerald', class: 'bg-emerald-500' },
  { value: '#F59E0B', label: 'Amber', class: 'bg-amber-500' },
  { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
  { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#8B5CF6', label: 'Violet', class: 'bg-violet-500' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
];

const AdminCreateCommunityPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [form, setForm] = useState<CreateCommunityForm>({
    name: '',
    description: '',
    type: CommunityType.PRIVATE,
    visibility: CommunityVisibility.PRIVATE,
    coachID: '',
    courseID: '',
    avatarUrl: '',
    bannerUrl: '',
    settings: {
      allowMemberPosts: true,
      requireApproval: false,
      allowFileUploads: true,
      maxPostLength: 5000,
      allowPolls: true,
      allowEvents: false,
      moderationLevel: 'moderate',
    },
  });

  const communityTypes = [
    {
      value: CommunityType.PRIVATE,
      label: 'Private Community',
      icon: Lock,
      description: 'A private community for specific members'
    },
    {
      value: CommunityType.COACH_CLIENT,
      label: 'Coach-Client',
      icon: Users,
      description: 'Community for a coach and their clients'
    },
    {
      value: CommunityType.COACH_TO_COACH,
      label: 'Coach-to-Coach',
      icon: UserCheck,
      description: 'Professional network for coaches'
    },
    {
      value: CommunityType.COURSE,
      label: 'Course Community',
      icon: Users,
      description: 'Community tied to a specific course'
    },
  ];

  const visibilityOptions = [
    {
      value: CommunityVisibility.PRIVATE,
      label: 'Private',
      icon: Lock,
      description: 'Only members can see and join'
    },
    {
      value: CommunityVisibility.PUBLIC,
      label: 'Public',
      icon: Globe,
      description: 'Anyone can see and join'
    },
    {
      value: CommunityVisibility.INVITE_ONLY,
      label: 'Invite Only',
      icon: UserCheck,
      description: 'Members must be invited'
    },
  ];

  const moderationLevels = [
    { value: 'strict', label: 'Strict', description: 'All posts require approval' },
    { value: 'moderate', label: 'Moderate', description: 'Some posts may require approval' },
    { value: 'relaxed', label: 'Relaxed', description: 'Posts are published immediately' },
  ];

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (form.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (form.type === CommunityType.COACH_CLIENT && !form.coachID.trim()) {
      newErrors.coachID = 'Coach ID is required for coach-client communities';
    }

    if (form.type === CommunityType.COURSE && !form.courseID.trim()) {
      newErrors.courseID = 'Course ID is required for course communities';
    }

    if (form.settings.maxPostLength < 100 || form.settings.maxPostLength > 10000) {
      newErrors.maxPostLength = 'Max post length must be between 100 and 10,000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      // Convert form to API request format
      const createRequest = {
        name: form.name,
        description: form.description,
        type: form.type,
        visibility: form.visibility,
        coachID: form.coachID || undefined,
        courseID: form.courseID || undefined,
        avatarUrl: form.avatarUrl || undefined,
        bannerUrl: form.bannerUrl || undefined,
        settings: form.settings,
      };

      await sdkClient.community.createCommunityAsAdmin(createRequest);

      toast.success('Community created successfully!');
      router.push('/communities?success=created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/communities');
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is updated
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const updateSettings = (setting: string, value: any) => {
    setForm(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value,
      },
    }));
  };

  const selectedColor = COMMUNITY_COLORS.find(color => color.value === form.avatarUrl) || COMMUNITY_COLORS[0];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo title="Create Community" onClick={handleCancel} />

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-56 h-56 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-stone-300 text-sm font-medium mb-2">
                    Community Name *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="Enter community name..."
                    className={`bg-neutral-800/50 border-neutral-600 text-white ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-stone-300 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe your community..."
                    rows={4}
                    className={`bg-neutral-800/50 border-neutral-600 text-white resize-none ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-2">
                    Avatar URL
                  </label>
                  <Input
                    value={form.avatarUrl}
                    onChange={(e) => updateForm('avatarUrl', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-neutral-800/50 border-neutral-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-2">
                    Banner URL
                  </label>
                  <Input
                    value={form.bannerUrl}
                    onChange={(e) => updateForm('bannerUrl', e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="bg-neutral-800/50 border-neutral-600 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Community Type & Visibility */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Community Type & Access</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-4">
                  Community Type *
                </label>
                <div className="space-y-3">
                  {communityTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          form.type === type.value
                            ? 'border-purple-500 bg-purple-600/20'
                            : 'border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700/50'
                        }`}
                        onClick={() => updateForm('type', type.value)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">{type.label}</div>
                            <div className="text-stone-400 text-sm">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-stone-300 text-sm font-medium mb-4">
                  Visibility *
                </label>
                <div className="space-y-3">
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div
                        key={option.value}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          form.visibility === option.value
                            ? 'border-purple-500 bg-purple-600/20'
                            : 'border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700/50'
                        }`}
                        onClick={() => updateForm('visibility', option.value)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">{option.label}</div>
                            <div className="text-stone-400 text-sm">{option.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conditional Fields */}
            {(form.type === CommunityType.COACH_CLIENT || form.type === CommunityType.COURSE) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-neutral-700">
                {form.type === CommunityType.COACH_CLIENT && (
                  <div>
                    <label className="block text-stone-300 text-sm font-medium mb-2">
                      Coach ID *
                    </label>
                    <Input
                      value={form.coachID}
                      onChange={(e) => updateForm('coachID', e.target.value)}
                      placeholder="Enter coach ID..."
                      className={`bg-neutral-800/50 border-neutral-600 text-white ${
                        errors.coachID ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.coachID && (
                      <p className="text-red-400 text-sm mt-1">{errors.coachID}</p>
                    )}
                  </div>
                )}

                {form.type === CommunityType.COURSE && (
                  <div>
                    <label className="block text-stone-300 text-sm font-medium mb-2">
                      Course ID *
                    </label>
                    <Input
                      value={form.courseID}
                      onChange={(e) => updateForm('courseID', e.target.value)}
                      placeholder="Enter course ID..."
                      className={`bg-neutral-800/50 border-neutral-600 text-white ${
                        errors.courseID ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.courseID && (
                      <p className="text-red-400 text-sm mt-1">{errors.courseID}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Community Settings */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Community Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-300 font-medium">Allow Member Posts</div>
                    <div className="text-stone-400 text-sm">Members can create posts</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings('allowMemberPosts', !form.settings.allowMemberPosts)}
                    disabled={isLoading}
                    className={`w-12 h-6 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      form.settings.allowMemberPosts
                        ? "bg-purple-600 justify-end"
                        : "bg-stone-400 justify-start"
                    } flex items-center`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-300 font-medium">Require Approval</div>
                    <div className="text-stone-400 text-sm">Posts need approval before publishing</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings('requireApproval', !form.settings.requireApproval)}
                    disabled={isLoading}
                    className={`w-12 h-6 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      form.settings.requireApproval
                        ? "bg-purple-600 justify-end"
                        : "bg-stone-400 justify-start"
                    } flex items-center`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-300 font-medium">Allow File Uploads</div>
                    <div className="text-stone-400 text-sm">Members can upload files and images</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings('allowFileUploads', !form.settings.allowFileUploads)}
                    disabled={isLoading}
                    className={`w-12 h-6 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      form.settings.allowFileUploads
                        ? "bg-purple-600 justify-end"
                        : "bg-stone-400 justify-start"
                    } flex items-center`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-300 font-medium">Allow Polls</div>
                    <div className="text-stone-400 text-sm">Members can create polls</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings('allowPolls', !form.settings.allowPolls)}
                    disabled={isLoading}
                    className={`w-12 h-6 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      form.settings.allowPolls
                        ? "bg-purple-600 justify-end"
                        : "bg-stone-400 justify-start"
                    } flex items-center`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-300 font-medium">Allow Events</div>
                    <div className="text-stone-400 text-sm">Members can create events</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings('allowEvents', !form.settings.allowEvents)}
                    disabled={isLoading}
                    className={`w-12 h-6 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      form.settings.allowEvents
                        ? "bg-purple-600 justify-end"
                        : "bg-stone-400 justify-start"
                    } flex items-center`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-2">
                    Max Post Length
                  </label>
                  <Input
                    type="number"
                    value={form.settings.maxPostLength}
                    onChange={(e) => updateSettings('maxPostLength', parseInt(e.target.value) || 5000)}
                    min="100"
                    max="10000"
                    className={`bg-neutral-800/50 border-neutral-600 text-white ${
                      errors.maxPostLength ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.maxPostLength && (
                    <p className="text-red-400 text-sm mt-1">{errors.maxPostLength}</p>
                  )}
                  <p className="text-stone-400 text-xs mt-1">
                    Characters (100 - 10,000)
                  </p>
                </div>

                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-4">
                    Moderation Level
                  </label>
                  <div className="space-y-3">
                    {moderationLevels.map((level) => (
                      <div
                        key={level.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          form.settings.moderationLevel === level.value
                            ? 'border-purple-500 bg-purple-600/20'
                            : 'border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700/50'
                        }`}
                        onClick={() => updateSettings('moderationLevel', level.value)}
                      >
                        <div className="text-white font-medium text-sm">{level.label}</div>
                        <div className="text-stone-400 text-xs">{level.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating...' : 'Create Community'}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateCommunityPage;
