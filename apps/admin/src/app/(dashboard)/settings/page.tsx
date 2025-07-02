'use client'

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [name, setName] = useState("Andrew Kramer");
  const [email, setEmail] = useState("kramer.andrew@email.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("edit-profile");

  const handleSaveChanges = () => {
    console.log("Saving changes:", {
      name,
      email,
      desktopNotifications,
      emailNotifications,
    });
  };

  const handleResetProfile = () => {
    setName("Andrew Kramer");
    setEmail("kramer.andrew@email.com");
    setDesktopNotifications(false);
    setEmailNotifications(true);
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    console.log("Updating password");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = () => {
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black overflow-hidden">

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8 sm:mb-16">
        <button
          onClick={() => setActiveTab("edit-profile")}
          className={`text-lg sm:text-xl font-medium font-['Inter'] leading-relaxed ${
            activeTab === "edit-profile" ? "text-fuchsia-400" : "text-zinc-600"
          }`}
        >
          Edit Profile
        </button>
        <div className="hidden sm:block w-7 h-0 rotate-90 border-t border-neutral-700" />
        <button
          onClick={() => setActiveTab("social-accounts")}
          className={`text-lg sm:text-xl font-medium font-['Inter'] leading-relaxed ${
            activeTab === "social-accounts" ? "text-fuchsia-400" : "text-zinc-600"
          }`}
        >
          Social Accounts Integration
        </button>
      </div>

      {activeTab === "edit-profile" && (
        <div>
          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-8 lg:mb-16">
            <img className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] mx-auto lg:mx-0" src="https://placehold.co/130x130" alt="Profile" />
            <div className="w-full lg:w-60 flex flex-col gap-3 text-center lg:text-left">
              <div className="text-stone-50 text-2xl sm:text-3xl font-semibold font-['Inter'] leading-relaxed">Andrew Kramer</div>
              <div className="text-stone-300 text-sm sm:text-base font-normal font-['Inter']">kramer.andrew@email.com</div>
              <div className="text-stone-300 text-sm sm:text-base font-normal font-['Inter']">4 Social Account Linked</div>
            </div>
            <div className="hidden lg:block w-32 h-0 rotate-90 border-t border-neutral-700" />
            <div className="w-full lg:w-80 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div className="text-stone-50 text-sm sm:text-base font-normal font-['Inter']">Desktop Notifications</div>
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
                  <div className={`text-lg font-normal font-['Inter'] ${
                    desktopNotifications ? "text-white" : "text-zinc-500"
                  }`}>
                    {desktopNotifications ? "On" : "Off"}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-stone-50 text-sm sm:text-base font-normal font-['Inter']">Email Notifications</div>
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
                  <div className={`text-lg font-normal font-['Inter'] ${
                    emailNotifications ? "text-white" : "text-zinc-500"
                  }`}>
                    {emailNotifications ? "On" : "Off"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="mb-8">
            <div className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] leading-relaxed mb-4 sm:mb-6">Basic Details</div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-6 lg:mb-8">
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Name<span className="text-red-600">*</span>
                </div>
                <div className="h-12 px-5 py-2.5 rounded-[10px] border border-white/30 flex justify-between items-center">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                  />
                </div>
              </div>
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Email<span className="text-red-600">*</span>
                </div>
                <div className="h-12 px-5 py-2.5 rounded-[10px] border border-white/30 flex justify-between items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight outline-none flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <button
                onClick={handleSaveChanges}
                className="w-full sm:w-44 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center"
              >
                <div className="text-white text-base font-semibold font-['Inter'] leading-normal">Save Changes</div>
              </button>
              <button
                onClick={handleResetProfile}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-white flex justify-center items-center"
              >
                <div className="text-white text-base font-medium font-['Inter'] leading-normal">Reset</div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full max-w-[1094px] h-0 border-t border-neutral-700 mb-6 lg:mb-8" />

          {/* Change Password */}
          <div>
            <div className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] leading-relaxed mb-4 sm:mb-6">Change Password</div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-6 lg:mb-8">
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  New Password<span className="text-red-600">*</span>
                </div>
                <div className="h-12 px-5 py-2.5 rounded-[10px] border border-white/30 flex justify-between items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight placeholder:text-stone-50 placeholder:opacity-50 outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="w-6 h-6 text-stone-50"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-4" /> : <Eye className="w-5 h-4" />}
                  </button>
                </div>
              </div>
              <div className="w-full lg:w-[532px] flex flex-col gap-3">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Confirm New Password<span className="text-red-600">*</span>
                </div>
                <div className="h-12 px-5 py-2.5 rounded-[10px] border border-white/30 flex justify-between items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="bg-transparent text-stone-50 text-base font-medium font-['Inter'] leading-tight placeholder:text-stone-50 placeholder:opacity-50 outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="w-6 h-6 text-stone-50 opacity-0"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-1.5" /> : <Eye className="w-3.5 h-1.5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <button
                onClick={handleUpdatePassword}
                className="w-full sm:w-auto px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center"
              >
                <div className="text-white text-base font-semibold font-['Inter'] leading-normal">Update Password</div>
              </button>
              <button
                onClick={handleResetPassword}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-white flex justify-center items-center"
              >
                <div className="text-white text-base font-medium font-['Inter'] leading-normal">Reset</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "social-accounts" && (
        <div className="text-center py-8 sm:py-16">
          <div className="text-stone-50 text-xl sm:text-2xl font-medium font-['Inter'] mb-4">Social Accounts Integration</div>
          <div className="text-stone-300 text-sm sm:text-base">Social accounts integration features coming soon.</div>
        </div>
      )}
    </div>
  );
};
