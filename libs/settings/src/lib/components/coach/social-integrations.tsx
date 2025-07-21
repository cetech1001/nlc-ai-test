import React, { useState, useEffect } from 'react';
import {
  Check,
  ExternalLink,
  Settings,
  Trash2,
  Plus,
  LinkIcon,
} from 'lucide-react';
import { SocialIntegration, SocialPlatform, SocialPlatformConfig, CalendlyIntegration } from '../../types/settings.types';
import { useSettings } from '../../context/settings.context';
import { integrationsAPI } from '@nlc-ai/api-client';
import { SocialIntegrationsSkeleton } from '../skeletons';

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
    icon: <img src={"/images/icons/facebook-icon.png"} alt={"Facebook Icon"}/>,
    color: '',
  },
  instagram: {
    name: 'Instagram',
    icon: <img src={"/images/icons/instagram-icon.png"} alt={"Instagram Icon"}/>,
    color: '',
  },
  youtube: {
    name: 'YouTube',
    icon: <img src={"/images/icons/youtube-icon.svg"} alt={"YouTube Icon"}/>,
    color: '',
  },
  twitter: {
    name: 'X (Twitter)',
    icon: <img src={"/images/icons/twitter-icon.svg"} alt={"X (Twitter) Icon"}/>,
    color: '',
  },
  tiktok: {
    name: 'TikTok',
    icon: <img src={"/images/icons/tiktok-icon.png"} alt={"TikTok Icon"}/>,
    color: '',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <img src={"/images/icons/linkedin-icon.svg"} alt={"Linkedin Icon"}/>,
    color: '',
  },
  calendly: {
    name: 'Calendly',
    icon: <img src={"/images/icons/calendly-icon.png"} alt={"Calendly Icon"}/>,
    color: '',
  },
};

export const SocialIntegrations: React.FC<SocialIntegrationsProps> = ({
  onConnectSocial,
  onDisconnectSocial,
  onTestSocial,
  getSocialIntegrations,
}) => {
  const { setError, setSuccess } = useSettings();

  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const socialData = await getSocialIntegrations();
      setSocialIntegrations(socialData);
    } catch (error: any) {
      setError('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialConnect = async (platform: SocialPlatform) => {
    try {
      setIsLoading(true);

      // Use the real OAuth flow
      await integrationsAPI.initiateOAuthFlow(platform);

      // Refresh integrations after successful connection
      const updatedIntegrations = await getSocialIntegrations();
      setSocialIntegrations(updatedIntegrations);

      setSuccess(`${socialPlatforms[platform].name} connected successfully!`);
    } catch (error: any) {
      setError(`Failed to connect ${socialPlatforms[platform].name}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialDisconnect = async (integration: SocialIntegration) => {
    if (!confirm(`Are you sure you want to disconnect ${integration.platformName}? This will stop content syncing.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await onDisconnectSocial(integration.id);
      setSocialIntegrations(prev => prev.filter(i => i.id !== integration.id));
      setSuccess(`${integration.platformName} disconnected successfully`);
    } catch (error: any) {
      setError(`Failed to disconnect ${integration.platformName}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSocial = async (integration: SocialIntegration) => {
    try {
      setIsLoading(true);
      await onTestSocial(integration.id);
      setSuccess(`${integration.platformName} connection test successful!`);
    } catch (error: any) {
      setError(`${integration.platformName} connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectedPlatforms = () => {
    return socialIntegrations.map(integration => integration.platformName);
  };

  const getAvailablePlatforms = () => {
    const connected = getConnectedPlatforms();
    return Object.keys(socialPlatforms).filter(platform => !connected.includes(platform)) as SocialPlatform[];
  };

  if (isLoading && socialIntegrations.length === 0) {
    return <SocialIntegrationsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Apps & Socials</h1>
        <p className="text-[#A0A0A0]">Connect your social media accounts and essential apps to sync content and automate workflows</p>
      </div>

      {/* Social Media Integrations */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        {/* Background glow orb - matching stat-card.tsx exactly */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Apps & Integrations</h3>
                <p className="text-stone-400 text-sm">
                  Connect your social media and workflow accounts to sync content and analyze performance
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
                  const platformConfig = socialPlatforms[integration.platformName as SocialPlatform];
                  const profileData = integration.config as any;
                  return (
                    <div key={integration.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg`}>
                            {platformConfig?.icon || '🔗'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{platformConfig?.name || integration.platformName}</span>
                              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 text-xs font-medium">Connected</span>
                              </div>
                            </div>
                            <div className="text-stone-400 text-sm">
                              @{profileData?.username || profileData?.name || 'Unknown'}
                              {profileData?.followerCount && ` • ${profileData.followerCount.toLocaleString()} followers`}
                            </div>
                            {integration.lastSyncAt && (
                              <div className="text-stone-500 text-xs">
                                Last synced: {new Date(integration.lastSyncAt).toLocaleDateString()}
                              </div>
                            )}
                            {integration.syncError && (
                              <div className="text-red-400 text-xs">
                                Sync error: {integration.syncError}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <button
                            onClick={() => handleTestSocial(integration)}
                            disabled={isLoading}
                            className="border border-neutral-700 text-stone-300 hover:text-white hover:border-blue-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Test
                          </button>
                          {profileData?.profileUrl && (
                            <button
                              onClick={() => window.open(profileData.profileUrl, '_blank')}
                              className="border border-neutral-700 text-stone-300 hover:text-white hover:border-violet-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
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
                  <div key={platform} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{config.name}</div>
                        <div className="text-stone-400 text-xs">Not connected</div>
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
                );
              })}
            </div>
            {getAvailablePlatforms().length === 0 && (
              <div className="text-center py-8">
                <div className="text-green-400 text-lg mb-2">🎉</div>
                <p className="text-white font-medium">All platforms connected!</p>
                <p className="text-stone-400 text-sm">You've connected all available social media platforms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
