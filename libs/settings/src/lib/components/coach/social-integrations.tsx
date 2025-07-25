import React, { useState, useEffect } from 'react';
import {
  Check,
  ExternalLink,
  Settings,
  Trash2,
  Plus,
  LinkIcon,
  Mail,
  Star,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { SocialIntegration, SocialPlatform, SocialPlatformConfig, CalendlyIntegration } from '../../types/settings.types';
import { useSettings } from '../../context/settings.context';
import { integrationsAPI, emailAccountsAPI, EmailAccountResponse } from '@nlc-ai/api-client';
import { SocialIntegrationsSkeleton } from '../skeletons';

interface SocialIntegrationsProps {
  onConnectSocial: (platform: SocialPlatform, authData: any) => Promise<SocialIntegration>;
  onDisconnectSocial: (integrationID: string) => Promise<void>;
  onTestSocial: (integrationID: string) => Promise<void>;
  onSaveCalendly: (accessToken: string) => Promise<any>;
  onDeleteCalendly: () => Promise<any>;
  onTestCalendly: () => Promise<void>;
  getSocialIntegrations: () => Promise<SocialIntegration[]>;
  getCalendlySettings: () => Promise<CalendlyIntegration>;
}

const socialPlatforms: Record<SocialPlatform, SocialPlatformConfig> = {
  facebook: {
    name: 'Facebook',
    icon: <img src={"/images/icons/facebook-icon.png"} alt={"Facebook Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
  instagram: {
    name: 'Instagram',
    icon: <img src={"/images/icons/instagram-icon.png"} alt={"Instagram Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
  youtube: {
    name: 'YouTube',
    icon: <img src={"/images/icons/youtube-icon.svg"} alt={"YouTube Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
  twitter: {
    name: 'X (Twitter)',
    icon: <img src={"/images/icons/twitter-icon.svg"} alt={"X (Twitter) Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
  tiktok: {
    name: 'TikTok',
    icon: <img src={"/images/icons/tiktok-icon.png"} alt={"TikTok Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <img src={"/images/icons/linkedin-icon.svg"} alt={"Linkedin Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
  calendly: {
    name: 'Calendly',
    icon: <img src={"/images/icons/calendly-icon.png"} alt={"Calendly Icon"} className="w-full h-full object-contain"/>,
    color: '',
  },
};

const emailProviders = {
  google: {
    name: 'Gmail',
    icon: <img src={"/images/icons/gmail-icon.png"} alt={"Gmail Icon"} className="w-full h-full object-contain"/>,
    description: 'Connect your Gmail account to read and send emails',
  },
  microsoft: {
    name: 'Outlook',
    icon: <img src={"/images/icons/outlook-icon.png"} alt={"Outlook Icon"} className="w-full h-full object-contain"/>,
    description: 'Connect your Outlook account to read and send emails',
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
  const [emailAccounts, setEmailAccounts] = useState<EmailAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
    loadEmailAccounts();
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

  const loadEmailAccounts = async () => {
    try {
      setIsEmailLoading(true);
      const emailData = await emailAccountsAPI.getEmailAccounts();
      setEmailAccounts(emailData);
    } catch (error: any) {
      setError('Failed to load email accounts');
    } finally {
      setIsEmailLoading(false);
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

  const handleEmailConnect = async (provider: string) => {
    try {
      setIsEmailLoading(true);

      // Use the email OAuth flow
      await emailAccountsAPI.initiateEmailOAuthFlow(provider);

      // Refresh email accounts after successful connection
      const updatedEmailAccounts = await emailAccountsAPI.getEmailAccounts();
      setEmailAccounts(updatedEmailAccounts);

      setSuccess(`${emailProviders[provider as keyof typeof emailProviders].name} connected successfully!`);
    } catch (error: any) {
      setError(`Failed to connect ${emailProviders[provider as keyof typeof emailProviders].name}: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
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

  const handleEmailDisconnect = async (emailAccount: EmailAccountResponse) => {
    if (!confirm(`Are you sure you want to disconnect ${emailAccount.emailAddress}? This will stop email syncing.`)) {
      return;
    }

    try {
      setIsEmailLoading(true);
      await emailAccountsAPI.disconnectEmailAccount(emailAccount.id);
      setEmailAccounts(prev => prev.filter(acc => acc.id !== emailAccount.id));
      setSuccess(`${emailAccount.emailAddress} disconnected successfully`);
    } catch (error: any) {
      setError(`Failed to disconnect ${emailAccount.emailAddress}: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
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

  const handleTestEmail = async (emailAccount: EmailAccountResponse) => {
    try {
      setIsEmailLoading(true);
      const result = await emailAccountsAPI.testEmailAccount(emailAccount.id);
      if (result.success) {
        setSuccess(`${emailAccount.emailAddress} connection test successful!`);
      } else {
        setError(`${emailAccount.emailAddress} connection test failed: ${result.message}`);
      }
    } catch (error: any) {
      setError(`${emailAccount.emailAddress} connection test failed: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleSetPrimaryEmail = async (emailAccount: EmailAccountResponse) => {
    try {
      setIsEmailLoading(true);
      await emailAccountsAPI.setPrimaryEmailAccount(emailAccount.id);

      // Update local state
      setEmailAccounts(prev => prev.map(acc => ({
        ...acc,
        isPrimary: acc.id === emailAccount.id
      })));

      setSuccess(`${emailAccount.emailAddress} set as primary email account`);
    } catch (error: any) {
      setError(`Failed to set primary email: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleSyncEmail = async (emailAccount: EmailAccountResponse) => {
    try {
      setIsEmailLoading(true);
      const result = await emailAccountsAPI.syncEmailAccount(emailAccount.id);
      if (result.success) {
        setSuccess(`${emailAccount.emailAddress} synced successfully!`);
        // Refresh email accounts to get updated sync time
        await loadEmailAccounts();
      } else {
        setError(`Failed to sync ${emailAccount.emailAddress}: ${result.message}`);
      }
    } catch (error: any) {
      setError(`Failed to sync ${emailAccount.emailAddress}: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const getConnectedPlatforms = () => {
    return socialIntegrations.map(integration => integration.platformName);
  };

  const getAvailablePlatforms = () => {
    const connected = getConnectedPlatforms();
    return Object.keys(socialPlatforms).filter(platform => !connected.includes(platform)) as SocialPlatform[];
  };

  const getConnectedEmailProviders = () => {
    return emailAccounts.map(account => account.provider);
  };

  const getAvailableEmailProviders = () => {
    const connected = getConnectedEmailProviders();
    return Object.keys(emailProviders).filter(provider => !connected.includes(provider));
  };

  if ((isLoading && socialIntegrations.length === 0) || (isEmailLoading && emailAccounts.length === 0)) {
    return <SocialIntegrationsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Apps & Email Accounts</h1>
        <p className="text-[#A0A0A0]">Connect your social media accounts, email accounts, and essential apps to sync content and automate workflows</p>
      </div>

      {/* Email Accounts Section */}
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
                <h3 className="text-xl font-semibold text-white mb-1">Email Accounts</h3>
                <p className="text-stone-400 text-sm">
                  Connect your email accounts to enable automatic email responses and client communication
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <span className="text-blue-400 text-sm font-medium">
                {emailAccounts.length} Connected
              </span>
            </div>
          </div>

          {/* Connected Email Accounts */}
          {emailAccounts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Connected Email Accounts</h4>
              <div className="space-y-4">
                {emailAccounts.map((emailAccount) => {
                  const providerConfig = emailProviders[emailAccount.provider as keyof typeof emailProviders];
                  return (
                    <div key={emailAccount.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center">
                            {providerConfig?.icon || <Mail className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{providerConfig?.name || emailAccount.provider}</span>
                              {emailAccount.isPrimary && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-yellow-400 text-xs font-medium">Primary</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 text-xs font-medium">Connected</span>
                              </div>
                            </div>
                            <div className="text-stone-400 text-sm mb-1">
                              {emailAccount.emailAddress}
                            </div>
                            {emailAccount.lastSyncAt && (
                              <div className="text-stone-500 text-xs">
                                Last synced: {new Date(emailAccount.lastSyncAt).toLocaleString()}
                              </div>
                            )}
                            {!emailAccount.syncEnabled && (
                              <div className="flex items-center gap-1 text-orange-400 text-xs mt-1">
                                <AlertCircle className="w-3 h-3" />
                                Sync disabled
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          {!emailAccount.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryEmail(emailAccount)}
                              disabled={isEmailLoading}
                              className="border border-yellow-600/50 text-yellow-400 hover:bg-yellow-600 hover:text-white hover:border-yellow-600 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                            >
                              <Star className="w-4 h-4" />
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleSyncEmail(emailAccount)}
                            disabled={isEmailLoading}
                            className="border border-blue-600/50 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Sync
                          </button>
                          <button
                            onClick={() => handleTestEmail(emailAccount)}
                            disabled={isEmailLoading}
                            className="border border-neutral-700 text-stone-300 hover:text-white hover:border-green-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Test
                          </button>
                          <button
                            onClick={() => handleEmailDisconnect(emailAccount)}
                            disabled={isEmailLoading}
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

          {/* Available Email Providers */}
          <div>
            <h4 className="text-white font-medium mb-4">Available Email Providers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableEmailProviders().map((provider) => {
                const config = emailProviders[provider as keyof typeof emailProviders];
                return (
                  <div key={provider} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{config.name}</div>
                        <div className="text-stone-400 text-xs">Not connected</div>
                      </div>
                    </div>
                    <p className="text-stone-400 text-xs mb-4">{config.description}</p>
                    <button
                      onClick={() => handleEmailConnect(provider)}
                      disabled={isEmailLoading}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  </div>
                );
              })}
            </div>
            {getAvailableEmailProviders().length === 0 && (
              <div className="text-center py-8">
                <div className="text-green-400 text-lg mb-2">📧</div>
                <p className="text-white font-medium">All email providers connected!</p>
                <p className="text-stone-400 text-sm">You've connected all available email providers.</p>
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
                <h3 className="text-xl font-semibold text-white mb-1">Social Media & Apps</h3>
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
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center">
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
