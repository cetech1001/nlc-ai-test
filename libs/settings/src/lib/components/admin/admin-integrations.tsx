import React, { useState, useEffect } from 'react';
import { Check, ExternalLink, Settings, Trash2, Plus, AlertCircle, Mail, Calendar, CreditCard, Eye, EyeOff } from 'lucide-react';
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
                                                                      // onSaveCalendly,
                                                                      onDeleteCalendly,
                                                                      onTestCalendly,
                                                                      onSaveEmailProvider,
                                                                      onDeleteEmailProvider,
                                                                      onSetDefaultEmailProvider,
                                                                      onTestEmailProvider,
                                                                      getCalendlySettings,
                                                                      getEmailProviders,
                                                                    }) => {
  const { setError, setSuccess } = useSettings();

  const [calendlySettings, setCalendlySettings] = useState<CalendlyIntegration>({
    id: '',
    name: 'Calendly',
    platform: 'calendly',
    isActive: false,
    isConnected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendlyForm, setShowCalendlyForm] = useState(false);
  const [_, setShowEmailForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<EmailProvider | null>(null);

  // Calendly form state
  /*const [calendlyToken, setCalendlyToken] = useState('');
  const [showCalendlyToken, setShowCalendlyToken] = useState(false);*/

  // Email provider form state
  const [emailForm, setEmailForm] = useState({
    name: '',
    type: 'smtp' as 'smtp' | 'mailgun' | 'sendgrid' | 'ses',
    fromEmail: '',
    fromName: '',
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    apiKey: '',
    domain: '',
    baseUrl: '',
    sendgridApiKey: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [calendlyData, emailData] = await Promise.all([
        getCalendlySettings(),
        getEmailProviders(),
      ]);
      setCalendlySettings(calendlyData);
      setEmailProviders(emailData);
    } catch (error: any) {
      setError('Failed to load integration settings');
    } finally {
      setIsLoading(false);
    }
  };

  /*const handleCalendlyConnect = async () => {
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
  };*/

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

  const handleSaveEmailProvider = async () => {
    if (!emailForm.name.trim() || !emailForm.fromEmail.trim() || !emailForm.fromName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const providerData: Partial<EmailProvider> = {
        name: emailForm.name,
        type: emailForm.type,
        fromEmail: emailForm.fromEmail,
        fromName: emailForm.fromName,
        isDefault: emailProviders.length === 0,
        config: {},
        id: editingProvider?.id || '',
        platform: 'email',
        isActive: true,
        isConnected: true,
        createdAt: editingProvider?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      switch (emailForm.type) {
        case 'smtp':
          providerData.config = {
            host: emailForm.host,
            port: emailForm.port,
            secure: emailForm.secure,
            username: emailForm.username,
            password: emailForm.password,
          };
          break;
        case 'mailgun':
          providerData.config = {
            apiKey: emailForm.apiKey,
            domain: emailForm.domain,
            baseUrl: emailForm.baseUrl || 'https://api.mailgun.net',
          };
          break;
        case 'sendgrid':
          providerData.config = {
            sendgridApiKey: emailForm.sendgridApiKey,
          };
          break;
        case 'ses':
          providerData.config = {
            accessKeyId: emailForm.accessKeyId,
            secretAccessKey: emailForm.secretAccessKey,
            region: emailForm.region,
          };
          break;
      }

      const result = await onSaveEmailProvider(providerData);

      if (editingProvider) {
        setEmailProviders(prev => prev.map(p => p.id === editingProvider.id ? result : p));
        setSuccess('Email provider updated successfully!');
      } else {
        setEmailProviders(prev => [...prev, result]);
        setSuccess('Email provider added successfully!');
      }

      resetEmailForm();
    } catch (error: any) {
      setError(error.message || 'Failed to save email provider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmailProvider = async (provider: EmailProvider) => {
    if (!confirm(`Are you sure you want to delete the ${provider.name} email provider?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await onDeleteEmailProvider(provider.id);
      setEmailProviders(prev => prev.filter(p => p.id !== provider.id));
      setSuccess('Email provider deleted successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to delete email provider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultProvider = async (provider: EmailProvider) => {
    try {
      setIsLoading(true);
      await onSetDefaultEmailProvider(provider.id);
      setEmailProviders(prev => prev.map(p => ({ ...p, isDefault: p.id === provider.id })));
      setSuccess(`${provider.name} set as default email provider`);
    } catch (error: any) {
      setError(error.message || 'Failed to set default provider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmailProvider = async (provider: EmailProvider) => {
    try {
      setIsLoading(true);
      await onTestEmailProvider(provider.id);
      setSuccess(`${provider.name} connection test successful!`);
    } catch (error: any) {
      setError(`${provider.name} connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetEmailForm = () => {
    setEmailForm({
      name: '',
      type: 'smtp',
      fromEmail: '',
      fromName: '',
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      apiKey: '',
      domain: '',
      baseUrl: '',
      sendgridApiKey: '',
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
    });
    setEditingProvider(null);
    setShowEmailForm(false);
    setShowPasswords({});
  };

  const startEditProvider = (provider: EmailProvider) => {
    setEditingProvider(provider);
    setEmailForm({
      name: provider.name,
      type: provider.type,
      fromEmail: provider.fromEmail,
      fromName: provider.fromName,
      host: provider.config.host || '',
      port: provider.config.port || 587,
      secure: provider.config.secure || false,
      username: provider.config.username || '',
      password: provider.config.password || '',
      apiKey: provider.config.apiKey || '',
      domain: provider.config.domain || '',
      baseUrl: provider.config.baseUrl || '',
      sendgridApiKey: provider.config.sendgridApiKey || '',
      accessKeyId: provider.config.accessKeyId || '',
      secretAccessKey: provider.config.secretAccessKey || '',
      region: provider.config.region || 'us-east-1',
    });
    setShowEmailForm(true);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading && !calendlySettings.id && emailProviders.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="bg-[#2A2A2A] h-64 rounded-2xl mb-8"></div>
        <div className="bg-[#2A2A2A] h-64 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Integrations</h1>
        <p className="text-[#A0A0A0]">Manage platform integrations and system configurations</p>
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

      {/* Email Providers */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Email Providers</h3>
                <p className="text-[#A0A0A0] text-sm">
                  Configure email providers for system notifications and communications
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEmailForm(true)}
              className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          </div>

          {emailProviders.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-[#A0A0A0] mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">No email providers configured</h4>
              <p className="text-[#A0A0A0] text-sm mb-4">Add an email provider to send system notifications</p>
              <button
                onClick={() => setShowEmailForm(true)}
                className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Add Your First Provider
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {emailProviders.map((provider) => (
                <div key={provider.id} className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{provider.name}</span>
                          {provider.isDefault && (
                            <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                          <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs px-2 py-1 rounded-full uppercase">
                            {provider.type}
                          </span>
                        </div>
                        <div className="text-[#A0A0A0] text-sm">{provider.fromEmail}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      {!provider.isDefault && (
                        <button
                          onClick={() => handleSetDefaultProvider(provider)}
                          disabled={isLoading}
                          className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-green-500 transition-colors px-3 py-1.5 rounded-lg text-sm"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleTestEmailProvider(provider)}
                        disabled={isLoading}
                        className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-blue-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Test
                      </button>
                      <button
                        onClick={() => startEditProvider(provider)}
                        className="border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-500 transition-colors px-3 py-1.5 rounded-lg text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmailProvider(provider)}
                        disabled={isLoading || provider.isDefault}
                        className="border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
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

      {/* Calendly Token Form Modal */}
      {showCalendlyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {editingProvider ? 'Edit Email Provider' : 'Add Email Provider'}
              </h3>
              <p className="text-[#A0A0A0] text-sm">
                Configure an email provider for sending system notifications.
              </p>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Provider Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Email Provider"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Provider Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={emailForm.type}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="smtp">SMTP</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    From Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailForm.fromEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="noreply@yourdomain.com"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    From Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.fromName}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="Your Company Name"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Provider-specific fields */}
              {emailForm.type === 'smtp' && (
                <div className="space-y-4">
                  <h4 className="text-white font-medium">SMTP Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Host</label>
                      <input
                        type="text"
                        value={emailForm.host}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="smtp.gmail.com"
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Port</label>
                      <input
                        type="number"
                        value={emailForm.port}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                        placeholder="587"
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={emailForm.username}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="your-email@domain.com"
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.password ? "text" : "password"}
                          value={emailForm.password}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="your-password"
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('password')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                        >
                          {showPasswords.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={emailForm.secure}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, secure: e.target.checked }))}
                      className="w-4 h-4 text-violet-600 bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-violet-500"
                    />
                    <label htmlFor="secure" className="text-white text-sm">Use SSL/TLS</label>
                  </div>
                </div>
              )}

              {emailForm.type === 'mailgun' && (
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Mailgun Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">API Key</label>
                      <div className="relative">
                        <input
                          type={showPasswords.apiKey ? "text" : "password"}
                          value={emailForm.apiKey}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('apiKey')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                        >
                          {showPasswords.apiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Domain</label>
                      <input
                        type="text"
                        value={emailForm.domain}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, domain: e.target.value }))}
                        placeholder="yourdomain.com"
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {emailForm.type === 'sendgrid' && (
                <div className="space-y-4">
                  <h4 className="text-white font-medium">SendGrid Configuration</h4>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">API Key</label>
                    <div className="relative">
                      <input
                        type={showPasswords.sendgridApiKey ? "text" : "password"}
                        value={emailForm.sendgridApiKey}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, sendgridApiKey: e.target.value }))}
                        placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('sendgridApiKey')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                      >
                        {showPasswords.sendgridApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {emailForm.type === 'ses' && (
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Amazon SES Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Access Key ID</label>
                      <input
                        type="text"
                        value={emailForm.accessKeyId}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, accessKeyId: e.target.value }))}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Secret Access Key</label>
                      <div className="relative">
                        <input
                          type={showPasswords.secretAccessKey ? "text" : "password"}
                          value={emailForm.secretAccessKey}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                          placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('secretAccessKey')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                        >
                          {showPasswords.secretAccessKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Region</label>
                    <select
                      value={emailForm.region}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">Europe (Ireland)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetEmailForm}
                  disabled={isLoading}
                  className="flex-1 border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555] py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEmailProvider}
                  disabled={isLoading || !emailForm.name.trim() || !emailForm.fromEmail.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white py-3 px-4 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingProvider ? 'Update Provider' : 'Add Provider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
