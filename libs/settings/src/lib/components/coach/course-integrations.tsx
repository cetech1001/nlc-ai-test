import {FC, useState, useEffect, ReactNode} from 'react';
import { Check, Settings, Trash2, Plus, AlertCircle, BookOpen, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useSettings } from '../../context/settings.context';
import { CourseIntegrationsSkeleton } from '../skeletons';
import { integrationsAPI, CourseIntegrationResponse, CoursePlatformInfo } from '@nlc-ai/api-client';

// Updated interfaces to match backend
interface CourseIntegration extends CourseIntegrationResponse {
  name?: string;
  platform: string;
  isConnected?: boolean;
}

type CoursePlatform = 'thinkific' | 'teachable' | 'kajabi' | 'skool';

interface CoursePlatformConfig {
  name: string;
  icon: ReactNode;
  color: string;
  fields: Array<{
    name: string;
    type: string;
    placeholder: string;
    required: boolean;
  }>;
  description?: string;
  setupInstructions?: string[];
}

interface CourseIntegrationsProps {
  // Optional props - component will use the new API client directly
  onConnectCourse?: (platform: CoursePlatform, credentials: any) => Promise<CourseIntegration>;
  onDisconnectCourse?: (integrationId: string) => Promise<void>;
  onTestCourse?: (integrationId: string) => Promise<void>;
  onUpdateCourse?: (integrationId: string, data: Partial<CourseIntegration>) => Promise<CourseIntegration>;
  getCourseIntegrations?: () => Promise<CourseIntegration[]>;
}

export const CourseIntegrations: FC<CourseIntegrationsProps> = (props) => {
  const { setError, setSuccess } = useSettings();

  const [courseIntegrations, setCourseIntegrations] = useState<any[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<Record<string, CoursePlatformInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<CourseIntegration | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<CoursePlatform>('thinkific');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [testingCredentials, setTestingCredentials] = useState(false);

  // Create platform configs from API data
  const createPlatformConfig = (platform: string, info: CoursePlatformInfo): CoursePlatformConfig => {
    const icons: Record<string, ReactNode> = {
      thinkific: <img src={"/images/icons/thinkific-icon.png"} alt={"Thinkific Icon"}/>,
      teachable: <img src={"/images/icons/teachable-icon.png"} alt={"Teachable Icon"}/>,
      kajabi: <img src={"/images/icons/kajabi-icon.png"} alt={"Kajabi Icon"}/>,
      skool: <img src={"/images/icons/skool-icon.png"} alt={"Skool Icon"}/>,
    };

    const fields = info.requiredFields.map(fieldName => {
      const fieldMappings: Record<string, any> = {
        subdomain: { type: 'text', placeholder: 'yourschool' },
        apiKey: { type: 'password', placeholder: `Your ${info.name} API key` },
        schoolUrl: { type: 'url', placeholder: 'https://yourschool.teachable.com' },
        groupUrl: { type: 'url', placeholder: 'https://skool.com/your-community' },
        zapierApiKey: { type: 'password', placeholder: 'Your Zapier API key' },
        clientId: { type: 'text', placeholder: 'Your client ID' },
        clientSecret: { type: 'password', placeholder: 'Your client secret' }
      };

      return {
        name: fieldName,
        type: fieldMappings[fieldName]?.type || 'text',
        placeholder: fieldMappings[fieldName]?.placeholder || `Your ${fieldName}`,
        required: true
      };
    });

    return {
      name: info.name,
      icon: icons[platform] || '🔗',
      color: '',
      fields,
      description: info.description,
      setupInstructions: info.setupInstructions
    };
  };

  useEffect(() => {
    loadPlatformsAndIntegrations();
  }, []);

  const loadPlatformsAndIntegrations = async () => {
    try {
      setIsLoading(true);

      // Load available platforms
      const platforms = await integrationsAPI.getAvailableCoursePlatforms();
      setAvailablePlatforms(platforms);

      // Load integrations
      await loadIntegrations();
    } catch (error: any) {
      setError('Failed to load course platforms');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      // Use provided function or API client
      const data = props.getCourseIntegrations
        ? await props.getCourseIntegrations()
        : await integrationsAPI.getCourseIntegrations();

      // Transform data to match expected format
      const transformedData = data.map(integration => ({
        ...integration,
        name: integration.config?.name || availablePlatforms[integration.platformName]?.name || integration.platformName,
        platform: integration.platformName,
        isConnected: integration.isActive
      }));

      setCourseIntegrations(transformedData);
    } catch (error: any) {
      setError('Failed to load course integrations');
    }
  };

  const testCredentials = async () => {
    if (!selectedPlatform || Object.keys(formData).length === 0) {
      setError('Please fill in credentials before testing');
      return;
    }

    try {
      setTestingCredentials(true);
      const result = await integrationsAPI.testCoursePlatformCredentials(selectedPlatform, formData);

      if (result.success) {
        setSuccess('Credentials are valid! You can now connect.');
      } else {
        setError('Invalid credentials. Please check your information.');
      }
    } catch (error: any) {
      setError(`Failed to test credentials: ${error.message}`);
    } finally {
      setTestingCredentials(false);
    }
  };

  const handleConnectCourse = async () => {
    const platformInfo = availablePlatforms[selectedPlatform];
    if (!platformInfo) {
      setError('Platform information not available');
      return;
    }

    const missingFields = platformInfo.requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      const credentials = { ...formData };

      let integration: any;

      if (editingIntegration) {
        // Update existing integration
        integration = props.onUpdateCourse
          ? await props.onUpdateCourse(editingIntegration.id, { config: credentials })
          : await integrationsAPI.updateIntegration(editingIntegration.id, { config: credentials });

        setCourseIntegrations(prev => prev.map(i =>
          i.id === editingIntegration.id ? { ...integration, name: platformInfo.name, platform: selectedPlatform, isConnected: true } : i
        ));
        setSuccess(`${platformInfo.name} integration updated successfully!`);
      } else {
        // Connect new integration
        integration = props.onConnectCourse
          ? await props.onConnectCourse(selectedPlatform, credentials)
          : await integrationsAPI.connectCoursePlatform(selectedPlatform, credentials);

        const newIntegration = {
          ...integration,
          name: platformInfo.name,
          platform: selectedPlatform,
          isConnected: true
        };

        setCourseIntegrations(prev => [...prev, newIntegration]);
        setSuccess(`${platformInfo.name} connected successfully!`);
      }

      resetForm();
    } catch (error: any) {
      setError(`Failed to ${editingIntegration ? 'update' : 'connect'} ${platformInfo.name}: ${error.message}`);
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

      if (props.onDisconnectCourse) {
        await props.onDisconnectCourse(integration.id);
      } else {
        await integrationsAPI.disconnectIntegration(integration.id);
      }

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

      if (props.onTestCourse) {
        await props.onTestCourse(integration.id);
      } else {
        await integrationsAPI.testIntegration(integration.id);
      }

      setSuccess(`${integration.name} connection test successful!`);
    } catch (error: any) {
      setError(`${integration.name} connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCourse = async (integration: CourseIntegration) => {
    try {
      setIsLoading(true);
      await integrationsAPI.syncCoursePlatformData(integration.id);

      // Reload integrations to show updated sync data
      await loadIntegrations();
      setSuccess(`${integration.name} data synced successfully!`);
    } catch (error: any) {
      setError(`Failed to sync ${integration.name}: ${error.message}`);
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
    setSelectedPlatform('thinkific');
    setFormData({});
    setShowPassword({});
  };

  const getConnectedPlatforms = () => {
    return courseIntegrations.map(integration => integration.platform);
  };

  const getAvailablePlatforms = () => {
    const connected = getConnectedPlatforms();
    return Object.keys(availablePlatforms).filter(platform => !connected.includes(platform)) as CoursePlatform[];
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  if (isLoading && courseIntegrations.length === 0) {
    return <CourseIntegrationsSkeleton />;
  }

  const currentPlatformConfig = availablePlatforms[selectedPlatform]
    ? createPlatformConfig(selectedPlatform, availablePlatforms[selectedPlatform])
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Course Integrations</h1>
        <p className="text-stone-400">Connect your course platforms to sync student data and track engagement</p>
      </div>

      {/* Main Integration Card */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        {/* Background glow orb */}
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
                disabled={getAvailablePlatforms().length === 0}
                className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
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
                  const platformInfo = availablePlatforms[integration.platform];
                  const platformConfig = platformInfo ? createPlatformConfig(integration.platform, platformInfo) : null;

                  return (
                    <div key={integration.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg`}>
                            {platformConfig?.icon || '🔗'}
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
                              {!integration.isConnected && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                                  <AlertCircle className="w-3 h-3 text-red-400" />
                                  <span className="text-red-400 text-xs font-medium">Error</span>
                                </div>
                              )}
                            </div>
                            <div className="text-stone-400 text-sm">
                              {integration.config?.subdomain && `${integration.config.subdomain}.${integration.platform}.com`}
                              {integration.config?.schoolUrl && integration.config.schoolUrl}
                              {integration.config?.groupUrl && integration.config.groupUrl}
                              {integration.config?.name && !integration.config.subdomain && !integration.config.schoolUrl && !integration.config.groupUrl && integration.config.name}
                            </div>
                            {integration.config?.stats && (
                              <div className="text-stone-500 text-xs">
                                {integration.config.stats.totalCourses && `${integration.config.stats.totalCourses} courses`}
                                {integration.config.stats.totalStudents && ` • ${integration.config.stats.totalStudents} students`}
                              </div>
                            )}
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
                            onClick={() => handleSyncCourse(integration)}
                            disabled={isLoading}
                            className="border border-neutral-700 text-stone-300 hover:text-white hover:border-green-500 transition-colors px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Sync
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
          {courseIntegrations.length === 0 && Object.keys(availablePlatforms).length > 0 && (
            <div className="mb-8">
              <h4 className="text-white font-medium mb-4">Available Platforms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(availablePlatforms).map(([platform, info]) => {
                  const config = createPlatformConfig(platform, info);
                  return (
                    <div key={platform} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl`}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{config.name}</div>
                          <div className="text-stone-400 text-sm">
                            {info.description || 'Student management & analytics'}
                          </div>
                          {info.authType === 'webhook' && (
                            <div className="text-yellow-400 text-xs mt-1">Webhook integration</div>
                          )}
                          {platform === 'kajabi' && (
                            <div className="text-orange-400 text-xs mt-1">Private Beta</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPlatform(platform as CoursePlatform);
                          setShowAddForm(true);
                        }}
                        className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Connect {config.name}
                      </button>
                    </div>
                  );
                })}
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
      {showAddForm && currentPlatformConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {editingIntegration ? `Edit ${currentPlatformConfig.name}` : `Connect ${currentPlatformConfig.name}`}
              </h3>
              <p className="text-stone-400 text-sm">
                {currentPlatformConfig.description || `Enter your ${currentPlatformConfig.name} credentials to connect your course platform.`}
              </p>
            </div>

            <div className="space-y-4">
              {/* Platform Selection (only for new integrations) */}
              {!editingIntegration && getAvailablePlatforms().length > 1 && (
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
                        {availablePlatforms[platform]?.name || platform}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Fields */}
              {currentPlatformConfig.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-white text-sm font-medium mb-2">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1')}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPassword[field.name] ? 'password' : field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-12"
                      disabled={isLoading || testingCredentials}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                        disabled={isLoading || testingCredentials}
                      >
                        {showPassword[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Test Credentials Button */}
              {!editingIntegration && (
                <button
                  onClick={testCredentials}
                  disabled={isLoading || testingCredentials || Object.keys(formData).length === 0}
                  className="w-full border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors py-2 px-4 rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {testingCredentials ? 'Testing...' : 'Test Credentials'}
                </button>
              )}

              {/* Help Text */}
              {currentPlatformConfig.setupInstructions && (
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-2 text-sm">
                        How to get your {currentPlatformConfig.name} credentials:
                      </h4>
                      <div className="text-stone-400 text-xs space-y-1">
                        {currentPlatformConfig.setupInstructions.map((instruction, index) => (
                          <div key={index}>{index + 1}. {instruction}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  disabled={isLoading || testingCredentials}
                  className="flex-1 border border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500 py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectCourse}
                  disabled={isLoading || testingCredentials}
                  className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white py-3 px-4 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : editingIntegration ? 'Update Integration' : 'Connect Platform'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Platforms Connected State */}
      {courseIntegrations.length > 0 && getAvailablePlatforms().length === 0 && (
        <div className="text-center py-8">
          <div className="text-green-400 text-4xl mb-4">🎉</div>
          <h3 className="text-white font-medium text-lg mb-2">All platforms connected!</h3>
          <p className="text-stone-400 text-sm">
            You've connected all available course platforms. Use the sync buttons to keep your data updated.
          </p>
        </div>
      )}
    </div>
  );
};
