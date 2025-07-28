import React, { useState, useEffect } from 'react';
import {
  Check,
  ExternalLink,
  Settings,
  Trash2,
  Plus,
  AlertCircle,
  Calendar,
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react';
import {Button} from "@nlc-ai/ui";
import { EmailProvider, CalendlyIntegration } from '../../types/settings.types';
import { useSettings } from '../../context/settings.context';

interface AdminIntegrationsProps {
  onSaveCalendly: (accessToken: string) => Promise<any>;
  onDeleteCalendly: () => Promise<any>;
  onTestCalendly: () => Promise<void>;
  onSaveEmailProvider: (provider: Partial<EmailProvider>) => Promise<any>;
  onDeleteEmailProvider: (id: string) => Promise<any>;
  onSetDefaultEmailProvider: (id: string) => Promise<any>;
  onTestEmailProvider: (id: string) => Promise<void>;
  getCalendlySettings: () => Promise<CalendlyIntegration>;
  getEmailProviders: () => Promise<EmailProvider[]>;
}

export const AdminIntegrations: React.FC<AdminIntegrationsProps> = ({
  onSaveCalendly,
  onDeleteCalendly,
  onTestCalendly,
  getCalendlySettings,
}) => {
  const { setError, setSuccess, error } = useSettings();

  const [calendlySettings, setCalendlySettings] = useState<CalendlyIntegration>({
    id: '',
    name: 'Calendly',
    platform: 'calendly',
    isActive: false,
    isConnected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showCalendlyForm, setShowCalendlyForm] = useState(false);

  const [calendlyToken, setCalendlyToken] = useState('');
  const [showCalendlyToken, setShowCalendlyToken] = useState(false);

  useEffect(() => {
    (() => loadData())();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const calendlyData = await getCalendlySettings();
      setCalendlySettings(calendlyData);
    } catch (error: any) {
      setError('Failed to load integration settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalendlyConnect = async () => {
    if (!calendlyToken.trim()) {
      setError('Please enter your Calendly access token');
      return;
    }

    try {
      setIsLoading(true);
      const result = await onSaveCalendly(calendlyToken.trim());
      setCalendlySettings(result.data);
      setSuccess('Calendly account connected successfully!');
      setShowCalendlyForm(false);
      setCalendlyToken('');
    } catch (error: any) {
      setError(error.message || 'Failed to connect Calendly account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalendlyDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Calendly? This will remove calendar integration.')) {
      return;
    }

    try {
      setIsLoading(true);
      await onDeleteCalendly();
      setCalendlySettings(prev => ({ ...prev, isConnected: false }));
      setSuccess('Calendly account disconnected successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to disconnect Calendly account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCalendly = async () => {
    try {
      setIsLoading(true);
      await onTestCalendly();
      setSuccess('Calendly connection is working properly!');
    } catch (error: any) {
      setError(`Calendly connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !calendlySettings.id) {
    return (
      <div className="animate-pulse">
        <div className="bg-[#2A2A2A] h-64 rounded-2xl mb-8"></div>
        <div className="bg-[#2A2A2A] h-64 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Integrations</h1>
        <p className="text-[#A0A0A0]">Manage platform integrations and system configurations</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Calendly Integration</h3>
                <p className="text-[#A0A0A0] text-sm">
                  Connect Calendly for admin appointment bookings and lead management
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
              <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-2">How to connect Calendly</h4>
                    <ol className="text-[#A0A0A0] text-sm space-y-2 list-decimal list-inside">
                      <li>Go to your <a href="https://calendly.com/app/settings/developer" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">Calendly account settings</a></li>
                      <li>Navigate to "Integrations" → "API & Webhooks"</li>
                      <li>Generate a Personal Access Token</li>
                      <li>Copy the token and paste it below</li>
                    </ol>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCalendlyForm(true)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center gap-2 justify-center">
                  <Plus className="w-4 h-4" />
                  Connect Calendly Account
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
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
                    <button
                      onClick={handleTestCalendly}
                      disabled={isLoading}
                      className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-blue-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Test
                    </button>
                    <button
                      onClick={() => calendlySettings.schedulingUrl && window.open(calendlySettings.schedulingUrl, '_blank')}
                      className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={handleCalendlyDisconnect}
                      disabled={isLoading}
                      className="border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-6">System Services Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Stripe Payments", status: "active", icon: CreditCard, color: "from-green-500 to-emerald-600" },
            { name: "Google OAuth", status: "active", icon: Settings, color: "from-blue-500 to-blue-600" },
            { name: "TinyMCE Editor", status: "active", icon: Settings, color: "from-purple-500 to-purple-600" },
            { name: "Tawk.to Chat", status: "active", icon: Settings, color: "from-orange-500 to-red-600" },
          ].map((service) => (
            <div key={service.name} className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center`}>
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{service.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[#A0A0A0] text-sm mt-4">
          These services are configured via environment variables and managed at the system level.
        </p>
      </div>

      {showCalendlyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Connect Calendly Account</h3>
              <p className="text-[#A0A0A0] text-sm">
                Enter your Calendly Personal Access Token to connect your account.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">How to get your token:</h4>
                  <ol className="text-[#A0A0A0] text-xs space-y-1 list-decimal list-inside">
                    <li>Go to your Calendly account settings</li>
                    <li>Navigate to "Integrations" → "API & Webhooks"</li>
                    <li>Generate a Personal Access Token</li>
                    <li>Copy and paste it below</li>
                  </ol>
                  <a
                    href="https://calendly.com/app/settings/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs mt-2"
                  >
                    Open Calendly Settings <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleCalendlyConnect} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-white text-sm font-medium mb-2">
                  Personal Access Token <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="token"
                    type={showCalendlyToken ? "text" : "password"}
                    value={calendlyToken}
                    onChange={(e) => setCalendlyToken(e.target.value)}
                    placeholder="Enter your Calendly access token"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendlyToken(!showCalendlyToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showCalendlyToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowCalendlyForm(false)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !calendlyToken.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connecting...
                    </div>
                  ) : (
                    "Connect Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
