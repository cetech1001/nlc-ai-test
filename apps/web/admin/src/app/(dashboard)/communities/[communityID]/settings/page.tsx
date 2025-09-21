'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { BackTo } from "@nlc-ai/web-shared";
import { Button } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import {
  sdkClient,
  BasicInfoSettings,
  FeaturesSettings,
  PricingSettings,
  DangerZoneSettings
} from "@/lib";
import { CommunityResponse, UpdateCommunityRequest } from '@nlc-ai/sdk-communities';

interface CommunitySettingsForm extends CommunityResponse {
  isDirty?: boolean;
}

const AdminCommunitySettingsPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [community, setCommunity] = useState<CommunitySettingsForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCommunitySettings();
  }, [communityID]);

  const fetchCommunitySettings = async () => {
    try {
      setIsLoading(true);
      const response = await sdkClient.communities.getCommunity(communityID);
      setCommunity({ ...response, isDirty: false });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load community settings');
      router.push('/communities');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCommunity = (updates: Partial<CommunitySettingsForm>) => {
    if (!community) return;

    setCommunity(prev => ({
      ...prev!,
      ...updates,
      isDirty: true,
    }));

    // Clear related errors
    if (errors) {
      const newErrors = { ...errors };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      setErrors(newErrors);
    }
  };

  const updateSettings = (settingKey: string, value: any) => {
    if (!community) return;

    const newSettings = {
      ...community.settings,
      [settingKey]: value,
    };

    updateCommunity({ settings: newSettings });
  };

  const updatePricing = (field: string, value: any) => {
    if (!community) return;

    if (field === 'pricingType') {
      // When changing pricing type, reset all price fields
      updateCommunity({
        pricingType: value,
        oneTimePrice: value === 'one_time' ? community.oneTimePrice : null,
        monthlyPrice: value === 'monthly' ? community.monthlyPrice : null,
        annualPrice: value === 'annual' ? community.annualPrice : null,
      });
    } else if (field === 'oneTimePrice') {
      updateCommunity({ oneTimePrice: value });
    } else if (field === 'monthlyPrice') {
      updateCommunity({ monthlyPrice: value });
    } else if (field === 'annualPrice') {
      updateCommunity({ annualPrice: value });
    } else if (field === 'currency') {
      updateCommunity({ currency: value });
    }
  };

  const validateForm = (): boolean => {
    if (!community) return false;

    const newErrors: Record<string, string> = {};

    if (!community.name?.trim()) {
      newErrors.name = 'Community name is required';
    } else if (community.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    }

    if (community.description && community.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Validate pricing based on type
    if (community.pricingType === 'one_time' && (!community.oneTimePrice || community.oneTimePrice <= 0)) {
      newErrors.oneTimePrice = 'Valid one-time price is required';
    }
    if (community.pricingType === 'monthly' && (!community.monthlyPrice || community.monthlyPrice <= 0)) {
      newErrors.monthlyPrice = 'Valid monthly price is required';
    }
    if (community.pricingType === 'annual' && (!community.annualPrice || community.annualPrice <= 0)) {
      newErrors.annualPrice = 'Valid annual price is required';
    }

    if (community.settings?.maxPostLength && (community.settings.maxPostLength < 100 || community.settings.maxPostLength > 10000)) {
      newErrors.maxPostLength = 'Max post length must be between 100 and 10,000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!community || !validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      const updateRequest: UpdateCommunityRequest = {
        name: community.name,
        description: community.description,
        visibility: community.visibility,
        avatarUrl: community.avatarUrl,
        bannerUrl: community.bannerUrl,
        settings: community.settings,
        isActive: community.isActive,
      };

      // Include pricing based on the current type
      if (community.pricingType !== 'free') {
        updateRequest.pricing = {
          type: community.pricingType,
          currency: community.currency || 'USD',
        };

        // Set the appropriate amount based on pricing type
        switch (community.pricingType) {
          case 'one_time':
            updateRequest.pricing.amount = community.oneTimePrice;
            break;
          case 'monthly':
            updateRequest.pricing.amount = community.monthlyPrice;
            break;
          case 'annual':
            updateRequest.pricing.amount = community.annualPrice;
            break;
        }
      }

      const updatedCommunity = await sdkClient.communities.updateCommunity(
        communityID,
        updateRequest
      );

      setCommunity({ ...updatedCommunity, isDirty: false });
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setErrors({ general: error.message || 'Failed to save settings' });
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!community) return;

    const confirmMessage = `Are you sure you want to delete "${community.name}"? This action cannot be undone and will permanently delete all posts, comments, and member data.`;

    if (!confirm(confirmMessage)) return;

    try {
      await sdkClient.communities.updateCommunity(communityID, {
        isActive: false,
      });

      toast.success('Community deleted successfully');
      router.push('/communities');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete community');
    }
  };

  const handleCancel = () => {
    if (community?.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push(`/communities/${communityID}`);
      }
    } else {
      router.push(`/communities/${communityID}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
          <div className="space-y-6">
            <div className="h-96 bg-neutral-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-neutral-800 rounded-2xl"></div>
              <div className="h-80 bg-neutral-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo
        title={`${community.name} Settings`}
        onClick={handleCancel}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Community Settings</h1>
            <p className="text-stone-400 mt-1">
              Configure your community's appearance, features, and access controls
            </p>
          </div>

          {community.isDirty && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Unsaved changes
              </div>
            </div>
          )}
        </div>

        {errors.general && (
          <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="xl:col-span-2 space-y-8">
            {/* Basic Information */}
            <BasicInfoSettings
              community={community}
              errors={errors}
              onUpdate={updateCommunity}
            />

            {/* Features & Moderation */}
            <FeaturesSettings
              community={community}
              errors={errors}
              onUpdateSettings={updateSettings}
            />

            {/* Pricing Settings */}
            <PricingSettings
              community={community}
              errors={errors}
              onUpdatePricing={updatePricing}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/communities/${communityID}/members`)}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  Manage Members
                </Button>

                <Button
                  onClick={() => router.push(`/communities/${communityID}/posts`)}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  View Posts
                </Button>

                <Button
                  onClick={() => router.push(`/communities/${communityID}/analytics`)}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Community Info */}
            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Information</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-stone-400 block">Status</span>
                  <span className={`inline-flex items-center gap-2 mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    community.isActive
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      community.isActive ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    {community.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block">Members</span>
                  <span className="text-stone-200 font-semibold">{community.memberCount} members</span>
                </div>

                <div>
                  <span className="text-stone-400 block">Posts</span>
                  <span className="text-stone-200 font-semibold">{community.postCount} posts</span>
                </div>

                <div>
                  <span className="text-stone-400 block">Created</span>
                  <span className="text-stone-200">{new Date(community.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  <span className="text-stone-400 block">Last Updated</span>
                  <span className="text-stone-200">{new Date(community.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <DangerZoneSettings
              community={community}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-neutral-700/50">
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving || !community.isDirty}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunitySettingsPage;
