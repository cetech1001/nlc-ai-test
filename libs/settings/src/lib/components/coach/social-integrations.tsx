import React, { useState, useEffect } from 'react';
import {
  Check,
  ExternalLink,
  Settings,
  Trash2,
  Plus,
  AlertCircle,
  Mail,
  Calendar,
  LinkIcon,
  EyeOff,
  Eye,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { SocialIntegration, SocialPlatform, SocialPlatformConfig, CalendlyIntegration } from '../../types/settings.types';
import { useSettings } from '../../context/settings.context';

interface SocialIntegrationsProps {
  onConnectSocial: (platform: SocialPlatform, authData: any) => Promise<SocialIntegration>;
  onDisconnectSocial: (integrationId: string) => Promise<void>;
  onTestSocial: (integrationId: string) => Promise<void>;
  onSaveCalendly: (accessToken: string) => Promise<any>;
  onDeleteCalendly: () => Promise<any>;
  onTestCalendly: () => Promise<void>;
  getSocialIntegrations: () => Promise<SocialIntegration[]>;
  getCalendlySettings: () => Promise<CalendlyIntegration>;
}

const socialPlatforms: Record<SocialPlatform, SocialPlatformConfig> = {
  facebook: {
    name: 'Facebook',
    icon: <Facebook/>,
    color: 'from-blue-600 to-blue-700',
    authUrl: '/api/auth/facebook',
    scopes: ['pages_read_engagement', 'pages_show_list', 'instagram_basic'],
  },
  instagram: {
    name: 'Instagram',
    icon: <Instagram/>,
    color: 'from-pink-500 to-purple-600',
    authUrl: '/api/auth/instagram',
    scopes: ['instagram_basic', 'instagram_content_publish'],
  },
  youtube: {
    name: 'YouTube',
    icon: <Youtube/>,
    color: 'from-red-500 to-red-600',
    authUrl: '/api/auth/youtube',
    scopes: ['youtube.readonly', 'youtube.upload'],
  },
  twitter: {
    name: 'X (Twitter)',
    icon: <Twitter/>,
    color: 'from-gray-800 to-black',
    authUrl: '/api/auth/twitter',
    scopes: ['tweet.read', 'users.read'],
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: 'from-pink-600 to-black',
    authUrl: '/api/auth/tiktok',
    scopes: ['user.info.basic', 'video.list'],
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <Linkedin/>,
    color: 'from-blue-700 to-blue-800',
    authUrl: '/api/auth/linkedin',
    scopes: ['r_liteprofile', 'r_organization_social'],
  },
};

export const SocialIntegrations: React.FC<SocialIntegrationsProps> = ({
  onConnectSocial,
  onDisconnectSocial,
  onTestSocial,
  onSaveCalendly,
  onDeleteCalendly,
  onTestCalendly,
  getSocialIntegrations,
  getCalendlySettings,
}) => {
  const { setError, setSuccess } = useSettings();

  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([]);
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
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const [socialData, calendlyData] = await Promise.all([
        getSocialIntegrations(),
        getCalendlySettings(),
      ]);
      setSocialIntegrations(socialData);
      setCalendlySettings(calendlyData);
    } catch (error: any) {
      setError('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialConnect = async (platform: SocialPlatform) => {
    try {
      setIsLoading(true);

      // For MVP, we'll simulate OAuth flow
      // In production, this would redirect to the actual OAuth provider
      const authWindow = window.open(
        socialPlatforms[platform].authUrl,
        'social-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for auth completion (simplified for demo)
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          // Simulate successful auth
          const mockAuthData = {
            accessToken: 'mock-token-' + Date.now(),
            refreshToken: 'mock-refresh-' + Date.now(),
            profileData: {
              username: `mock_${platform}_user`,
              profileUrl: `https://${platform}.com/mock_user`,
              followerCount: Math.floor(Math.random() * 10000),
            }
          };

          onConnectSocial(platform, mockAuthData)
            .then((integration) => {
              setSocialIntegrations(prev => [...prev, integration]);
              setSuccess(`${socialPlatforms[platform].name} connected successfully!`);
            })
            .catch((error) => {
              setError(`Failed to connect ${socialPlatforms[platform].name}: ${error.message}`);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }, 1000);

      // Cleanup if window doesn't close
      setTimeout(() => {
        if (!authWindow?.closed) {
          authWindow?.close();
          clearInterval(checkClosed);
          setIsLoading(false);
          setError('Authentication was cancelled or timed out');
        }
      }, 30000);

    } catch (error: any) {
      setError(`Failed to connect ${socialPlatforms[platform].name}: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleSocialDisconnect = async (integration: SocialIntegration) => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}? This will stop content syncing.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await onDisconnectSocial(integration.id);
      setSocialIntegrations(prev => prev.filter(i => i.id !== integration.id));
      setSuccess(`${integration.name} disconnected successfully`);
    } catch (error: any) {
      setError(`Failed to disconnect ${integration.name}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSocial = async (integration: SocialIntegration) => {
    try {
      setIsLoading(true);
      await onTestSocial(integration.id);
      setSuccess(`${integration.name} connection test successful!`);
    } catch (error: any) {
      setError(`${integration.name} connection test failed: ${error.message}`);
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

  const getConnectedPlatforms = () => {
    return socialIntegrations.map(integration => integration.platform);
  };

  const getAvailablePlatforms = () => {
    const connected = getConnectedPlatforms();
    return Object.keys(socialPlatforms).filter(platform => !connected.includes(platform)) as SocialPlatform[];
  };

  if (isLoading && socialIntegrations.length === 0) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="bg-[#2A2A2A] h-64 rounded-2xl"></div>
        <div className="bg-[#2A2A2A] h-64 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Apps & Socials</h1>
        <p className="text-[#A0A0A0]">Connect your social media accounts and essential apps to sync content and automate workflows</p>
      </div>

      {/* Social Media Integrations */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Social Media Accounts</h3>
                <p className="text-[#A0A0A0] text-sm">
                  Connect your social media accounts to sync content and analyze performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <span className="text-blue-400 text-sm font-medium">
                {socialIntegrations.length} Connected
              </span>
            </div>
          </div>

          {/* Connected Accounts */}
          {socialIntegrations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Connected Accounts</h4>
              <div className="space-y-4">
                {socialIntegrations.map((integration) => {
                  const platformConfig = socialPlatforms[integration.platform as SocialPlatform];
                  return (
                    <div key={integration.id} className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${platformConfig.color} rounded-full flex items-center justify-center text-lg`}>
                            {platformConfig.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{integration.name}</span>
                              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 text-xs font-medium">Connected</span>
                              </div>
                            </div>
                            <div className="text-[#A0A0A0] text-sm">
                              @{integration.profileData?.username} • {integration.profileData?.followerCount?.toLocaleString()} followers
                            </div>
                            {integration.lastSyncAt && (
                              <div className="text-[#666] text-xs">
                                Last synced: {new Date(integration.lastSyncAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <button
                            onClick={() => handleTestSocial(integration)}
                            disabled={isLoading}
                            className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-blue-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Test
                          </button>
                          {integration.profileData?.profileUrl && (
                            <button
                              onClick={() => window.open(integration.profileData?.profileUrl, '_blank')}
                              className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleSocialDisconnect(integration)}
                            disabled={isLoading}
                            className="border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Platforms */}
          <div>
            <h4 className="text-white font-medium mb-4">Available Platforms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailablePlatforms().map((platform) => {
                const config = socialPlatforms[platform];
                return (
                  <div key={platform} className="relative group">
                    <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6 hover:border-violet-500/50 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center text-lg`}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{config.name}</div>
                          <div className="text-[#A0A0A0] text-xs">Not connected</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSocialConnect(platform)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Connect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {getAvailablePlatforms().length === 0 && (
              <div className="text-center py-8">
                <div className="text-green-400 text-lg mb-2">🎉</div>
                <p className="text-white font-medium">All platforms connected!</p>
                <p className="text-[#A0A0A0] text-sm">You've connected all available social media platforms.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendly Integration */}
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
                  Connect your Calendly account to sync appointments and manage client bookings
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

      {/* Email Integration */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Email Integration</h3>
                <p className="text-[#A0A0A0] text-sm">
                  Connect your email provider to enable AI-powered email management and automated responses
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400 text-sm font-medium">Coming Soon</span>
            </div>
          </div>

          <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
            <div className="text-center">
              <Mail className="w-16 h-16 text-[#A0A0A0] mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">Email Integration Coming Soon</h4>
              <p className="text-[#A0A0A0] text-sm mb-4">
                We're working on integrations with Gmail, Outlook, and other email providers to enable AI-powered email management.
              </p>
              <div className="space-y-2 text-[#A0A0A0] text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span>Automatic email categorization</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span>AI-generated responses</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span>Client interaction tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendly Token Form Modal */}
      {showCalendlyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Connect Calendly Account</h3>
              <p className="text-[#A0A0A0] text-sm">
                Enter your Calendly Personal Access Token to connect your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="calendly-token" className="block text-white text-sm font-medium mb-2">
                  Personal Access Token <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="calendly-token"
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
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCalendlyForm(false);
                    setCalendlyToken('');
                  }}
                  disabled={isLoading}
                  className="flex-1 border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555] py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCalendlyConnect}
                  disabled={isLoading || !calendlyToken.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white py-3 px-4 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
