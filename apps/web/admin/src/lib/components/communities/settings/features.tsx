import { Input, Label } from '@nlc-ai/web-ui';
import { CommunityResponse } from '@nlc-ai/types';

interface FeaturesSettingsProps {
  community: CommunityResponse;
  errors: Record<string, string>;
  onUpdateSettings: (setting: string, value: any) => void;
  onUpdate?: (updates: Partial<CommunityResponse>) => void;
}

const featureToggles = [
  {
    key: 'allowMemberPosts',
    label: 'Allow Member Posts',
    description: 'Members can create and publish posts',
    icon: '📝',
  },
  {
    key: 'requireApproval',
    label: 'Post Approval Required',
    description: 'All posts must be approved by moderators',
    icon: '✅',
  },
  {
    key: 'allowFileUploads',
    label: 'File Uploads',
    description: 'Members can upload images and files',
    icon: '📎',
  },
  {
    key: 'allowPolls',
    label: 'Polls & Surveys',
    description: 'Members can create interactive polls',
    icon: '📊',
  },
  {
    key: 'allowEvents',
    label: 'Community Events',
    description: 'Members can create and manage events',
    icon: '📅',
  },
];

const moderationLevels = [
  {
    value: 'strict',
    label: 'Strict',
    description: 'All content requires manual approval',
    color: 'text-red-400 border-red-600/30 bg-red-600/20',
    icon: '🚫',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Balanced moderation with some automation',
    color: 'text-yellow-400 border-yellow-600/30 bg-yellow-600/20',
    icon: '⚖️',
  },
  {
    value: 'relaxed',
    label: 'Relaxed',
    description: 'Minimal moderation, mostly automated',
    color: 'text-green-400 border-green-600/30 bg-green-600/20',
    icon: '🟢',
  },
];

export const FeaturesSettings = ({ community, errors, onUpdateSettings, onUpdate }: FeaturesSettingsProps) => {
  const settings = community.settings || {};

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full border-2 transition-all duration-200 flex items-center ${
        enabled
          ? 'bg-gradient-to-r from-purple-600 to-violet-600 border-purple-500 justify-end'
          : 'bg-neutral-700 border-neutral-600 justify-start'
      }`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
        enabled ? 'translate-x-0' : 'translate-x-0'
      }`} />
    </button>
  );

  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6 lg:p-8">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 -left-16 -top-24 bg-gradient-to-r from-blue-400 via-purple-500 to-fuchsia-600 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white mb-6">Features & Moderation</h2>

          <div className="space-y-8">
            {/* Feature Toggles */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Community Features</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {featureToggles.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/50 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-xl mt-0.5">{feature.icon}</div>
                      <div>
                        <div className="text-white font-medium text-sm">{feature.label}</div>
                        <div className="text-stone-400 text-xs mt-1 leading-relaxed">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={Boolean(settings[feature.key])}
                      onChange={(value) => onUpdateSettings(feature.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Max Post Length */}
              <div className="space-y-3">
                <Label htmlFor="maxPostLength" className="text-stone-300 text-sm font-medium">
                  Maximum Post Length
                </Label>
                <div className="relative">
                  <Input
                    id="maxPostLength"
                    type="number"
                    value={settings.maxPostLength || 5000}
                    onChange={(e) => onUpdateSettings('maxPostLength', parseInt(e.target.value) || 5000)}
                    min="100"
                    max="10000"
                    className={`bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                      errors.maxPostLength ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <span className="text-stone-400 text-sm">characters</span>
                  </div>
                </div>
                {errors.maxPostLength && (
                  <p className="text-red-400 text-sm">{errors.maxPostLength}</p>
                )}
                <p className="text-stone-400 text-xs">
                  Range: 100 - 10,000 characters. Longer posts encourage quality content.
                </p>
              </div>

              {/* Active Status */}
              <div className="space-y-3">
                <Label className="text-stone-300 text-sm font-medium">
                  Community Status
                </Label>
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/50">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {community.isActive ? '🟢' : '🔴'}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {community.isActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-stone-400 text-xs">
                        {community.isActive
                          ? 'Community is visible and accessible to members'
                          : 'Community is hidden and inaccessible'
                        }
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={community.isActive}
                    onChange={(value) => onUpdate?.({ isActive: value })}
                  />
                </div>
              </div>
            </div>

            {/* Moderation Level */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Moderation Level</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {moderationLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.moderationLevel === level.value
                        ? `${level.color} border-current transform scale-[1.02]`
                        : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                    }`}
                    onClick={() => onUpdateSettings('moderationLevel', level.value)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl">{level.icon}</div>
                      <div className="text-white font-medium text-sm">{level.label}</div>
                    </div>
                    <div className="text-stone-400 text-xs leading-relaxed">
                      {level.description}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-400 text-sm">💡</div>
                  <p className="text-blue-300 text-xs">
                    <strong>Tip:</strong> Start with "Moderate" and adjust based on your community's needs.
                    You can always change this setting later.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Features Preview */}
            <div className="border border-neutral-600/50 rounded-xl p-4 bg-neutral-800/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">Advanced Features</h4>
                <div className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium">
                  Coming Soon
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-stone-400">
                  <div>🤖</div>
                  <span>AI Content Moderation</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <div>📈</div>
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <div>🎨</div>
                  <span>Custom Themes</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <div>🔗</div>
                  <span>External Integrations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
