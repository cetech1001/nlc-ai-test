'use client'

import { useState, useEffect } from "react";
import { Button } from "@nlc-ai/ui";
import { Check, ExternalLink, Settings, Trash2, Plus, AlertCircle } from "lucide-react";

interface CalendlySettings {
  accessToken?: string;
  userUri?: string;
  organizationUri?: string;
  schedulingUrl?: string;
  isConnected: boolean;
  userName?: string;
  userEmail?: string;
}

export default function SystemSettings() {
  const [calendlySettings, setCalendlySettings] = useState<CalendlySettings>({
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCalendlySettings();
  }, []);

  const loadCalendlySettings = async () => {
    try {
      const response = await fetch('/api/system-settings/calendly', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCalendlySettings(data);
      }
    } catch (error) {
      console.error('Failed to load Calendly settings:', error);
    }
  };

  const handleCalendlyConnect = async () => {
    setIsLoading(true);
    setError("");

    try {
      const accessToken = prompt("Enter your Calendly Personal Access Token:");

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/system-settings/calendly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ accessToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to connect Calendly account');
      }

      setCalendlySettings(result.data);
      setSuccess("Calendly account connected successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to connect Calendly account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalendlyDisconnect = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/system-settings/calendly', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setCalendlySettings({ isConnected: false });
        setSuccess("Calendly account disconnected");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError("Failed to disconnect Calendly account");
    } finally {
      setIsLoading(false);
    }
  };

  const openCalendlySettings = () => {
    if (calendlySettings.schedulingUrl) {
      window.open(calendlySettings.schedulingUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-800/20 border border-green-600 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-[#A0A0A0]">Manage your platform integrations and system configurations</p>
      </div>

      {/* Calendly Integration Card */}
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>

        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Calendly Integration</h3>
                <p className="text-[#A0A0A0] text-sm">
                  Connect your Calendly account to sync events with your calendar
                </p>
              </div>
            </div>

            {calendlySettings.isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
            )}
          </div>

          {!calendlySettings.isConnected ? (
            <div className="space-y-6">
              {/* Setup Instructions */}
              <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-2">How to connect your Calendly account</h4>
                    <ol className="text-[#A0A0A0] text-sm space-y-2 list-decimal list-inside">
                      <li>Go to your <a href="https://calendly.com/app/settings/developer" target="_blank" className="text-violet-400 hover:text-violet-300 underline">Calendly account settings</a></li>
                      <li>Navigate to "Integrations" → "API & Webhooks"</li>
                      <li>Generate a Personal Access Token</li>
                      <li>Copy the token and paste it when prompted below</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCalendlyConnect}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Connect Calendly Account
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Account Info */}
              <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {calendlySettings.userName?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{calendlySettings.userName}</div>
                      <div className="text-[#A0A0A0] text-sm">{calendlySettings.userEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={openCalendlySettings}
                      variant="outline"
                      size="sm"
                      className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-500 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      onClick={handleCalendlyDisconnect}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2A2A2A]/30 border border-[#3A3A3A] rounded-lg p-4">
                  <div className="text-[#A0A0A0] text-sm mb-1">Scheduling URL</div>
                  <div className="text-white text-sm flex items-center gap-2">
                    <span className="truncate flex-1">{calendlySettings.schedulingUrl}</span>
                    <ExternalLink
                      className="w-4 h-4 cursor-pointer hover:text-violet-400 transition-colors flex-shrink-0"
                      onClick={openCalendlySettings}
                    />
                  </div>
                </div>
                <div className="bg-[#2A2A2A]/30 border border-[#3A3A3A] rounded-lg p-4">
                  <div className="text-[#A0A0A0] text-sm mb-1">Connection Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Active & Syncing</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Future Integrations Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Other Integrations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Google Calendar", status: "Coming Soon", icon: "📅", color: "from-blue-500 to-blue-600" },
            { name: "Zoom", status: "Coming Soon", icon: "📹", color: "from-blue-600 to-purple-600" },
            { name: "Slack", status: "Coming Soon", icon: "💬", color: "from-green-500 to-teal-600" },
            { name: "Email Provider", status: "Coming Soon", icon: "📧", color: "from-orange-500 to-red-600" },
            { name: "Stripe", status: "Coming Soon", icon: "💳", color: "from-purple-500 to-purple-600" },
            { name: "Analytics", status: "Coming Soon", icon: "📊", color: "from-pink-500 to-rose-600" }
          ].map((integration) => (
            <div key={integration.name} className="relative group opacity-60 hover:opacity-80 transition-opacity">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>

              <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${integration.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{integration.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{integration.name}</div>
                    <div className="text-[#A0A0A0] text-xs">{integration.status}</div>
                  </div>
                  <div className="w-8 h-8 border border-[#3A3A3A] rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-[#666]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
