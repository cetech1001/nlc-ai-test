'use client'

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ChevronLeft, ChevronRight, Save, X} from 'lucide-react';
import {BackTo} from "@nlc-ai/web-shared";
import {Button} from '@nlc-ai/web-ui';
import {toast} from 'sonner';
import {BasicCommunityInfoFormStep, CommunitySettingsFormStep, CommunityTypeAndAccessFormStep, sdkClient} from "@/lib";
import {
  CommunityFormErrors,
  CommunityPricingTypes,
  CommunityType,
  CommunityVisibility,
  CreateCommunityForm,
  CreateCommunityRequest
} from '@nlc-ai/sdk-communities';
import {MediaTransformationType} from "@nlc-ai/sdk-media";

const stepNames = [
  "Basic Info",
  "Type & Access",
  "Settings"
];

const AdminCreateCommunityPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<CommunityFormErrors>({});

  const [form, setForm] = useState<CreateCommunityForm>({
    name: '',
    description: '',
    slug: '',
    type: CommunityType.PRIVATE,
    visibility: CommunityVisibility.PRIVATE,
    coachID: '',
    courseID: '',
    avatarUrl: '',
    bannerUrl: '',
    pricing: {
      type: CommunityPricingTypes.FREE,
      amount: 0,
      currency: 'USD'
    },
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

  const steps = [
    { title: 'Basic Info', description: 'Name and description' },
    { title: 'Type & Access', description: 'Community settings' },
    { title: 'Settings', description: 'Features and moderation' },
  ];

  const validateCurrentStep = () => {
    const newErrors: CommunityFormErrors = {};

    if (currentStep === 0) {
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

      if (!form.slug.trim()) {
        newErrors.slug = 'URL slug is required';
      } else if (form.slug.length < 3) {
        newErrors.slug = 'URL slug must be at least 3 characters';
      } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
        newErrors.slug = 'URL slug can only contain lowercase letters, numbers, and hyphens';
      }
    } else if (currentStep === 1) {
      if (form.type === CommunityType.COACH_CLIENT && !form.coachID.trim()) {
        newErrors.coachID = 'Coach selection is required for coach-client communities';
      }

      if (form.type === CommunityType.COURSE && !form.courseID.trim()) {
        newErrors.courseID = 'Course selection is required for course communities';
      }

      if (form.pricing.type !== 'free' && (!form.pricing.amount || form.pricing.amount <= 0)) {
        newErrors['pricing.amount'] = 'Valid price is required for paid communities';
      }
    } else if (currentStep === 2) {
      if (form.settings.maxPostLength < 100 || form.settings.maxPostLength > 10000) {
        newErrors.maxPostLength = 'Max post length must be between 100 and 10,000 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const createRequest: CreateCommunityRequest = {
        name: form.name,
        description: form.description,
        slug: form.slug,
        type: form.type,
        visibility: form.visibility,
        pricing: form.pricing,
        settings: form.settings,
        isSystemCreated: true
      };

      // Add conditional fields
      if (form.coachID.trim()) {
        createRequest.coachID = form.coachID;
      }

      if (form.courseID.trim()) {
        createRequest.courseID = form.courseID;
      }

      if (form.avatarUrl.trim()) {
        createRequest.avatarUrl = form.avatarUrl;
      }

      if (form.bannerUrl.trim()) {
        createRequest.bannerUrl = form.bannerUrl;
      }

      await sdkClient.community.communities.createCommunity(createRequest);

      toast.success('Community created successfully!');
      router.push('/communities?success=created');
    } catch (error: any) {
      console.error('Failed to create community:', error);
      setErrors({ general: error.message || 'Failed to create community' });
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
    // Clear related errors when field is updated
    if (errors[field as keyof CommunityFormErrors]) {
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

  // Image upload handler using media SDK
  const handleUploadImage = async (field: string, blob: Blob): Promise<string> => {
    try {
      const fileName = field === 'avatar'
        ? `community-avatar-${Date.now()}.jpg`
        : `community-banner-${Date.now()}.jpg`;

      const file = new File([blob], fileName, { type: 'image/jpeg' });

      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: 'communities',
        tags: [field, 'community-media'],
        metadata: {
          uploadedBy: 'admin',
          purpose: field,
          communityForm: true
        },
        transformation: [
          {
            type: MediaTransformationType.QUALITY,
            quality: 'auto'
          },
          {
            type: MediaTransformationType.FORMAT,
            format: 'webp'
          }
        ]
      });

      if (uploadResult.success && uploadResult.data) {
        toast.success(`${field === 'avatar' ? 'Avatar' : 'Banner'} uploaded successfully!`);
        return uploadResult.data.secureUrl;
      } else {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error(`Failed to upload ${field}:`, error);
      toast.error(`Failed to upload ${field === 'avatar' ? 'avatar' : 'banner'}: ${error.message}`);
      throw error;
    }
  };

  const renderBasicInfo = () => (
    <BasicCommunityInfoFormStep
      form={form}
      errors={errors}
      updateForm={updateForm}
      onUploadImage={handleUploadImage}
      setErrors={setErrors}
    />
  );

  const renderTypeAndAccess = () => (
    <CommunityTypeAndAccessFormStep form={form} errors={errors} updateForm={updateForm}/>
  );

  const renderSettings = () => (
    <CommunitySettingsFormStep form={form} errors={errors} updateSettings={updateSettings}/>
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo title="Create Community" onClick={handleCancel} />

      <div className="max-w-4xl mx-auto">
        {/* Step Progress - Quiz Style */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            {steps.map((_, index) => {
              const step = index + 1;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isPrevActive = index - 1 === currentStep;
              return (
                <React.Fragment key={step}>
                  {index > 0 && (
                    <>
                      <div
                        key={`line-${step}`}
                        className={`flex-1 h-0.5 ${
                          isCompleted || isActive || isPrevActive
                            ? 'bg-gradient-to-l from-[#7B21BA] to-fuchsia-500'
                            : 'bg-gray-700'
                        }`}
                      />
                      <div
                        key={`line-${step}-x`}
                        className={`flex-1 h-0.5 ${
                          isCompleted || isActive
                            ? 'bg-gradient-to-l from-[#7B21BA] to-fuchsia-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    </>
                  )}
                  <div
                    className={`w-36 h-10 flex items-center justify-center rounded ${
                      isCompleted || isActive
                        ? 'bg-gradient-to-r from-[#7B21BA] to-fuchsia-500 text-white'
                        : 'border border-gray-700 text-white'
                    }`}
                  >
                    {stepNames[index]}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{steps[currentStep]?.title}</h2>
            <p className="text-white/70">{steps[currentStep]?.description}</p>
          </div>
        </div>

        {errors?.general && (
          <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="mb-8">
          {currentStep === 0 && renderBasicInfo()}
          {currentStep === 1 && renderTypeAndAccess()}
          {currentStep === 2 && renderSettings()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <Button
                onClick={handlePrev}
                variant="outline"
                className="bg-transparent border-[#3A3A3A] text-white hover:bg-background"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="bg-transparent border-[#3A3A3A] text-white hover:bg-background"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Community'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCommunityPage;
