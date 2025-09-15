import { FC, useState, useEffect } from 'react';
import {
  Camera,
  Eye,
  EyeOff,
  X,
  Upload,
  RotateCw,
} from 'lucide-react';
import { useSettings } from '../context/settings.context';
import { ProfileFormData, PasswordFormData, ProfileFormErrors } from '../types/settings.types';
import { ProfileSectionSkeleton } from "./skeletons";
import { ImageCropper } from "./partials/image-cropper";
import {UserType} from "@nlc-ai/types";

interface ProfileSectionProps {
  onUpdateProfile: (data: ProfileFormData) => Promise<void>;
  onUpdatePassword: (data: PasswordFormData) => Promise<void>;
  onUploadAvatar: (data: FormData) => Promise<void>;
}

export const ProfileSection: FC<ProfileSectionProps> = ({
  onUpdateProfile,
  onUpdatePassword,
  onUploadAvatar,
}) => {
  const { user, userType, isLoading, setSuccess, setError } = useSettings();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [_, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null); // Store original image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);

  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    businessName: '',
    phone: '',
    websiteUrl: '',
    timezone: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  useEffect(() => {
    if (user) {
      resetFormState();
    }
  }, [user]);

  const validateProfileForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    if (!profileForm.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (profileForm.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!profileForm.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (profileForm.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!profileForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (userType === 'coach' && profileForm.websiteUrl && profileForm.websiteUrl.trim()) {
      try {
        new URL(profileForm.websiteUrl);
      } catch {
        newErrors.websiteUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(passwordForm.newPassword)) {
      newErrors.newPassword = "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ProfileFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ProfileFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please select a valid image file' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Image size must be less than 10MB' }));
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImageUrl(result);
      setPreviewUrl(result);
      setShowUploadModal(false);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    setErrors(prev => ({ ...prev, photo: undefined }));
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob);
    setShowCropModal(false);
    setShowUploadModal(true);

    const croppedUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(croppedUrl);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCroppedImageBlob(null);
    setOriginalImageUrl(null);
    setErrors(prev => ({ ...prev, photo: undefined }));
  };

  const handleReCrop = () => {
    if (originalImageUrl) {
      setShowUploadModal(false);
      setShowCropModal(true);
      setPreviewUrl(originalImageUrl);
    }
  };

  const handlePhotoUpload = async () => {
    if (!croppedImageBlob) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      const croppedFile = new File([croppedImageBlob], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      formData.append('avatar', croppedFile);

      await onUploadAvatar(formData);
      closeUploadModal();
      setSuccess('Profile photo updated successfully!');
    } catch (error: any) {
      setErrors(prev => ({ ...prev, photo: error.message || "Failed to upload photo" }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCroppedImageBlob(null);
    setOriginalImageUrl(null);
    setErrors(prev => ({ ...prev, photo: undefined }));
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setProfileLoading(true);
    try {
      let payload = {
        email: profileForm.email,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
      }

      if (userType === UserType.COACH) {
        payload = {
          ...profileForm,
        }
      }

      await onUpdateProfile(payload);
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        setErrors({
          email: 'This email is already in use',
        });
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleResetProfile = () => {
    if (user) {
      resetFormState();
      setErrors({});
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      await onUpdatePassword(passwordForm);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully!');
    } catch (error: any) {
      setError('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = () => {
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setErrors({});
  };

  const resetFormState = () => {
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      businessName: user.businessName || '',
      phone: user.phone || '',
      websiteUrl: user.websiteUrl || '',
      timezone: user.timezone || '',
    });
    setDesktopNotifications(user.desktopNotifications || false);
    setEmailNotifications(user.emailNotifications || true);
  }

  if (isLoading) {
    return <ProfileSectionSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-8 lg:mb-16">
        <div className="relative group mx-auto lg:mx-0">
          <img
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] object-cover"
            src={user?.avatarUrl || "https://placehold.co/130x130"}
            alt="Profile"
          />
          <div
            className="absolute inset-0 bg-black/50 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
            onClick={() => setShowUploadModal(true)}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="w-full lg:w-60 flex flex-col gap-3 text-center lg:text-left">
          <div className="text-stone-50 text-2xl sm:text-3xl font-semibold font-['Inter'] leading-relaxed">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-stone-300 text-sm sm:text-base font-normal font-['Inter']">
            {user?.email}
          </div>
        </div>

        <div className="hidden lg:block w-32 h-0 rotate-90 border-t border-neutral-700" />

        <div className="w-full lg:w-80 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div className="text-stone-50 text-sm sm:text-base font-normal font-['Inter']">
              Desktop Notifications
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setDesktopNotifications(!desktopNotifications)}
                className={`w-16 p-1 rounded-[100px] border transition-colors ${
                  desktopNotifications
                    ? "bg-fuchsia-400 border-fuchsia-400 justify-end"
                    : "bg-stone-300 border-stone-300 justify-start"
                } flex items-center`}
              >
                <div className="w-6 h-6 bg-white rounded-full" />
              </button>
              <div className={`text-sm sm:text-base font-normal font-['Inter'] ${
                desktopNotifications ? "text-white" : "text-zinc-500"
              }`}>
                {desktopNotifications ? "On" : "Off"}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-stone-50 text-sm sm:text-base font-normal font-['Inter']">
              Email Notifications
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-16 p-1 rounded-[100px] border transition-colors ${
                  emailNotifications
                    ? "bg-fuchsia-400 border-fuchsia-400 justify-end"
                    : "bg-stone-300 border-stone-300 justify-start"
                } flex items-center`}
              >
                <div className="w-6 h-6 bg-white rounded-full" />
              </button>
              <div className={`text-sm sm:text-base font-normal font-['Inter'] ${
                emailNotifications ? "text-white" : "text-zinc-500"
              }`}>
                {emailNotifications ? "On" : "Off"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Profile Photo</h3>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!croppedImageBlob && (
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
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

              {previewUrl && croppedImageBlob && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 rounded-[20px] object-cover"
                    />
                  </div>

                  <button
                    onClick={handleReCrop}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Crop Again
                  </button>
                </div>
              )}

              {errors.photo && (
                <p className="text-red-400 text-sm">{errors.photo}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeUploadModal}
                  disabled={uploadingPhoto}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/30 flex justify-center items-center text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhotoUpload}
                  disabled={!croppedImageBlob || uploadingPhoto}
                  className="flex-1 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {uploadingPhoto ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCropModal && originalImageUrl && (
        <ImageCropper
          imageSrc={originalImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="mb-8">
        <div className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] leading-relaxed mb-4 sm:mb-6">
          Basic Details
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="flex flex-col gap-3">
            <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
              First name<span className="text-red-600">*</span>
            </label>
            <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
              errors.firstName ? "border-red-500" : "border-white/30"
            } flex justify-between items-center`}>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => handleProfileInputChange("firstName", e.target.value)}
                className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                placeholder="Enter first name"
              />
            </div>
            {errors.firstName && (
              <p className="text-red-400 text-sm">{errors.firstName}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
              Last name<span className="text-red-600">*</span>
            </label>
            <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
              errors.lastName ? "border-red-500" : "border-white/30"
            } flex justify-between items-center`}>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => handleProfileInputChange("lastName", e.target.value)}
                className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                placeholder="Enter last name"
              />
            </div>
            {errors.lastName && (
              <p className="text-red-400 text-sm">{errors.lastName}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
              Email<span className="text-red-600">*</span>
            </label>
            <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
              errors.email ? "border-red-500" : "border-white/30"
            } flex justify-between items-center`}>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => handleProfileInputChange("email", e.target.value)}
                className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email}</p>
            )}
          </div>

          {userType === 'coach' && (
            <>
              <div className="flex flex-col gap-3">
                <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Business Name
                </label>
                <div className="h-12 px-5 py-2.5 rounded-[10px] border border-white/30 flex justify-between items-center">
                  <input
                    type="text"
                    value={profileForm.businessName || ''}
                    onChange={(e) => handleProfileInputChange("businessName", e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Phone
                </label>
                <div className="h-12 px-5 py-2.5 rounded-[10px] border border-white/30 flex justify-between items-center">
                  <input
                    type="tel"
                    value={profileForm.phone || ''}
                    onChange={(e) => handleProfileInputChange("phone", e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Website URL
                </label>
                <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
                  errors.websiteUrl ? "border-red-500" : "border-white/30"
                } flex justify-between items-center`}>
                  <input
                    type="url"
                    value={profileForm.websiteUrl || ''}
                    onChange={(e) => handleProfileInputChange("websiteUrl", e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                {errors.websiteUrl && (
                  <p className="text-red-400 text-sm">{errors.websiteUrl}</p>
                )}
              </div>
            </>
          )}
        </div>

        {userType === 'coach' && (
          <div className="mb-6 lg:mb-8">
            <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed mb-3 block">
              Bio
            </label>
            <div className="rounded-[10px] border border-white/30 p-4">
              <textarea
                value={profileForm.bio || ''}
                onChange={(e) => handleProfileInputChange("bio", e.target.value)}
                className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none w-full h-32 resize-none"
                placeholder="Tell your clients about yourself, your coaching philosophy, and what makes you unique..."
              />
            </div>
            <p className="text-stone-400 text-xs mt-2">
              This bio will be visible to your clients and prospects.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <button
            onClick={handleSaveProfile}
            disabled={profileLoading}
            className="w-full sm:w-44 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 transition-opacity"
          >
            <div className="text-white text-base font-semibold font-['Inter'] leading-normal">
              {profileLoading ? "Saving..." : "Save Changes"}
            </div>
          </button>
          <button
            onClick={handleResetProfile}
            disabled={profileLoading}
            className="w-full sm:w-auto px-4 py-3 rounded-lg border border-white flex justify-center items-center disabled:opacity-50 transition-opacity hover:bg-white/5"
          >
            <div className="text-white text-base font-medium font-['Inter'] leading-normal">Reset</div>
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1094px] h-0 border-t border-neutral-700 mb-6 lg:mb-8" />

      <div>
        <div className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] leading-relaxed mb-4 sm:mb-6">
          Change Password
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="flex flex-col gap-3">
            <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
              New Password<span className="text-red-600">*</span>
            </label>
            <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
              errors.newPassword ? "border-red-500" : "border-white/30"
            } flex justify-between items-center`}>
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                placeholder="Enter new password"
                className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight placeholder:text-stone-50 placeholder:opacity-50 outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="w-6 h-6 text-stone-50 ml-2 hover:text-stone-300 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-4" /> : <Eye className="w-5 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-sm">{errors.newPassword}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
              Confirm New Password<span className="text-red-600">*</span>
            </label>
            <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
              errors.confirmPassword ? "border-red-500" : "border-white/30"
            } flex justify-between items-center`}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                placeholder="Re-enter new password"
                className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight placeholder:text-stone-50 placeholder:opacity-50 outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="w-6 h-6 text-stone-50 ml-2 hover:text-stone-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-4" /> : <Eye className="w-5 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <button
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
            className="w-full sm:w-auto px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 transition-opacity"
          >
            <div className="text-white text-base font-semibold font-['Inter'] leading-normal">
              {passwordLoading ? "Updating..." : "Update Password"}
            </div>
          </button>
          <button
            onClick={handleResetPassword}
            disabled={passwordLoading}
            className="w-full sm:w-auto px-4 py-3 rounded-lg border border-white flex justify-center items-center disabled:opacity-50 transition-opacity hover:bg-white/5"
          >
            <div className="text-white text-base font-medium font-['Inter'] leading-normal">Reset</div>
          </button>
        </div>
      </div>
    </div>
  );
};
