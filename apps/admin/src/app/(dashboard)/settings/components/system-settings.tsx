'use client'

import { useState, useEffect } from "react";
import { Button } from "@nlc-ai/ui";
import { Check, ExternalLink, Settings, Trash2 } from "lucide-react";

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
      // Load saved settings from your backend or localStorage
      const saved = localStorage.getItem('calendly_settings');
      if (saved) {
        setCalendlySettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load Calendly settings:', error);
    }
  };

  const handleCalendlyConnect = async () => {
    setIsLoading(true);
    setError("");

    try {
      // In production, this would initiate OAuth flow
      // For now, we'll simulate with a prompt for access token
      const accessToken = prompt("Enter your Calendly Personal Access Token:");

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Test the connection
      const response = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid access token or API error');
      }

      const userData = await response.json();
      const user = userData.resource;

      const settings: CalendlySettings = {
        accessToken,
        userUri: user.uri,
        organizationUri: user.current_organization,
        schedulingUrl: user.scheduling_url,
        isConnected: true,
        userName: user.name,
        userEmail: user.email
      };

      // Save to backend/localStorage
      localStorage.setItem('calendly_settings', JSON.stringify(settings));
      setCalendlySettings(settings);
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
      localStorage.removeItem('calendly_settings');
      setCalendlySettings({ isConnected: false });
      setSuccess("Calendly account disconnected");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to disconnect Calendly account");
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

      {/* Calendly Integration Section */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">Calendly Integration</h3>
            <p className="text-[#A0A0A0] text-sm">
              Connect your Calendly account to sync events with your calendar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {calendlySettings.isConnected && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Check className="w-4 h-4" />
                Connected
              </div>
            )}
          </div>
        </div>

        {!calendlySettings.isConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <h4 className="text-white text-sm font-medium mb-2">How to connect:</h4>
              <ol className="text-[#A0A0A0] text-sm space-y-1 list-decimal list-inside">
                <li>Go to your Calendly account settings</li>
                <li>Navigate to "Integrations" → "API & Webhooks"</li>
                <li>Generate a Personal Access Token</li>
                <li>Copy the token and paste it when prompted</li>
              </ol>
            </div>

            <Button
              onClick={handleCalendlyConnect}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#7B21BA] to-[#B339D4] hover:from-[#8B31CA] hover:to-[#C349E4] text-white"
            >
              {isLoading ? "Connecting..." : "Connect Calendly Account"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-lg">
              <div>
                <div className="text-white font-medium">{calendlySettings.userName}</div>
                <div className="text-[#A0A0A0] text-sm">{calendlySettings.userEmail}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={openCalendlySettings}
                  variant="outline"
                  size="sm"
                  className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={handleCalendlyDisconnect}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#2A2A2A] rounded">
                <div className="text-[#A0A0A0] mb-1">Scheduling URL</div>
                <div className="text-white flex items-center gap-2">
                  <span className="truncate">{calendlySettings.schedulingUrl}</span>
                  <ExternalLink
                    className="w-4 h-4 cursor-pointer hover:text-[#7B21BA]"
                    onClick={openCalendlySettings}
                  />
                </div>
              </div>
              <div className="p-3 bg-[#2A2A2A] rounded">
                <div className="text-[#A0A0A0] mb-1">Status</div>
                <div className="text-green-400">Active & Syncing</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Future Integrations */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Other Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Google Calendar", status: "Coming Soon", icon: "📅" },
            { name: "Zoom", status: "Coming Soon", icon: "📹" },
            { name: "Slack", status: "Coming Soon", icon: "💬" },
            { name: "Email Provider", status: "Coming Soon", icon: "📧" }
          ].map((integration) => (
            <div key={integration.name} className="p-4 bg-[#2A2A2A] rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <div className="text-white font-medium">{integration.name}</div>
                  <div className="text-[#A0A0A0] text-sm">{integration.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
