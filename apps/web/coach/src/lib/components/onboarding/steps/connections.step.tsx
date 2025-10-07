'use client'

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, ExternalLink, Check, Loader2 } from 'lucide-react';
import type { OnboardingData, ConnectedAccount } from '@nlc-ai/types';

interface Connection {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  purpose: string;
  status: 'connected' | 'disconnected';
  isEssential: boolean;
}

interface SocialConnection {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected';
}

interface ConnectionsStepProps {
  onContinue: () => void;
  data?: OnboardingData;
  onUpdate?: (connections: ConnectedAccount[]) => void;
}

export const ConnectionsStep = ({ onContinue, data, onUpdate }: ConnectionsStepProps) => {
  const [essentialConnections, setEssentialConnections] = useState<Connection[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      icon: <img src="/images/icons/gmail-icon.png" alt="Gmail" className="w-6 h-6" />,
      description: 'Connect your Gmail to enable AI email automation',
      purpose: 'Read and send emails on your behalf, create drafts for approval',
      status: 'disconnected',
      isEssential: true
    },
    {
      id: 'calendly',
      name: 'Calendly',
      icon: <img src="/images/icons/calendly-icon.png" alt="Calendly" className="w-6 h-6" />,
      description: 'Sync your calendar for scheduling automation',
      purpose: 'Schedule meetings, send reminders, manage availability',
      status: 'disconnected',
      isEssential: true
    },
    {
      id: 'outlook',
      name: 'Outlook',
      icon: <img src="/images/icons/outlook-icon.png" alt="Outlook" className="w-6 h-6" />,
      description: 'Alternative email provider for automation',
      purpose: 'Read and send emails, calendar management',
      status: 'disconnected',
      isEssential: false
    }
  ]);

  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '/images/icons/facebook-icon.png',
      description: 'Analyze engagement and sync content',
      status: 'disconnected'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '/images/icons/instagram-icon.png',
      description: 'Track performance and engagement',
      status: 'disconnected'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '/images/icons/youtube-icon.svg',
      description: 'Monitor video performance metrics',
      status: 'disconnected'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: '/images/icons/twitter-icon.svg',
      description: 'Track tweets and engagement',
      status: 'disconnected'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '/images/icons/tiktok-icon.png',
      description: 'Analyze content performance',
      status: 'disconnected'
    }
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);

  // Load existing connections from data prop (only on mount or when data changes)
  useEffect(() => {
    if (data?.connections && data.connections.length > 0) {
      // Update essential connections
      setEssentialConnections(prev =>
        prev.map(conn => {
          const saved = data.connections.find(c => c.id === conn.id);
          return saved ? { ...conn, status: saved.status } : conn;
        })
      );

      // Update social connections
      setSocialConnections(prev =>
        prev.map(conn => {
          const saved = data.connections.find(c => c.id === conn.id);
          return saved ? { ...conn, status: saved.status } : conn;
        })
      );
    }
  }, []); // Only run on mount

  // Helper function to build and send updates
  const notifyParent = (essential: Connection[], social: SocialConnection[]) => {
    if (onUpdate) {
      const allConnections: ConnectedAccount[] = [
        ...essential.map(c => ({
          id: c.id,
          name: c.name,
          type: 'essential' as const,
          status: c.status,
        })),
        ...social.map(c => ({
          id: c.id,
          name: c.name,
          type: 'social' as const,
          status: c.status,
        })),
      ];
      onUpdate(allConnections);
    }
  };

  const handleConnect = async (connectionID: string, isEssential: boolean = true) => {
    setConnecting(connectionID);

    // Simulate connection process - in real app, this would open OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isEssential) {
      const updated = essentialConnections.map(conn =>
        conn.id === connectionID ? { ...conn, status: 'connected' as const } : conn
      );
      setEssentialConnections(updated);
      notifyParent(updated, socialConnections);
    } else {
      const updated = socialConnections.map(conn =>
        conn.id === connectionID ? { ...conn, status: 'connected' as const } : conn
      );
      setSocialConnections(updated);
      notifyParent(essentialConnections, updated);
    }

    setConnecting(null);
  };

  const handleDisconnect = (connectionID: string, isEssential: boolean = true) => {
    if (isEssential) {
      const updated = essentialConnections.map(conn =>
        conn.id === connectionID ? { ...conn, status: 'disconnected' as const } : conn
      );
      setEssentialConnections(updated);
      notifyParent(updated, socialConnections);
    } else {
      const updated = socialConnections.map(conn =>
        conn.id === connectionID ? { ...conn, status: 'disconnected' as const } : conn
      );
      setSocialConnections(updated);
      notifyParent(essentialConnections, updated);
    }
  };

  const essentialConnected = essentialConnections.filter(c => c.isEssential && c.status === 'connected').length;
  const essentialTotal = essentialConnections.filter(c => c.isEssential).length;
  const socialConnected = socialConnections.filter(c => c.status === 'connected').length;

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
            {essentialConnections.map((connection) => (
              <div
                key={connection.id}
                className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      {connection.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-semibold">{connection.name}</h4>
                        {connection.isEssential && (
                          <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                            Required
                          </span>
                        )}
                        {connection.status === 'connected' && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Connected
                          </span>
                        )}
                      </div>

                      <p className="text-stone-400 text-sm mb-2">
                        {connection.description}
                      </p>

                      <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                        <p className="text-stone-300 text-xs">
                          <span className="font-medium">Purpose:</span> {connection.purpose}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {connection.status === 'connected' ? (
                      <button
                        onClick={() => handleDisconnect(connection.id, true)}
                        className="px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm transition-all"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(connection.id, true)}
                        disabled={connecting === connection.id}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {connecting === connection.id ? (
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
            ))}
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
            {socialConnections.map((connection) => (
              <div
                key={connection.id}
                className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <img src={connection.icon} alt={connection.name} className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{connection.name}</h4>
                      <p className="text-stone-500 text-xs">{connection.description}</p>
                    </div>
                  </div>
                </div>

                {connection.status === 'connected' ? (
                  <button
                    onClick={() => handleDisconnect(connection.id, false)}
                    className="w-full py-2 border border-neutral-600 text-stone-300 hover:border-red-500 hover:text-red-400 rounded-lg text-sm transition-all"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(connection.id, false)}
                    disabled={connecting === connection.id}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {connecting === connection.id ? (
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
            ))}
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
