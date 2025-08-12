import React, { useState, useEffect } from 'react';
import {
  Check,
  ExternalLink,
  Settings,
  Trash2,
  Plus,
  LinkIcon,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useSettings } from '../../context/settings.context';
import { integrationsAPI } from '@nlc-ai/web-api-client';
import { SocialIntegrationsSkeleton } from '../skeletons';

interface IntegrationData {
  id: string;
  platformName: string;
  integrationType: 'social' | 'app' | 'course';
  isActive?: boolean | null;
  config?: any;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  createdAt?: Date | null;
}

interface SocialIntegrationsProps {
  // Keep these for backward compatibility, but they won't be used much
  onConnectSocial?: (platform: string, authData: any) => Promise<any>;
  onDisconnectSocial?: (integrationID: string) => Promise<void>;
  onTestSocial?: (integrationID: string) => Promise<void>;
  getSocialIntegrations?: () => Promise<any[]>;
}

const socialPlatforms = {
  facebook: {
    name: 'Facebook',
    icon: <img src="/images/icons/facebook-icon.png" alt="Facebook Icon" className="w-full h-full object-contain"/>,
    type: 'social' as const,
  },
  instagram: {
    name: 'Instagram',
    icon: <img src="/images/icons/instagram-icon.png" alt="Instagram Icon" className="w-full h-full object-contain"/>,
    type: 'social' as const,
  },
  youtube: {
    name: 'YouTube',
    icon: <img src="/images/icons/youtube-icon.svg" alt="YouTube Icon" className="w-full h-full object-contain"/>,
    type: 'social' as const,
  },
  twitter: {
    name: 'X (Twitter)',
    icon: <img src="/images/icons/twitter-icon.svg" alt="X Icon" className="w-full h-full object-contain"/>,
    type: 'social' as const,
  },
  tiktok: {
    name: 'TikTok',
    icon: <img src="/images/icons/tiktok-icon.png" alt="TikTok Icon" className="w-full h-full object-contain"/>,
    type: 'social' as const,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <img src="/images/icons/linkedin-icon.svg" alt="LinkedIn Icon" className="w-full h-full object-contain"/>,
    type: 'social' as const,
  },
};

const appPlatforms = {
  calendly: {
    name: 'Calendly',
    icon: <img src="/images/icons/calendly-icon.png" alt="Calendly Icon" className="w-full h-full object-contain"/>,
    description: 'Schedule meetings and sync calendar events',
    type: 'app' as const,
  },
  gmail: {
    name: 'Gmail',
    icon: <img src="/images/icons/gmail-icon.png" alt="Gmail Icon" className="w-full h-full object-contain"/>,
    description: 'Connect your Gmail account to read and send emails',
    type: 'app' as const,
  },
  outlook: {
    name: 'Outlook',
    icon: <img src="/images/icons/outlook-icon.png" alt="Outlook Icon" className="w-full h-full object-contain"/>,
    description: 'Connect your Outlook account to read and send emails',
    type: 'app' as const,
  },
};

export const SocialIntegrations: React.FC<SocialIntegrationsProps> = () => {
  const { setError, setSuccess } = useSettings();

  const [socialIntegrations, setSocialIntegrations] = useState<IntegrationData[]>([]);
  const [appIntegrations, setAppIntegrations] = useState<IntegrationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  /*const [supportedPlatforms, setSupportedPlatforms] = useState<{
    social: string[];
    app: string[];
    course: string[];
    all: string[];
  }>({ social: [], app: [], course: [], all: [] });*/

  useEffect(() => {
    (() => loadIntegrations())();
    // loadSupportedPlatforms();
  }, []);

  /*const loadSupportedPlatforms = async () => {
    try {
      const platforms = await integrationsAPI.getSupportedPlatforms();
      setSupportedPlatforms(platforms);
    } catch (error: any) {
      console.error('Failed to load supported platforms:', error);
    }
  };*/

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const [socialData, appData] = await Promise.all([
        integrationsAPI.getSocialIntegrations(),
        integrationsAPI.getAppIntegrations(),
      ]);
      setSocialIntegrations(socialData);
      setAppIntegrations(appData);
    } catch (error: any) {
      setError('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platform: string, type: 'social' | 'app') => {
    try {
      setIsLoading(true);

      // Use the OAuth flow for most platforms
      await integrationsAPI.initiateOAuthFlow(platform);

      // Refresh integrations after successful connection
      await loadIntegrations();

      const platformConfig = type === 'social' ? socialPlatforms[platform as keyof typeof socialPlatforms] : appPlatforms[platform as keyof typeof appPlatforms];
      setSuccess(`${platformConfig?.name || platform} connected successfully!`);
    } catch (error: any) {
      const platformConfig = type === 'social' ? socialPlatforms[platform as keyof typeof socialPlatforms] : appPlatforms[platform as keyof typeof appPlatforms];
      setError(`Failed to connect ${platformConfig?.name || platform}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (integration: IntegrationData) => {
    const platformConfig = integration.integrationType === 'social'
      ? socialPlatforms[integration.platformName as keyof typeof socialPlatforms]
      : appPlatforms[integration.platformName as keyof typeof appPlatforms];

    if (!confirm(`Are you sure you want to disconnect ${platformConfig?.name || integration.platformName}? This will stop data syncing.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await integrationsAPI.disconnectIntegration(integration.id);

      if (integration.integrationType === 'social') {
        setSocialIntegrations(prev => prev.filter(i => i.id !== integration.id));
      } else {
        setAppIntegrations(prev => prev.filter(i => i.id !== integration.id));
      }

      setSuccess(`${platformConfig?.name || integration.platformName} disconnected successfully`);
    } catch (error: any) {
      setError(`Failed to disconnect ${platformConfig?.name || integration.platformName}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (integration: IntegrationData) => {
    try {
      setIsLoading(true);
      const result = await integrationsAPI.testIntegration(integration.id);

      if (result.success) {
        setSuccess(`${integration.platformName} connection test successful!`);
      } else {
        setError(`${integration.platformName} connection test failed: ${result.message}`);
      }
    } catch (error: any) {
      setError(`${integration.platformName} connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integration: IntegrationData) => {
    try {
      setIsLoading(true);
      const result = await integrationsAPI.syncIntegration(integration.id);

      if (result.success) {
        setSuccess(`${integration.platformName} synced successfully!`);
        await loadIntegrations(); // Refresh to get updated sync time
      } else {
        setError(`Failed to sync ${integration.platformName}: ${result.message}`);
      }
    } catch (error: any) {
      setError(`Failed to sync ${integration.platformName}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectedPlatforms = (type: 'social' | 'app') => {
    const integrations = type === 'social' ? socialIntegrations : appIntegrations;
    return integrations.map(integration => integration.platformName);
  };

  const getAvailablePlatforms = (type: 'social' | 'app') => {
    const connected = getConnectedPlatforms(type);
    const platforms = type === 'social' ? socialPlatforms : appPlatforms;
    return Object.keys(platforms).filter(platform => !connected.includes(platform));
  };

  const renderIntegrationCard = (integration: IntegrationData) => {
    const platformConfig = integration.integrationType === 'social'
      ? socialPlatforms[integration.platformName as keyof typeof socialPlatforms]
      : appPlatforms[integration.platformName as keyof typeof appPlatforms];

    const profileData = integration.config || {};

    return (
      <div key={integration.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              {platformConfig?.icon || '🔗'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium">{platformConfig?.name || integration.platformName}</span>
                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                </div>
              </div>
              <div className="text-stone-400 text-sm mb-1">
                {profileData?.username || profileData?.name || profileData?.emailAddress || 'Connected'}
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
              onClick={() => handleSync(integration)}
              disabled={isLoading}
              className="border border-blue-600/50 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
            <button
              onClick={() => handleTest(integration)}
              disabled={isLoading}
              className="border border-neutral-700 text-stone-300 hover:text-white hover:border-green-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
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
              onClick={() => handleDisconnect(integration)}
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
  };

  const renderAvailablePlatformCard = (platform: string, type: 'social' | 'app') => {
    const config = type === 'social'
      ? socialPlatforms[platform as keyof typeof socialPlatforms]
      : appPlatforms[platform as keyof typeof appPlatforms];

    return (
      <div key={platform} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="text-white font-medium text-sm">{config.name}</div>
            <div className="text-stone-400 text-xs">Not connected</div>
          </div>
        </div>
        {type === 'app' && 'description' in config && (
          <p className="text-stone-400 text-xs mb-4">{config.description}</p>
        )}
        <button
          onClick={() => handleConnect(platform, type)}
          disabled={isLoading}
          className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
            type === 'social'
              ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          Connect
        </button>
      </div>
    );
  };

  if (isLoading && socialIntegrations.length === 0 && appIntegrations.length === 0) {
    return <SocialIntegrationsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Apps & Social Media</h1>
        <p className="text-[#A0A0A0]">Connect your social media accounts and essential apps to sync content and automate workflows</p>
      </div>

      {/* App Integrations Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        {/* Background glow orb */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-blue-200 via-blue-600 to-violet-600 rounded-full blur-[112px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Essential Apps</h3>
                <p className="text-stone-400 text-sm">
                  Connect your email, calendar, and other essential apps
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <span className="text-blue-400 text-sm font-medium">
                {appIntegrations.length} Connected
              </span>
            </div>
          </div>

          {/* Connected App Integrations */}
          {appIntegrations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Connected Apps</h4>
              <div className="space-y-4">
                {appIntegrations.map(renderIntegrationCard)}
              </div>
            </div>
          )}

          {/* Available App Platforms */}
          <div>
            <h4 className="text-white font-medium mb-4">Available Apps</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailablePlatforms('app').map((platform) => renderAvailablePlatformCard(platform, 'app'))}
            </div>
            {getAvailablePlatforms('app').length === 0 && (
              <div className="text-center py-8">
                <div className="text-green-400 text-lg mb-2">📧</div>
                <p className="text-white font-medium">All apps connected!</p>
                <p className="text-stone-400 text-sm">You've connected all available apps.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Integrations */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        {/* Background glow orb */}
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
                <h3 className="text-xl font-semibold text-white mb-1">Social Media</h3>
                <p className="text-stone-400 text-sm">
                  Connect your social media accounts to sync content and analyze performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full">
              <span className="text-fuchsia-400 text-sm font-medium">
                {socialIntegrations.length} Connected
              </span>
            </div>
          </div>

          {/* Connected Social Integrations */}
          {socialIntegrations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Connected Accounts</h4>
              <div className="space-y-4">
                {socialIntegrations.map(renderIntegrationCard)}
              </div>
            </div>
          )}

          {/* Available Social Platforms */}
          <div>
            <h4 className="text-white font-medium mb-4">Available Platforms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailablePlatforms('social').map((platform) => renderAvailablePlatformCard(platform, 'social'))}
            </div>
            {getAvailablePlatforms('social').length === 0 && (
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
