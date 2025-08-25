'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, AlertTriangle, Trash2 } from 'lucide-react';
import { BackTo } from "@nlc-ai/web-shared";
import { Button, Input, Textarea } from '@nlc-ai/web-ui';
import { toast } from 'sonner';

interface CommunitySettings {
  id: string;
  name: string;
  description: string;
  visibility: string;
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

const AdminCommunitySettingsPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, [communityID]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);

      // Mock data
      const mockSettings: CommunitySettings = {
        id: communityID,
        name: 'Coach Network Community',
        description: 'A professional community for coaches to connect and share knowledge.',
        visibility: 'private',
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
      };

      setSettings(mockSettings);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      // Validate
      if (settings.name.length < 3) {
        setErrors({ name: 'Name must be at least 3 characters' });
        return;
      }

      // Save settings via API
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete community via API
      toast.success('Community deleted successfully');
      router.push('/communities');
    } catch (error) {
      toast.error('Failed to delete community');
    }
  };

  const updateSettings = (field: string, value: any) => {
    if (!settings) return;

    if (field.startsWith('settings.')) {
      const settingKey = field.replace('settings.', '');
      setSettings(prev => prev ? {
        ...prev,
        settings: {
          ...prev.settings,
          [settingKey]: value,
        },
      } : null);
    } else {
      setSettings(prev => prev ? {
        ...prev,
        [field]: value,
      } : null);
    }

    // Clear errors
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (isLoading || !settings) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-96 bg-neutral-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo
        title="Community Settings"
        onClick={() => router.push(`/communities/${communityID}`)}
      />

      <div className="max-w-4xl space-y-8">
        {/* Basic Settings */}
        <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-stone-300 text-sm font-medium mb-2">
                Community Name
              </label>
              <Input
                value={settings.name}
                onChange={(e) => updateSettings('name', e.target.value)}
                className={`bg-neutral-800/50 border-neutral-600 text-white ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-stone-300 text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={settings.description}
                onChange={(e) => updateSettings('description', e.target.value)}
                rows={4}
                className="bg-neutral-800/50 border-neutral-600 text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">
                Avatar URL
              </label>
              <Input
                value={settings.avatarUrl}
                onChange={(e) => updateSettings('avatarUrl', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-neutral-800/50 border-neutral-600 text-white"
              />
            </div>

            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">
                Banner URL
              </label>
              <Input
                value={settings.bannerUrl}
                onChange={(e) => updateSettings('bannerUrl', e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="bg-neutral-800/50 border-neutral-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Community Features */}
        <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Community Features</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-stone-300 font-medium">Allow Member Posts</div>
                  <div className="text-stone-400 text-sm">Members can create posts</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.settings.allowMemberPosts}
                  onChange={(e) => updateSettings('settings.allowMemberPosts', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-stone-300 font-medium">Require Approval</div>
                  <div className="text-stone-400 text-sm">Posts need approval before publishing</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.settings.requireApproval}
                  onChange={(e) => updateSettings('settings.requireApproval', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-stone-300 font-medium">Allow File Uploads</div>
                  <div className="text-stone-400 text-sm">Members can upload files and images</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.settings.allowFileUploads}
                  onChange={(e) => updateSettings('settings.allowFileUploads', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-stone-300 font-medium">Allow Polls</div>
                  <div className="text-stone-400 text-sm">Members can create polls</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.settings.allowPolls}
                  onChange={(e) => updateSettings('settings.allowPolls', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-stone-300 font-medium">Allow Events</div>
                  <div className="text-stone-400 text-sm">Members can create events</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.settings.allowEvents}
                  onChange={(e) => updateSettings('settings.allowEvents', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">
                  Max Post Length
                </label>
                <Input
                  type="number"
                  value={settings.settings.maxPostLength}
                  onChange={(e) => updateSettings('settings.maxPostLength', parseInt(e.target.value) || 5000)}
                  min="100"
                  max="10000"
                  className="bg-neutral-800/50 border-neutral-600 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="relative bg-gradient-to-b from-red-800/30 to-red-900/30 rounded-[20px] lg:rounded-[30px] border border-red-700 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Danger Zone</h2>
          </div>

          <p className="text-stone-300 mb-6">
            Once you delete a community, there is no going back. Please be certain.
          </p>

          <Button
            onClick={handleDelete}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Community
          </Button>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => router.push(`/communities/${communityID}`)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunitySettingsPage;
