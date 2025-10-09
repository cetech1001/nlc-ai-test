'use client'

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, ExternalLink, Check, Loader2 } from 'lucide-react';
import { sdkClient } from '@/lib';
import type { OnboardingRequest, ConnectedAccount } from '@nlc-ai/types';

interface ConnectionsStepProps {
  onContinue: () => void;
  data?: OnboardingRequest;
  onUpdate?: (connections: ConnectedAccount[]) => void;
}

interface ConnectedPlatform {
  id: string;
  platformName: string;
  isActive?: boolean | null;
}

export const ConnectionsStep = ({ onContinue, data, onUpdate }: ConnectionsStepProps) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [essentialConnected, setEssentialConnected] = useState(0);
  const [socialConnected, setSocialConnected] = useState(0);
  const [connectedEssentialPlatforms, setConnectedEssentialPlatforms] = useState<ConnectedPlatform[]>([]);
  const [connectedSocialPlatforms, setConnectedSocialPlatforms] = useState<ConnectedPlatform[]>([]);

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const [appIntegrations, socialIntegrations] = await Promise.all([
        sdkClient.integrations.getAppIntegrations(),
        sdkClient.integrations.getSocialIntegrations(),
      ]);

      // Store connected platforms
      setConnectedEssentialPlatforms(appIntegrations.filter(i => i.isActive));
      setConnectedSocialPlatforms(socialIntegrations.filter(i => i.isActive));

      // Count connected integrations
      const essentialCount = appIntegrations.filter(i => i.isActive).length;
      const socialCount = socialIntegrations.filter(i => i.isActive).length;

      setEssentialConnected(essentialCount);
      setSocialConnected(socialCount);

      // Update parent with connected accounts
      if (onUpdate) {
        const connections: ConnectedAccount[] = [
          ...appIntegrations.map(i => ({
            id: i.id,
            name: i.platformName,
            type: 'essential' as const,
            status: i.isActive ? 'connected' as const : 'disconnected' as const,
          })),
          ...socialIntegrations.map(i => ({
            id: i.id,
            name: i.platformName,
            type: 'social' as const,
            status: i.isActive ? 'connected' as const : 'disconnected' as const,
          })),
        ];
        onUpdate(connections);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPlatformConnected = (platformName: string, type: 'essential' | 'social'): boolean => {
    const platforms = type === 'essential' ? connectedEssentialPlatforms : connectedSocialPlatforms;
    return platforms.some(p => p.platformName === platformName && p.isActive);
  };

  const handleDisconnect = async (platformName: string, type: 'essential' | 'social') => {
    const platforms = type === 'essential' ? connectedEssentialPlatforms : connectedSocialPlatforms;
    const platform = platforms.find(p => p.platformName === platformName);

    if (!platform) return;

    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await sdkClient.integrations.disconnectIntegration(platform.id);
      await loadIntegrations();
    } catch (error: any) {
      console.error(`Failed to disconnect ${platformName}:`, error);
      alert(`Failed to disconnect ${platformName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platform: string, type: 'essential' | 'social') => {
    setConnecting(platform);

    try {
      // Use OAuth flow for connection
      await sdkClient.integrations.initiateOAuthFlow(platform);

      // Refresh integrations after successful connection
      await loadIntegrations();
    } catch (error: any) {
      console.error(`Failed to connect ${platform}:`, error);
      // alert(`Failed to connect ${platform}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  };

  const essentialTotal = 3; // gmail, outlook, calendly

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Essential Connections</h3>
            <p className="text-stone-400 text-sm mb-3">Required for core AI features</p>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">{essentialConnected}/{essentialTotal}</div>
              <div className="flex-1 bg-neutral-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600 transition-all duration-500"
                  style={{ width: `${(essentialConnected / essentialTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Social Media</h3>
            <p className="text-stone-400 text-sm mb-3">Optional for content insights</p>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">{socialConnected}</div>
              <span className="text-stone-400 text-sm">platforms connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Apps Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-2xl border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-40 h-40 -left-8 -top-10 bg-gradient-to-l from-blue-200 via-blue-600 to-violet-600 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Essential Apps</h3>
              <p className="text-stone-400 text-sm">
                Connect at least one email provider to enable AI automation
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gmail */}
            <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/icons/gmail-icon.png" alt="Gmail" className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">Gmail</h4>
                      <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                        Required
                      </span>
                      {isPlatformConnected('gmail', 'essential') && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>

                    <p className="text-stone-400 text-sm mb-2">
                      Connect your Gmail to enable AI email automation
                    </p>

                    <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                      <p className="text-stone-300 text-xs">
                        <span className="font-medium">Purpose:</span> Read and send emails on your behalf, create drafts for approval
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isPlatformConnected('gmail', 'essential') ? (
                    <button
                      onClick={() => handleDisconnect('gmail', 'essential')}
                      disabled={isLoading}
                      className="px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm transition-all"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect('gmail', 'essential')}
                      disabled={connecting === 'gmail' || isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {connecting === 'gmail' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Outlook */}
            <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/icons/outlook-icon.png" alt="Outlook" className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">Outlook</h4>
                      {isPlatformConnected('outlook', 'essential') && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>

                    <p className="text-stone-400 text-sm mb-2">
                      Alternative email provider for automation
                    </p>

                    <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                      <p className="text-stone-300 text-xs">
                        <span className="font-medium">Purpose:</span> Read and send emails, calendar management
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isPlatformConnected('outlook', 'essential') ? (
                    <button
                      onClick={() => handleDisconnect('outlook', 'essential')}
                      disabled={isLoading}
                      className="px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm transition-all"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect('outlook', 'essential')}
                      disabled={connecting === 'outlook' || isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {connecting === 'outlook' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Calendly */}
            <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/icons/calendly-icon.png" alt="Calendly" className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">Calendly</h4>
                      <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                        Required
                      </span>
                      {isPlatformConnected('calendly', 'essential') && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>

                    <p className="text-stone-400 text-sm mb-2">
                      Sync your calendar for scheduling automation
                    </p>

                    <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                      <p className="text-stone-300 text-xs">
                        <span className="font-medium">Purpose:</span> Schedule meetings, send reminders, manage availability
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isPlatformConnected('calendly', 'essential') ? (
                    <button
                      onClick={() => handleDisconnect('calendly', 'essential')}
                      disabled={isLoading}
                      className="px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm transition-all"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect('calendly', 'essential')}
                      disabled={connecting === 'calendly' || isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {connecting === 'calendly' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-2xl border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-40 h-40 -right-8 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Social Media (Optional)</h3>
              <p className="text-stone-400 text-sm">
                Connect platforms to analyze content performance and engagement
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {['facebook', 'instagram', 'youtube', 'twitter', 'tiktok'].map((platform) => {
              const isConnected = isPlatformConnected(platform, 'social');

              return (
                <div key={platform} className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                        <img
                          src={`/images/icons/${platform}-icon.${platform === 'youtube' || platform === 'twitter' ? 'svg' : 'png'}`}
                          alt={platform}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium text-sm capitalize">
                            {platform === 'twitter' ? 'X (Twitter)' : platform}
                          </h4>
                          {isConnected && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-stone-500 text-xs">
                          {platform === 'facebook' && 'Analyze engagement and sync content'}
                          {platform === 'instagram' && 'Track performance and engagement'}
                          {platform === 'youtube' && 'Monitor video performance metrics'}
                          {platform === 'twitter' && 'Track tweets and engagement'}
                          {platform === 'tiktok' && 'Analyze content performance'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(platform, 'social')}
                      disabled={isLoading}
                      className="w-full py-2 border border-neutral-600 text-stone-300 hover:border-red-500 hover:text-red-400 rounded-lg text-sm transition-all"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform, 'social')}
                      disabled={connecting === platform || isLoading}
                      className="w-full py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {connecting === platform ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
        <p className="text-stone-400 text-sm text-center">
          🔒 All connections are secure and encrypted. You can disconnect anytime from settings.
        </p>
      </div>
    </div>
  );
};
