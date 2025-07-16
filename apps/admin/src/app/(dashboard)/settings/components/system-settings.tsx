'use client'

import { useState, useEffect } from "react";
import { Button } from "@nlc-ai/ui";
import { Check, ExternalLink, Settings, Trash2, Plus, AlertCircle } from "lucide-react";
import { calendlyAPI } from "@nlc-ai/api-client";
import {CalendlySettings} from "@nlc-ai/types";
import {CalendlyTokenForm} from "@/app/(dashboard)/settings/components/calendly-token.form";

export default function SystemSettings() {
  const [calendlySettings, setCalendlySettings] = useState<CalendlySettings>({
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTokenForm, setShowTokenForm] = useState(false);

  useEffect(() => {
    loadCalendlySettings();
  }, []);

  const loadCalendlySettings = async () => {
    try {
      setIsInitialLoading(true);
      const data = await calendlyAPI.getSettings();
      setCalendlySettings(data);
    } catch (error: any) {
      console.error('Failed to load Calendly settings:', error);
      setError('Failed to load Calendly settings');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCalendlyConnect = async (accessToken: string) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await calendlyAPI.saveSettings(accessToken);

      if (result.success) {
        setCalendlySettings(result.data);
        setSuccess("Calendly account connected successfully!");
        setShowTokenForm(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(result.message || 'Failed to connect Calendly account');
      }
    } catch (error: any) {
      console.error('Failed to connect Calendly:', error);
      setError(error.message || "Failed to connect Calendly account");
      setTimeout(() => setError(""), 5000);
      throw error; // Re-throw so the form can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalendlyDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Calendly account? This will remove all calendar integration.')) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const result = await calendlyAPI.deleteSettings();

      if (result.success) {
        setCalendlySettings({ isConnected: false });
        setSuccess("Calendly account disconnected successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(result.message || 'Failed to disconnect Calendly account');
      }
    } catch (error: any) {
      console.error('Failed to disconnect Calendly:', error);
      setError(error.message || "Failed to disconnect Calendly account");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const openCalendlySettings = () => {
    if (calendlySettings.schedulingUrl) {
      window.open(calendlySettings.schedulingUrl, '_blank');
    }
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Test the connection by trying to get current user
      await calendlyAPI.getCurrentUser();
      setSuccess("Calendly connection is working properly!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error('Calendly connection test failed:', error);
      setError(`Connection test failed: ${error.message}`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-[#A0A0A0]">Manage your platform integrations and system configurations</p>
        </div>
        <div className="animate-pulse">
          <div className="bg-[#2A2A2A] h-64 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-800/20 border border-green-600 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
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
                      <li>Go to your <a href="https://calendly.com/app/settings/developer" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">Calendly account settings</a></li>
                      <li>Navigate to "Integrations" → "API & Webhooks"</li>
                      <li>Generate a Personal Access Token</li>
                      <li>Copy the token and paste it when prompted below</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowTokenForm(true)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Connect Calendly Account
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Account Info */}
              <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {calendlySettings.userName?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{calendlySettings.userName || 'Calendly User'}</div>
                      <div className="text-[#A0A0A0] text-sm">{calendlySettings.userEmail || 'No email available'}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Button
                      onClick={testConnection}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-blue-500 transition-colors"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Test
                    </Button>
                    <Button
                      onClick={openCalendlySettings}
                      variant="outline"
                      size="sm"
                      className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
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
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2A2A2A]/30 border border-[#3A3A3A] rounded-lg p-4">
                  <div className="text-[#A0A0A0] text-sm mb-1">Scheduling URL</div>
                  <div className="text-white text-sm flex items-center gap-2">
                    <span className="truncate flex-1">{calendlySettings.schedulingUrl || 'Not available'}</span>
                    {calendlySettings.schedulingUrl && (
                      <ExternalLink
                        className="w-4 h-4 cursor-pointer hover:text-violet-400 transition-colors flex-shrink-0"
                        onClick={openCalendlySettings}
                      />
                    )}
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

              {/* Additional Settings */}
              <div className="hidden sm:block bg-[#2A2A2A]/30 border border-[#3A3A3A] rounded-lg p-4">
                <div className="text-white text-sm font-medium mb-2">Integration Details</div>
                <div className="space-y-2 text-xs text-[#A0A0A0]">
                  <div className="flex justify-between">
                    <span>User URI:</span>
                    <span className="text-white font-mono">{calendlySettings.userUri?.split('/').pop() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organization:</span>
                    <span className="text-white font-mono">{calendlySettings.organizationUri?.split('/').pop() || 'N/A'}</span>
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

      {/* Token Input Form */}
      <CalendlyTokenForm
        isOpen={showTokenForm}
        onSubmit={handleCalendlyConnect}
        onClose={() => setShowTokenForm(false)}
        isLoading={isLoading}
      />
    </div>
  );
}
