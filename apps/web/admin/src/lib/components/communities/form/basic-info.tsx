import { Input, Textarea, Label } from '@nlc-ai/web-ui';
import { CommunityFormErrors, CreateCommunityForm } from "@/lib";
import { FC, useState } from "react";
import { Camera, X, Upload, RotateCw } from 'lucide-react';
import { ImageCropper } from '@nlc-ai/web-settings';

interface IProps {
  form: CreateCommunityForm;
  errors: CommunityFormErrors;
  updateForm: (field: string, value: string) => void;
  onUploadImage?: (field: string, blob: Blob) => Promise<string>; // Returns uploaded URL
}

export const BasicCommunityInfoFormStep: FC<IProps> = (props) => {
  // Avatar state
  const [showAvatarUploadModal, setShowAvatarUploadModal] = useState(false);
  const [showAvatarCropModal, setShowAvatarCropModal] = useState(false);
  const [avatarOriginalImageUrl, setAvatarOriginalImageUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarCroppedBlob, setAvatarCroppedBlob] = useState<Blob | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Banner state
  const [showBannerUploadModal, setShowBannerUploadModal] = useState(false);
  const [showBannerCropModal, setShowBannerCropModal] = useState(false);
  const [bannerOriginalImageUrl, setBannerOriginalImageUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [bannerCroppedBlob, setBannerCroppedBlob] = useState<Blob | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Avatar handlers
  const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      // Handle error - you might want to set this in your errors state
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // Handle error - file too large
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarOriginalImageUrl(result);
      setAvatarPreviewUrl(result);
      setShowAvatarUploadModal(false);
      setShowAvatarCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarCropComplete = (croppedBlob: Blob) => {
    setAvatarCroppedBlob(croppedBlob);
    setShowAvatarCropModal(false);
    setShowAvatarUploadModal(true);

    const croppedUrl = URL.createObjectURL(croppedBlob);
    setAvatarPreviewUrl(croppedUrl);
  };

  const handleAvatarCropCancel = () => {
    setShowAvatarCropModal(false);
    setAvatarOriginalImageUrl(null);
    setAvatarPreviewUrl(null);
    setAvatarCroppedBlob(null);
  };

  const handleAvatarReCrop = () => {
    if (avatarOriginalImageUrl) {
      setShowAvatarUploadModal(false);
      setShowAvatarCropModal(true);
      setAvatarPreviewUrl(avatarOriginalImageUrl);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarCroppedBlob || !props.onUploadImage) return;

    setAvatarUploading(true);
    try {
      const uploadedUrl = await props.onUploadImage('avatar', avatarCroppedBlob);
      props.updateForm('avatarUrl', uploadedUrl);
      closeAvatarUploadModal();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const closeAvatarUploadModal = () => {
    setShowAvatarUploadModal(false);
    setAvatarOriginalImageUrl(null);
    setAvatarPreviewUrl(null);
    setAvatarCroppedBlob(null);
  };

  // Banner handlers (similar to avatar)
  const handleBannerFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBannerOriginalImageUrl(result);
      setBannerPreviewUrl(result);
      setShowBannerUploadModal(false);
      setShowBannerCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerCropComplete = (croppedBlob: Blob) => {
    setBannerCroppedBlob(croppedBlob);
    setShowBannerCropModal(false);
    setShowBannerUploadModal(true);

    const croppedUrl = URL.createObjectURL(croppedBlob);
    setBannerPreviewUrl(croppedUrl);
  };

  const handleBannerCropCancel = () => {
    setShowBannerCropModal(false);
    setBannerOriginalImageUrl(null);
    setBannerPreviewUrl(null);
    setBannerCroppedBlob(null);
  };

  const handleBannerReCrop = () => {
    if (bannerOriginalImageUrl) {
      setShowBannerUploadModal(false);
      setShowBannerCropModal(true);
      setBannerPreviewUrl(bannerOriginalImageUrl);
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerCroppedBlob || !props.onUploadImage) return;

    setBannerUploading(true);
    try {
      const uploadedUrl = await props.onUploadImage('banner', bannerCroppedBlob);
      props.updateForm('bannerUrl', uploadedUrl);
      closeBannerUploadModal();
    } catch (error) {
      console.error('Failed to upload banner:', error);
    } finally {
      setBannerUploading(false);
    }
  };

  const closeBannerUploadModal = () => {
    setShowBannerUploadModal(false);
    setBannerOriginalImageUrl(null);
    setBannerPreviewUrl(null);
    setBannerCroppedBlob(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white text-sm">
          Community Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          value={props.form.name}
          onChange={(e) => props.updateForm('name', e.target.value)}
          placeholder="Enter community name..."
          className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
            props.errors.name ? 'border-red-500' : ''
          }`}
        />
        {props.errors.name && (
          <p className="text-red-400 text-sm">{props.errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white text-sm">
          Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="description"
          value={props.form.description}
          onChange={(e) => props.updateForm('description', e.target.value)}
          placeholder="Describe your community..."
          rows={4}
          className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 resize-none ${
            props.errors.description ? 'border-red-500' : ''
          }`}
        />
        {props.errors.description && (
          <p className="text-red-400 text-sm">{props.errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Upload */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Community Avatar</Label>
          <div className="space-y-3">
            {props.form.avatarUrl && (
              <div className="flex justify-center">
                <img
                  src={props.form.avatarUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowAvatarUploadModal(true)}
              className="w-full p-4 bg-background border-2 border-dashed border-[#3A3A3A] hover:border-[#7B21BA] text-white rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <Camera className="w-6 h-6 text-[#A0A0A0]" />
              <span className="text-sm text-[#A0A0A0]">
                {props.form.avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
              </span>
              <span className="text-xs text-[#A0A0A0]">Square image recommended</span>
            </button>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Community Banner</Label>
          <div className="space-y-3">
            {props.form.bannerUrl && (
              <div className="flex justify-center">
                <img
                  src={props.form.bannerUrl}
                  alt="Banner preview"
                  className="w-full h-24 rounded-lg object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowBannerUploadModal(true)}
              className="w-full p-4 bg-background border-2 border-dashed border-[#3A3A3A] hover:border-[#7B21BA] text-white rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <Camera className="w-6 h-6 text-[#A0A0A0]" />
              <span className="text-sm text-[#A0A0A0]">
                {props.form.bannerUrl ? 'Change Banner' : 'Upload Banner'}
              </span>
              <span className="text-xs text-[#A0A0A0]">Wide image recommended</span>
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Avatar</h3>
              <button
                onClick={closeAvatarUploadModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!avatarCroppedBlob && (
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
                    <span className="text-sm text-gray-400">
                      Click to select an image
                    </span>
                    <span className="text-xs text-gray-500">
                      Max file size: 10MB
                    </span>
                  </label>
                </div>
              )}

              {avatarPreviewUrl && avatarCroppedBlob && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={avatarPreviewUrl}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  </div>

                  <button
                    onClick={handleAvatarReCrop}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Crop Again
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeAvatarUploadModal}
                  disabled={avatarUploading}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/30 flex justify-center items-center text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAvatarUpload}
                  disabled={!avatarCroppedBlob || avatarUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {avatarUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Upload Modal */}
      {showBannerUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Banner</h3>
              <button
                onClick={closeBannerUploadModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!bannerCroppedBlob && (
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
                    <span className="text-sm text-gray-400">
                      Click to select an image
                    </span>
                    <span className="text-xs text-gray-500">
                      Max file size: 10MB
                    </span>
                  </label>
                </div>
              )}

              {bannerPreviewUrl && bannerCroppedBlob && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={bannerPreviewUrl}
                      alt="Preview"
                      className="w-full h-32 rounded-lg object-cover"
                    />
                  </div>

                  <button
                    onClick={handleBannerReCrop}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Crop Again
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeBannerUploadModal}
                  disabled={bannerUploading}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/30 flex justify-center items-center text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBannerUpload}
                  disabled={!bannerCroppedBlob || bannerUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {bannerUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Crop Modal */}
      {showAvatarCropModal && avatarOriginalImageUrl && (
        <ImageCropper
          imageSrc={avatarOriginalImageUrl}
          onCropComplete={handleAvatarCropComplete}
          onCancel={handleAvatarCropCancel}
          cropType={"square"}
        />
      )}

      {/* Banner Crop Modal */}
      {showBannerCropModal && bannerOriginalImageUrl && (
        <ImageCropper
          imageSrc={bannerOriginalImageUrl}
          onCropComplete={handleBannerCropComplete}
          onCancel={handleBannerCropCancel}
          cropType={"banner"}
          aspectRatio={3}
        />
      )}
    </div>
  );
}
