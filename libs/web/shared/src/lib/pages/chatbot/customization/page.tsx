'use client'

import React, { useState, useEffect } from 'react';
import { Camera, Save, RotateCcw, Eye, Loader2, Upload, X } from 'lucide-react';
import { ImageCropper } from '@nlc-ai/web-settings';
import { NLCClient } from '@nlc-ai/sdk-main';
import { MediaTransformationType } from '@nlc-ai/types';
import { toast } from 'sonner';

interface ChatbotCustomizationPageProps {
  sdkClient: NLCClient;
  coachID: string;
}

interface CustomizationForm {
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  assistantTextColor: string;
  assistantBubbleColor: string;
  userTextColor: string;
  userBubbleColor: string;
  backgroundColor: string;
  glowColor: string;
  position: 'bottom-right' | 'bottom-left';
  greeting?: string;
  requireUserInfo: boolean;
  requireName: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
}

const DEFAULT_FORM: CustomizationForm = {
  name: 'AI Coach',
  primaryColor: '#DF69FF',
  gradientStart: '#B339D4',
  gradientEnd: '#7B21BA',
  assistantTextColor: '#C5C5C5',
  assistantBubbleColor: '#1A1A1A',
  userTextColor: '#C5C5C5',
  userBubbleColor: 'rgba(223,105,255,0.08)',
  backgroundColor: '#0A0A0A',
  glowColor: '#7B21BA',
  position: 'bottom-right',
  greeting: "Hey! How's everything going with your program?\nLet me know if you need any help today!",
  requireUserInfo: false,
  requireName: false,
  requireEmail: false,
  requirePhone: false
};

export const ChatbotCustomizationPage: React.FC<ChatbotCustomizationPageProps> = ({
                                                                                    sdkClient,
                                                                                    coachID
                                                                                  }) => {
  const [form, setForm] = useState<CustomizationForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'logo'>('avatar');
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    loadCustomization();
  }, []);

  const loadCustomization = async () => {
    try {
      setLoading(true);
      const response = await sdkClient.users.chatbotCustomization.getCustomization();
      if (response) {
        const { coachID, ...data } = response;
        setForm(data);
      }
    } catch (error) {
      console.error('Failed to load customization:', error);
      toast.error('Failed to load chatbot settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CustomizationForm, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'requireUserInfo' && !value) {
        updated.requireName = false;
        updated.requireEmail = false;
        updated.requirePhone = false;
      }

      return updated;
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
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
      setOriginalImageUrl(result);
      setPreviewUrl(result);
      setCropType(type);

      if (type === 'avatar') {
        setShowAvatarModal(false);
      } else {
        setShowLogoModal(false);
      }

      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob);
    setShowCropModal(false);

    if (cropType === 'avatar') {
      setShowAvatarModal(true);
    } else {
      setShowLogoModal(true);
    }

    const croppedUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(croppedUrl);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImageUrl(null);
    setPreviewUrl(null);
    setCroppedImageBlob(null);
  };

  const handleImageUpload = async (type: 'avatar' | 'logo') => {
    if (!croppedImageBlob) return;

    const isAvatar = type === 'avatar';
    isAvatar ? setUploadingAvatar(true) : setUploadingLogo(true);

    try {
      const file = new File([croppedImageBlob], `${type}.jpg`, { type: 'image/jpeg' });

      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: `nlc-ai/chatbot/${type}s`,
        tags: [type, 'chatbot'],
        metadata: {
          uploadedBy: 'coach',
          purpose: type,
        },
        transformation: [
          {
            type: MediaTransformationType.CROP,
            width: isAvatar ? 200 : 400,
            height: isAvatar ? 200 : 200,
            crop: 'fill',
            gravity: isAvatar ? 'face' : 'center',
          },
          {
            type: MediaTransformationType.QUALITY,
            quality: 'auto',
            fetch_format: 'auto',
          }
        ]
      });

      if (uploadResult.success && uploadResult.data?.asset) {
        if (isAvatar) {
          handleInputChange('avatarUrl', uploadResult.data.asset.secureUrl);
          setShowAvatarModal(false);
        } else {
          handleInputChange('logoUrl', uploadResult.data.asset.secureUrl);
          setShowLogoModal(false);
        }

        toast.success(`${isAvatar ? 'Avatar' : 'Logo'} uploaded successfully!`);
        closeUploadModal();
      } else {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(`Failed to upload ${type}: ${error.message}`);
    } finally {
      isAvatar ? setUploadingAvatar(false) : setUploadingLogo(false);
    }
  };

  const closeUploadModal = () => {
    setShowAvatarModal(false);
    setShowLogoModal(false);
    setPreviewUrl(null);
    setCroppedImageBlob(null);
    setOriginalImageUrl(null);
  };

  const handleReCrop = () => {
    if (originalImageUrl) {
      if (cropType === 'avatar') {
        setShowAvatarModal(false);
      } else {
        setShowLogoModal(false);
      }
      setShowCropModal(true);
      setPreviewUrl(originalImageUrl);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Chatbot name is required');
      return;
    }

    setSaving(true);
    try {
      await sdkClient.users.chatbotCustomization.updateCustomization(form);
      toast.success('Chatbot customization saved successfully!');
    } catch (error) {
      console.error('Failed to save customization:', error);
      toast.error('Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    toast.info('Reset to default values');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
          <span className="text-white">Loading customization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute -left-[273px] -top-[209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />
      <div className="absolute right-[168px] bottom-[-209px] w-[547px] h-[547px] rounded-full opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 blur-[112.55px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Chatbot Customization</h1>
            <p className="text-stone-400">Customize your AI chatbot's appearance and behavior</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-6 py-3 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white rounded-lg hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-stone-300 text-sm font-medium mb-2 block">
                    Chatbot Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-neutral-600 rounded-lg text-white placeholder-stone-500 focus:border-violet-500 focus:outline-none"
                    placeholder="Enter chatbot name"
                  />
                </div>

                <div>
                  <label className="text-stone-300 text-sm font-medium mb-2 block">Greeting Message</label>
                  <textarea
                    value={form.greeting || ''}
                    onChange={(e) => handleInputChange('greeting', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-neutral-600 rounded-lg text-white placeholder-stone-500 focus:border-violet-500 focus:outline-none resize-none"
                    placeholder="Enter greeting message"
                  />
                </div>

                <div>
                  <label className="text-stone-300 text-sm font-medium mb-2 block">Position</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleInputChange('position', 'bottom-right')}
                      className={`px-4 py-3 rounded-lg border transition-all ${
                        form.position === 'bottom-right'
                          ? 'border-violet-500 bg-violet-500/10 text-white'
                          : 'border-neutral-600 text-stone-400 hover:border-neutral-500'
                      }`}
                    >
                      Bottom Right
                    </button>
                    <button
                      onClick={() => handleInputChange('position', 'bottom-left')}
                      className={`px-4 py-3 rounded-lg border transition-all ${
                        form.position === 'bottom-left'
                          ? 'border-violet-500 bg-violet-500/10 text-white'
                          : 'border-neutral-600 text-stone-400 hover:border-neutral-500'
                      }`}
                    >
                      Bottom Left
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* User Information Requirements */}
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">User Information Requirements</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-stone-300 text-sm font-medium">Require User Info Before Chat</label>
                  <button
                    onClick={() => handleInputChange('requireUserInfo', !form.requireUserInfo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.requireUserInfo ? 'bg-violet-600' : 'bg-neutral-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.requireUserInfo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {form.requireUserInfo && (
                  <div className="ml-4 space-y-3 pt-2 border-t border-neutral-700">
                    <div className="flex items-center justify-between">
                      <label className="text-stone-400 text-sm">Require Name</label>
                      <button
                        onClick={() => handleInputChange('requireName', !form.requireName)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.requireName ? 'bg-violet-600' : 'bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            form.requireName ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-stone-400 text-sm">Require Email</label>
                      <button
                        onClick={() => handleInputChange('requireEmail', !form.requireEmail)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.requireEmail ? 'bg-violet-600' : 'bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            form.requireEmail ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-stone-400 text-sm">Require Phone</label>
                      <button
                        onClick={() => handleInputChange('requirePhone', !form.requirePhone)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.requirePhone ? 'bg-violet-600' : 'bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            form.requirePhone ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Images</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-300 text-sm font-medium mb-2 block">Avatar</label>
                  <div className="relative group">
                    <div className="w-full aspect-square rounded-lg bg-neutral-800 border border-neutral-600 overflow-hidden">
                      {form.avatarUrl ? (
                        <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-stone-300 text-sm font-medium mb-2 block">Logo</label>
                  <div className="relative group">
                    <div className="w-full aspect-square rounded-lg bg-neutral-800 border border-neutral-600 overflow-hidden">
                      {form.logoUrl ? (
                        <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowLogoModal(true)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Colors</h2>

              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Primary Color"
                  value={form.primaryColor}
                  onChange={(value) => handleInputChange('primaryColor', value)}
                />
                <ColorInput
                  label="Gradient Start"
                  value={form.gradientStart}
                  onChange={(value) => handleInputChange('gradientStart', value)}
                />
                <ColorInput
                  label="Gradient End"
                  value={form.gradientEnd}
                  onChange={(value) => handleInputChange('gradientEnd', value)}
                />
                <ColorInput
                  label="Background"
                  value={form.backgroundColor}
                  onChange={(value) => handleInputChange('backgroundColor', value)}
                />
                <ColorInput
                  label="Glow Color"
                  value={form.glowColor}
                  onChange={(value) => handleInputChange('glowColor', value)}
                />
                <ColorInput
                  label="Assistant Text"
                  value={form.assistantTextColor}
                  onChange={(value) => handleInputChange('assistantTextColor', value)}
                />
                <ColorInput
                  label="Assistant Bubble"
                  value={form.assistantBubbleColor}
                  onChange={(value) => handleInputChange('assistantBubbleColor', value)}
                />
                <ColorInput
                  label="User Text"
                  value={form.userTextColor}
                  onChange={(value) => handleInputChange('userTextColor', value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Live Preview</h2>
                <Eye className="w-5 h-5 text-violet-400" />
              </div>

              <div className="bg-neutral-800 rounded-lg p-8 min-h-[600px] relative overflow-hidden">
                <div
                  className="absolute -left-20 -top-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
                  style={{ background: form.glowColor }}
                />
                <div
                  className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
                  style={{ background: form.glowColor }}
                />

                <div
                  className="relative z-10 max-w-sm mx-auto rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: form.backgroundColor }}
                >
                  <div
                    className="p-4 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${form.primaryColor}, ${form.gradientStart})`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt={form.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {form.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{form.name}</h3>
                        <p className="text-xs opacity-90">Chat Assistant</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 min-h-[300px]">
                    {form.requireUserInfo ? (
                      <div className="space-y-3">
                        <div className="text-xs text-center" style={{ color: form.assistantTextColor }}>
                          Please provide your information to start chatting
                        </div>
                        {form.requireName && (
                          <input
                            type="text"
                            placeholder="Name"
                            disabled
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              borderColor: 'rgba(255,255,255,0.3)',
                              color: form.assistantTextColor
                            }}
                          />
                        )}
                        {form.requireEmail && (
                          <input
                            type="email"
                            placeholder="Email"
                            disabled
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              borderColor: 'rgba(255,255,255,0.3)',
                              color: form.assistantTextColor
                            }}
                          />
                        )}
                        {form.requirePhone && (
                          <input
                            type="tel"
                            placeholder="Phone"
                            disabled
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              borderColor: 'rgba(255,255,255,0.3)',
                              color: form.assistantTextColor
                            }}
                          />
                        )}
                        <button
                          disabled
                          className="w-full py-2 rounded-lg text-sm font-semibold text-white"
                          style={{
                            background: `linear-gradient(to right, ${form.gradientStart}, ${form.gradientEnd})`
                          }}
                        >
                          Start Chat
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs" style={{ color: form.assistantTextColor }}>
                            <span>{form.name}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>12:10 PM</span>
                          </div>
                          <div
                            className="px-4 py-2 rounded-lg max-w-[85%] text-sm"
                            style={{
                              background: form.assistantBubbleColor,
                              color: form.assistantTextColor
                            }}
                          >
                            {form.greeting || "Hi! How can I help you today?"}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 items-end">
                          <div className="flex items-center gap-2 text-xs" style={{ color: form.userTextColor }}>
                            <span>You</span>
                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>12:12 PM</span>
                          </div>
                          <div
                            className="px-4 py-2 rounded-lg max-w-[85%] text-sm"
                            style={{
                              background: form.userBubbleColor,
                              color: form.userTextColor
                            }}
                          >
                            This is a preview message
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 border-t border-neutral-700">
                    <div className="flex gap-2 items-center px-3 py-2 bg-black/20 border border-neutral-600 rounded-lg">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-white text-sm outline-none"
                        disabled
                      />
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(to right, ${form.gradientStart}, ${form.gradientEnd})`
                        }}
                      >
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <UploadModal
          title="Upload Avatar"
          previewUrl={previewUrl}
          croppedBlob={croppedImageBlob}
          uploading={uploadingAvatar}
          onFileSelect={(e) => handleFileSelect(e, 'avatar')}
          onUpload={() => handleImageUpload('avatar')}
          onReCrop={handleReCrop}
          onClose={closeUploadModal}
        />
      )}

      {showLogoModal && (
        <UploadModal
          title="Upload Logo"
          previewUrl={previewUrl}
          croppedBlob={croppedImageBlob}
          uploading={uploadingLogo}
          onFileSelect={(e) => handleFileSelect(e, 'logo')}
          onUpload={() => handleImageUpload('logo')}
          onReCrop={handleReCrop}
          onClose={closeUploadModal}
        />
      )}

      {showCropModal && originalImageUrl && (
        <ImageCropper
          imageSrc={originalImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          cropType={cropType === 'avatar' ? 'square' : 'square'}
        />
      )}
    </div>
  );
};

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="text-stone-300 text-sm font-medium mb-2 block">{label}</label>
    <div className="flex gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 rounded-lg cursor-pointer border border-neutral-600"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 bg-black/30 border border-neutral-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
      />
    </div>
  </div>
);

const UploadModal: React.FC<{
  title: string;
  previewUrl: string | null;
  croppedBlob: Blob | null;
  uploading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onReCrop: () => void;
  onClose: () => void;
}> = ({ title, previewUrl, croppedBlob, uploading, onFileSelect, onUpload, onReCrop, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {!croppedBlob && (
          <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-400">Click to select an image</span>
              <span className="text-xs text-gray-500">Max file size: 10MB</span>
            </label>
          </div>
        )}

        {previewUrl && croppedBlob && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />
            </div>

            <button
              onClick={onReCrop}
              className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Crop Again
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-3 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!croppedBlob || uploading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white rounded-lg hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  </div>
);
