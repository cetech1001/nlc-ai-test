'use client'

import {useEffect, useState} from "react";
import { Eye } from "lucide-react";
import {SettingsPageSkeleton} from "@/lib/skeletons/settings-page.skeleton";
import { Button, EyeLashIcon } from "@nlc-ai/ui";
import { authAPI, useAuth } from "@nlc-ai/auth";
import {UserType} from "@nlc-ai/types";
import SystemSettings from "./components/system-settings";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function Settings() {
  const {user, isLoading, checkAuthStatus} = useAuth();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("edit-profile");

  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const validateProfileForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profileForm.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (profileForm.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(profileForm.firstName)) {
      newErrors.firstName = "First name can only contain letters and spaces";
    }

    if (!profileForm.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (profileForm.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(profileForm.lastName)) {
      newErrors.lastName = "Last name can only contain letters and spaces";
    }

    if (!profileForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

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
    setProfileForm(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setProfileLoading(true);
    setSuccessMessage("");

    try {
      await authAPI.updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        desktopNotifications,
        emailNotifications,
      });

      setSuccessMessage("Profile updated successfully!");
      await checkAuthStatus(UserType.admin);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrors({
        email: error.message === "Email already exists" ? "This email is already in use" : "Failed to update profile"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleResetProfile = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setDesktopNotifications(false);
      setEmailNotifications(true);
      setErrors({});
      setSuccessMessage("");
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    setSuccessMessage("");

    try {
      await authAPI.updatePassword({
        newPassword: passwordForm.newPassword,
      });

      setSuccessMessage("Password updated successfully!");
      setPasswordForm({newPassword: "", confirmPassword: ""});

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrors({
        newPassword: error.message || "Failed to update password"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = () => {
    setPasswordForm({newPassword: "", confirmPassword: ""});
    setErrors({});
    setSuccessMessage("");
  };

  if (isLoading) {
    return <SettingsPageSkeleton/>;
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black overflow-hidden">
      {successMessage && (
        <div className="mb-6 p-4 bg-green-800/20 border border-green-600 rounded-lg">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8 sm:mb-16">
        <button
          onClick={() => setActiveTab("edit-profile")}
          className={`text-lg sm:text-xl font-medium font-['Inter'] leading-relaxed transition-colors ${
            activeTab === "edit-profile" ? "text-fuchsia-400" : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          Edit Profile
        </button>
        <div className="hidden sm:block w-7 h-0 rotate-90 border-t border-neutral-700"/>
        <button
          onClick={() => setActiveTab("system-settings")}
          className={`text-lg sm:text-xl font-medium font-['Inter'] leading-relaxed transition-colors ${
            activeTab === "system-settings" ? "text-fuchsia-400" : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          System Settings
        </button>
      </div>

      {activeTab === "edit-profile" && (
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-8 lg:mb-16">
            <img className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] mx-auto lg:mx-0" src="https://placehold.co/130x130"
                 alt="Profile"/>
            <div className="w-full lg:w-60 flex flex-col gap-3 text-center lg:text-left">
              <div className="text-stone-50 text-2xl sm:text-3xl font-semibold font-['Inter'] leading-relaxed">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-stone-300 text-sm sm:text-base font-normal font-['Inter']">
                {user?.email}
              </div>
            </div>
            <div className="hidden lg:block w-32 h-0 rotate-90 border-t border-neutral-700"/>
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
                    <div className="w-6 h-6 bg-white rounded-full"/>
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
                    <div className="w-6 h-6 bg-white rounded-full"/>
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

          <div className="mb-8">
            <div className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] leading-relaxed mb-4 sm:mb-6">
              Basic Details
            </div>
            <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-7 mb-6 lg:mb-8">
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  First name<span className="text-red-600">*</span>
                </div>
                <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
                  errors.firstName ? "border-red-500" : "border-white/30"
                } flex justify-between items-center`}>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    name="firstName"
                    onChange={(e) => handleProfileInputChange("firstName", e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Last name<span className="text-red-600">*</span>
                </div>
                <div className={`h-12 px-5 py-2.5 rounded-[10px] border ${
                  errors.lastName ? "border-red-500" : "border-white/30"
                } flex justify-between items-center`}>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    name="lastName"
                    onChange={(e) => handleProfileInputChange("lastName", e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Email<span className="text-red-600">*</span>
                </div>
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
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <Button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="w-full sm:w-44 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50"
              >
                <div className="text-white text-base font-semibold font-['Inter'] leading-normal">
                  {profileLoading ? "Saving..." : "Save Changes"}
                </div>
              </Button>
              <Button
                onClick={handleResetProfile}
                disabled={profileLoading}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-white flex justify-center items-center disabled:opacity-50"
              >
                <div className="text-white text-base font-medium font-['Inter'] leading-normal">Reset</div>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-[1094px] h-0 border-t border-neutral-700 mb-6 lg:mb-8"/>

          <div>
            <div
              className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] leading-relaxed mb-4 sm:mb-6">Change
              Password
            </div>
            <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-7 mb-6 lg:mb-8">
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  New Password<span className="text-red-600">*</span>
                </div>
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
                    className="w-6 h-6 text-stone-50 ml-2"
                  >
                    {showNewPassword ? <Eye className="w-5 h-4"/> : <EyeLashIcon className="w-5 h-4"/>}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Confirm New Password<span className="text-red-600">*</span>
                </div>
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
                    className="w-6 h-6 text-stone-50 ml-2"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-4"/> : <EyeLashIcon className="w-5 h-4"/>}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <Button
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className="w-full sm:w-auto px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50"
              >
                <div className="text-white text-base font-semibold font-['Inter'] leading-normal">
                  {passwordLoading ? "Updating..." : "Update Password"}
                </div>
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={passwordLoading}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-white flex justify-center items-center disabled:opacity-50"
              >
                <div className="text-white text-base font-medium font-['Inter'] leading-normal">Reset</div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "system-settings" && (
        <SystemSettings/>
      )}
    </div>
  );
}
