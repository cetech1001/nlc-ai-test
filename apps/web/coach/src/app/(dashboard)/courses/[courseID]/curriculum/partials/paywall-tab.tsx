import React, { useState } from 'react';

interface PaywallTabProps {
  courseID: string;
}

export const PaywallTab: React.FC<PaywallTabProps> = ({ courseID }) => {
  const [paywallSettings, setPaywallSettings] = useState({
    isEnabled: false,
    freePreviewChapters: 1,
    paywallMessage: 'Unlock the full course to continue your learning journey!',
    priceOptions: [
      { type: 'one_time', price: 99, label: 'Full Access' },
      { type: 'installment', price: 33, installments: 3, label: '3 Monthly Payments' }
    ]
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving paywall settings for course:', courseID, paywallSettings);
  };

  const updatePriceOption = (index: number, field: string, value: string) => {
    const newOptions = [...paywallSettings.priceOptions];
    (newOptions[index] as any)[field] = value;
    setPaywallSettings(prev => ({ ...prev, priceOptions: newOptions }));
  };

  return (
    <div className="space-y-6 relative z-10">
      <h3 className="text-white text-xl font-semibold">Paywall Settings</h3>

      <div className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable Paywall</h4>
              <p className="text-stone-300 text-sm">Restrict access to course content behind payment</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paywallSettings.isEnabled}
                onChange={(e) => setPaywallSettings(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {paywallSettings.isEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Free Preview Chapters</label>
                <input
                  type="number"
                  min="0"
                  value={paywallSettings.freePreviewChapters}
                  onChange={(e) => setPaywallSettings(prev => ({ ...prev, freePreviewChapters: parseInt(e.target.value) }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
                />
                <p className="text-stone-400 text-sm mt-1">Number of chapters accessible for free</p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Paywall Message</label>
                <textarea
                  value={paywallSettings.paywallMessage}
                  onChange={(e) => setPaywallSettings(prev => ({ ...prev, paywallMessage: e.target.value }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 h-20 resize-none"
                  placeholder="Message shown when users hit the paywall..."
                />
              </div>

              <div>
                <h5 className="text-white font-medium mb-3">Payment Options</h5>
                <div className="space-y-3">
                  {paywallSettings.priceOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-neutral-700/50 rounded-lg">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => updatePriceOption(index, 'label', e.target.value)}
                        className="flex-1 bg-neutral-600 border border-neutral-500 text-white rounded px-2 py-1 text-sm"
                      />
                      <span className="text-white text-sm">${option.price}</span>
                      {option.installments && (
                        <span className="text-stone-400 text-sm">({option.installments}x)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity"
      >
        Save Paywall Settings
      </button>
    </div>
  );
};
