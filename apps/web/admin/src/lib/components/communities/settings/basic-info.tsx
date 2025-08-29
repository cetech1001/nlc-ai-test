import { useState } from 'react';
import { Input, Textarea, Label } from '@nlc-ai/web-ui';
import { Camera, X, Upload, RotateCw } from 'lucide-react';
import { CommunityResponse } from '@nlc-ai/sdk-community';
import { ImageCropper } from '@nlc-ai/web-settings';
import { sdkClient } from "@/lib";
import { toast } from 'sonner';

interface BasicInfoSettingsProps {
  community: CommunityResponse;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<CommunityResponse>) => void;
}

const visibilityOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can see and join this community',
    color: 'text-green-400 border-green-600/30 bg-green-600/20',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only members can see this community',
    color: 'text-red-400 border-red-600/30 bg-red-600/20',
  },
  {
    value: 'invite_only',
    label: 'Invite Only',
    description: 'Members must be invited to join',
    color: 'text-yellow-400 border-yellow-600/30 bg-yellow-600/20',
  },
];

export const BasicInfoSettings = ({ community, errors, onUpdate }: BasicInfoSettingsProps) => {
  // Avatar upload state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [avatarOriginal, setAvatarOriginal] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Banner upload state
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showBannerCrop, setShowBannerCrop] = useState(false);
  const [bannerOriginal, setBannerOriginal] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerBlob, setBannerBlob] = useState<Blob | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Avatar handlers
  const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarOriginal(result);
      setAvatarPreview(result);
      setShowAvatarModal(false);
      setShowAvatarCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarCropComplete = (croppedBlob: Blob) => {
    setAvatarBlob(croppedBlob);
    setShowAvatarCrop(false);
    setShowAvatarModal(true);
    setAvatarPreview(URL.createObjectURL(croppedBlob));
  };

  const handleAvatarUpload = async () => {
    if (!avatarBlob) return;

    setAvatarUploading(true);
    try {
      const fileName = `community-avatar-${Date.now()}.jpg`;
      const file = new File([avatarBlob], fileName, { type: 'image/jpeg' });

      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: 'communities',
        tags: ['avatar', 'community-media'],
        transformation: [
          { type: 'quality', quality: 'auto' },
          { type: 'format', format: 'webp' }
        ]
      });

      if (uploadResult.success && uploadResult.data) {
        onUpdate({ avatarUrl: uploadResult.data.secureUrl });
        closeAvatarModal();
        toast.success('Avatar uploaded successfully!');
      } else {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      toast.error(`Failed to upload avatar: ${error.message}`);
    } finally {
      setAvatarUploading(false);
    }
  };

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setAvatarOriginal(null);
    setAvatarPreview(null);
    setAvatarBlob(null);
  };

  // Banner handlers (similar pattern)
  const handleBannerFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBannerOriginal(result);
      setBannerPreview(result);
      setShowBannerModal(false);
      setShowBannerCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerCropComplete = (croppedBlob: Blob) => {
    setBannerBlob(croppedBlob);
    setShowBannerCrop(false);
    setShowBannerModal(true);
    setBannerPreview(URL.createObjectURL(croppedBlob));
  };

  const handleBannerUpload = async () => {
    if (!bannerBlob) return;

    setBannerUploading(true);
    try {
      const fileName = `community-banner-${Date.now()}.jpg`;
      const file = new File([bannerBlob], fileName, { type: 'image/jpeg' });

      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: 'communities',
        tags: ['banner', 'community-media'],
        transformation: [
          { type: 'quality', quality: 'auto' },
          { type: 'format', format: 'webp' }
        ]
      });

      if (uploadResult.success && uploadResult.data) {
        onUpdate({ bannerUrl: uploadResult.data.secureUrl });
        closeBannerModal();
        toast.success('Banner uploaded successfully!');
      } else {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload banner:', error);
      toast.error(`Failed to upload banner: ${error.message}`);
    } finally {
      setBannerUploading(false);
    }
  };

  const closeBannerModal = () => {
    setShowBannerModal(false);
    setBannerOriginal(null);
    setBannerPreview(null);
    setBannerBlob(null);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6 lg:p-8">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-64 h-64 -right-16 -top-24 bg-gradient-to-l from-fuchsia-400 via-purple-500 to-violet-600 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

            <div className="space-y-6">
              {/* Community Name */}
              <div>
                <Label htmlFor="name" className="text-stone-300 text-sm font-medium mb-2 block">
                  Community Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={community.name || ''}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  placeholder="Enter community name..."
                  className={`bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-stone-300 text-sm font-medium mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={community.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Describe your community..."
                  rows={4}
                  className={`bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400 focus:border-purple-500 focus:ring-purple-500/20 resize-none ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Visibility */}
              <div>
                <Label className="text-stone-300 text-sm font-medium mb-3 block">
                  Visibility
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {visibilityOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        community.visibility === option.value
                          ? `${option.color} border-current`
                          : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                      }`}
                      onClick={() => onUpdate({ visibility: option.value as any })}
                    >
                      <div className="text-white font-medium text-sm mb-1">{option.label}</div>
                      <div className="text-stone-400 text-xs">{option.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div>
                  <Label className="text-stone-300 text-sm font-medium mb-3 block">
                    Community Avatar
                  </Label>
                  <div className="space-y-3">
                    {community.avatarUrl && (
                      <div className="flex justify-center">
                        <img
                          src={community.avatarUrl}
                          alt="Community avatar"
                          className="w-20 h-20 rounded-xl object-cover border border-neutral-600"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAvatarModal(true)}
                      className="w-full p-4 bg-neutral-800/50 border-2 border-dashed border-neutral-600 hover:border-purple-500 text-white rounded-xl transition-colors flex flex-col items-center gap-2"
                    >
                      <Camera className="w-5 h-5 text-stone-400" />
                      <span className="text-sm text-stone-400">
                        {community.avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                      </span>
                      <span className="text-xs text-stone-500">Recommended: 400x400px</span>
                    </button>
                  </div>
                </div>

                {/* Banner */}
                <div>
                  <Label className="text-stone-300 text-sm font-medium mb-3 block">
                    Community Banner
                  </Label>
                  <div className="space-y-3">
                    {community.bannerUrl && (
                      <div className="flex justify-center">
                        <img
                          src={community.bannerUrl}
                          alt="Community banner"
                          className="w-full h-20 rounded-xl object-cover border border-neutral-600"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowBannerModal(true)}
                      className="w-full p-4 bg-neutral-800/50 border-2 border-dashed border-neutral-600 hover:border-purple-500 text-white rounded-xl transition-colors flex flex-col items-center gap-2"
                    >
                      <Camera className="w-5 h-5 text-stone-400" />
                      <span className="text-sm text-stone-400">
                        {community.bannerUrl ? 'Change Banner' : 'Upload Banner'}
                      </span>
                      <span className="text-xs text-stone-500">Recommended: 1200x400px</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Avatar</h3>
              <button
                onClick={closeAvatarModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!avatarBlob && (
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to select an image</span>
                    <span className="text-xs text-gray-500">Max file size: 10MB</span>
                  </label>
                </div>
              )}

              {avatarPreview && avatarBlob && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-32 h-32 rounded-xl object-cover"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (avatarOriginal) {
                        setShowAvatarModal(false);
                        setShowAvatarCrop(true);
                        setAvatarPreview(avatarOriginal);
                      }
                    }}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Crop Again
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeAvatarModal}
                  disabled={avatarUploading}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/30 flex justify-center items-center text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAvatarUpload}
                  disabled={!avatarBlob || avatarUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {avatarUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Upload Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Banner</h3>
              <button
                onClick={closeBannerModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!bannerBlob && (
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileSelect}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to select an image</span>
                    <span className="text-xs text-gray-500">Max file size: 10MB</span>
                  </label>
                </div>
              )}

              {bannerPreview && bannerBlob && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-32 rounded-xl object-cover"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (bannerOriginal) {
                        setShowBannerModal(false);
                        setShowBannerCrop(true);
                        setBannerPreview(bannerOriginal);
                      }
                    }}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Crop Again
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeBannerModal}
                  disabled={bannerUploading}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/30 flex justify-center items-center text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBannerUpload}
                  disabled={!bannerBlob || bannerUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {bannerUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Crop Modal */}
      {showAvatarCrop && avatarOriginal && (
        <ImageCropper
          imageSrc={avatarOriginal}
          onCropComplete={handleAvatarCropComplete}
          onCancel={() => {
            setShowAvatarCrop(false);
            setAvatarOriginal(null);
            setAvatarPreview(null);
            setAvatarBlob(null);
          }}
          cropType="square"
        />
      )}

      {/* Banner Crop Modal */}
      {showBannerCrop && bannerOriginal && (
        <ImageCropper
          imageSrc={bannerOriginal}
          onCropComplete={handleBannerCropComplete}
          onCancel={() => {
            setShowBannerCrop(false);
            setBannerOriginal(null);
            setBannerPreview(null);
            setBannerBlob(null);
          }}
          cropType="banner"
          aspectRatio={3}
        />
      )}
    </>
  );
}
