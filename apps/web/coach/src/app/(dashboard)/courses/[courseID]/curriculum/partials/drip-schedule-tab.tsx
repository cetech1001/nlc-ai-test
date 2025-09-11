import React, { useState } from 'react';

interface DripScheduleTabProps {
  courseID: string;
}

export const DripScheduleTab: React.FC<DripScheduleTabProps> = ({ courseID }) => {
  const [dripSettings, setDripSettings] = useState({
    isDripEnabled: false,
    dripInterval: 'weekly',
    dripCount: 1,
    autoUnlockChapters: true,
    completionThreshold: 80
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving drip settings for course:', courseID, dripSettings);
  };

  return (
    <div className="space-y-6 relative z-10">
      <h3 className="text-white text-xl font-semibold">Drip Schedule Settings</h3>

      <div className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable Drip Content</h4>
              <p className="text-stone-300 text-sm">Release course content gradually over time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dripSettings.isDripEnabled}
                onChange={(e) => setDripSettings(prev => ({ ...prev, isDripEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {dripSettings.isDripEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Release Interval</label>
                  <select
                    value={dripSettings.dripInterval}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, dripInterval: e.target.value }))}
                    className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Lessons per Release</label>
                  <input
                    type="number"
                    min="1"
                    value={dripSettings.dripCount}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, dripCount: parseInt(e.target.value) }))}
                    className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-medium">Auto-unlock Chapters</h5>
                    <p className="text-stone-400 text-sm">Automatically unlock next chapter when previous is completed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dripSettings.autoUnlockChapters}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, autoUnlockChapters: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Completion Threshold ({dripSettings.completionThreshold}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dripSettings.completionThreshold}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, completionThreshold: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-stone-400 text-sm mt-1">Minimum completion percentage before unlocking next content</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity"
      >
        Save Drip Settings
      </button>
    </div>
  );
};
