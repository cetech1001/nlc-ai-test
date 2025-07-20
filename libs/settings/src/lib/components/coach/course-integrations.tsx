import { FC, useState, useEffect } from 'react';
import { Check, Settings, Trash2, Plus, AlertCircle, BookOpen, Eye, EyeOff } from 'lucide-react';
import { CourseIntegration, CoursePlatform, CoursePlatformConfig } from '../../types/settings.types';
import { useSettings } from '../../context/settings.context';
import { CourseIntegrationsSkeleton } from '../skeletons';

interface CourseIntegrationsProps {
  onConnectCourse: (platform: CoursePlatform, credentials: any) => Promise<CourseIntegration>;
  onDisconnectCourse: (integrationId: string) => Promise<void>;
  onTestCourse: (integrationId: string) => Promise<void>;
  onUpdateCourse: (integrationId: string, data: Partial<CourseIntegration>) => Promise<CourseIntegration>;
  getCourseIntegrations: () => Promise<CourseIntegration[]>;
}

const coursePlatforms: Record<CoursePlatform, CoursePlatformConfig> = {
  kajabi: {
    name: 'Kajabi',
    icon: '🎓',
    color: 'from-orange-500 to-red-600',
    fields: [
      { name: 'subdomain', type: 'text', placeholder: 'yoursite', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Kajabi API key', required: true },
    ],
  },
  skool: {
    name: 'Skool',
    icon: '🏫',
    color: 'from-green-500 to-emerald-600',
    fields: [
      { name: 'communityUrl', type: 'url', placeholder: 'https://skool.com/your-community', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Skool API key', required: true },
    ],
  },
  thinkific: {
    name: 'Thinkific',
    icon: '💡',
    color: 'from-blue-500 to-purple-600',
    fields: [
      { name: 'subdomain', type: 'text', placeholder: 'yourschool', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Thinkific API key', required: true },
    ],
  },
  teachable: {
    name: 'Teachable',
    icon: '📚',
    color: 'from-purple-500 to-pink-600',
    fields: [
      { name: 'schoolUrl', type: 'url', placeholder: 'https://yourschool.teachable.com', required: true },
      { name: 'apiKey', type: 'password', placeholder: 'Your Teachable API key', required: true },
    ],
  },
};

export const CourseIntegrations: FC<CourseIntegrationsProps> = ({
  onConnectCourse,
  onDisconnectCourse,
  onTestCourse,
  onUpdateCourse,
  getCourseIntegrations,
}) => {
  const { setError, setSuccess } = useSettings();

  const [courseIntegrations, setCourseIntegrations] = useState<CourseIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<CourseIntegration | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<CoursePlatform>('kajabi');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await getCourseIntegrations();
      setCourseIntegrations(data);
    } catch (error: any) {
      setError('Failed to load course integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCourse = async () => {
    const platform = coursePlatforms[selectedPlatform];
    const missingFields = platform.fields.filter(field => field.required && !formData[field.name]?.trim());

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      const credentials = { ...formData };

      let integration: any;

      if (editingIntegration) {
        integration = await onUpdateCourse(editingIntegration.id, { config: credentials });
        setCourseIntegrations(prev => prev.map(i => i.id === editingIntegration.id ? integration : i));
        setSuccess(`${platform.name} integration updated successfully!`);
      } else {
        integration = await onConnectCourse(selectedPlatform, credentials);
        setCourseIntegrations(prev => [...prev, integration]);
        setSuccess(`${platform.name} connected successfully!`);
      }

      resetForm();
    } catch (error: any) {
      setError(`Failed to ${editingIntegration ? 'update' : 'connect'} ${platform.name}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectCourse = async (integration: CourseIntegration) => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}? This will stop course data syncing.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await onDisconnectCourse(integration.id);
      setCourseIntegrations(prev => prev.filter(i => i.id !== integration.id));
      setSuccess(`${integration.name} disconnected successfully`);
    } catch (error: any) {
      setError(`Failed to disconnect ${integration.name}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCourse = async (integration: CourseIntegration) => {
    try {
      setIsLoading(true);
      await onTestCourse(integration.id);
      setSuccess(`${integration.name} connection test successful!`);
    } catch (error: any) {
      setError(`${integration.name} connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (integration: CourseIntegration) => {
    setEditingIntegration(integration);
    setSelectedPlatform(integration.platform as CoursePlatform);
    setFormData(integration.config || {});
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingIntegration(null);
    setSelectedPlatform('kajabi');
    setFormData({});
    setShowPassword({});
  };

  const getConnectedPlatforms = () => {
    return courseIntegrations.map(integration => integration.platform);
  };

  const getAvailablePlatforms = () => {
    const connected = getConnectedPlatforms();
    return Object.keys(coursePlatforms).filter(platform => !connected.includes(platform)) as CoursePlatform[];
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  if (isLoading && courseIntegrations.length === 0) {
    return <CourseIntegrationsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Course Integrations</h1>
        <p className="text-stone-400">Connect your course platforms to sync student data and track engagement</p>
      </div>

      {/* Main Integration Card */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        {/* Background glow orb - matching stat-card.tsx exactly */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Course Platform Integrations</h3>
                <p className="text-stone-400 text-sm">
                  Connect your course platforms to track student progress and automate engagement
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <span className="text-blue-400 text-sm font-medium">
                  {courseIntegrations.length} Connected
                </span>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Integration
              </button>
            </div>
          </div>

          {/* Connected Platforms */}
          {courseIntegrations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Connected Platforms</h4>
              <div className="space-y-4">
                {courseIntegrations.map((integration) => {
                  const platformConfig = coursePlatforms[integration.platform as CoursePlatform];
                  return (
                    <div key={integration.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${platformConfig.color} rounded-full flex items-center justify-center text-lg`}>
                            {platformConfig.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{integration.name}</span>
                              {integration.isConnected && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                  <Check className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400 text-xs font-medium">Connected</span>
                                </div>
                              )}
                            </div>
                            <div className="text-stone-400 text-sm">
                              {integration.config?.subdomain && `${integration.config.subdomain}.${integration.platform}.com`}
                              {integration.config?.schoolUrl && integration.config.schoolUrl}
                              {integration.config?.communityUrl && integration.config.communityUrl}
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
                            onClick={() => handleTestCourse(integration)}
                            disabled={isLoading}
                            className="border border-neutral-700 text-stone-300 hover:text-white hover:border-blue-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Test
                          </button>
                          <button
                            onClick={() => startEdit(integration)}
                            className="border border-neutral-700 text-stone-300 hover:text-white hover:border-violet-500 transition-colors px-3 py-1.5 rounded-lg text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDisconnectCourse(integration)}
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

          {/* Available Platforms Grid */}
          {courseIntegrations.length === 0 && (
            <div className="mb-8">
              <h4 className="text-white font-medium mb-4">Available Platforms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(coursePlatforms).map(([platform, config]) => (
                  <div key={platform} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center text-xl`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{config.name}</div>
                        <div className="text-stone-400 text-sm">Student management & analytics</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlatform(platform as CoursePlatform);
                        setShowAddForm(true);
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Connect {config.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-neutral-800/30 border border-neutral-700 rounded-xl p-6">
            <h4 className="text-white font-medium mb-4">What you can do with course integrations:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-stone-400 text-sm">Track student progress automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-stone-400 text-sm">Send automated engagement emails</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-stone-400 text-sm">Identify at-risk students early</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-stone-400 text-sm">Generate completion certificates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Integration Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {editingIntegration ? `Edit ${coursePlatforms[selectedPlatform].name}` : `Connect ${coursePlatforms[selectedPlatform].name}`}
              </h3>
              <p className="text-stone-400 text-sm">
                Enter your {coursePlatforms[selectedPlatform].name} credentials to connect your course platform.
              </p>
            </div>

            <div className="space-y-4">
              {/* Platform Selection (only for new integrations) */}
              {!editingIntegration && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => {
                      setSelectedPlatform(e.target.value as CoursePlatform);
                      setFormData({});
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {getAvailablePlatforms().map(platform => (
                      <option key={platform} value={platform}>
                        {coursePlatforms[platform].name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Fields */}
              {coursePlatforms[selectedPlatform].fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-white text-sm font-medium mb-2">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1')}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPassword[field.name] ? 'password' : 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-12"
                      disabled={isLoading}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Help Text */}
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">How to get your {coursePlatforms[selectedPlatform].name} credentials:</h4>
                    <div className="text-stone-400 text-xs space-y-1">
                      {selectedPlatform === 'kajabi' && (
                        <>
                          <div>1. Go to Settings → Integrations in your Kajabi dashboard</div>
                          <div>2. Generate an API key under "API Keys"</div>
                          <div>3. Your subdomain is the part before .kajabi.com in your URL</div>
                        </>
                      )}
                      {selectedPlatform === 'thinkific' && (
                        <>
                          <div>1. Go to Settings → API in your Thinkific dashboard</div>
                          <div>2. Generate an API key</div>
                          <div>3. Your subdomain is the part before .thinkific.com in your URL</div>
                        </>
                      )}
                      {selectedPlatform === 'teachable' && (
                        <>
                          <div>1. Go to Settings → API in your Teachable dashboard</div>
                          <div>2. Generate an API key</div>
                          <div>3. Your school URL is your full Teachable domain</div>
                        </>
                      )}
                      {selectedPlatform === 'skool' && (
                        <>
                          <div>1. Contact Skool support to get API access</div>
                          <div>2. Your community URL is your full Skool community link</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  disabled={isLoading}
                  className="flex-1 border border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500 py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectCourse}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white py-3 px-4 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : editingIntegration ? 'Update Integration' : 'Connect Platform'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
