import React, { useState } from 'react';
import {PricingCard, OneTimeForm, SubscriptionForm, MonthlyPlanForm} from "./partials";

type PricingOption = 'free' | 'one-time' | 'subscription' | 'monthly';

interface PaywallTabProps {
  courseID: string;
}

export const PaywallTab: React.FC<PaywallTabProps> = ({ courseID }) => {
  const [selectedOption, setSelectedOption] = useState<PricingOption>('one-time');
  const [formData, setFormData] = useState({
    oneTimePrice: '2000',
    subscriptionPrice: '97',
    subscriptionFrequency: 'monthly',
    monthlyInstallments: '3',
    monthlyAmount: '667',
    enrollmentDuration: '',
    enrollmentDurationUnit: 'months'
  });

  const handleSave = () => {
    console.log('Saving paywall settings for course:', courseID, {
      type: selectedOption,
      ...formData
    });
    // TODO: Implement API call
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'monthlyInstallments' && formData.oneTimePrice) {
      const amount = Math.ceil(parseFloat(formData.oneTimePrice) / parseInt(value));
      setFormData(prev => ({ ...prev, monthlyAmount: amount.toString() }));
    }
  };

  return (
    <div className="space-y-6 relative z-10 max-h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-xl font-semibold">Pricing Options</h3>
        <button
          onClick={handleSave}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity self-start"
        >
          Save Settings
        </button>
      </div>

      <div className="flex flex-col items-start gap-6 self-stretch">
        <PricingCard
          title="Free"
          description="Offer free content to your subscribers. Optionally, you can set an enrollment duration that will limit the time students have access to your content."
          isSelected={selectedOption === 'free'}
          onSelect={() => setSelectedOption('free')}
        />

        <PricingCard
          title="One-time payment"
          description="Charge students a one-time fee to access the content. Optionally, you can set an enrollment duration that will limit the time students have access to your content."
          isSelected={selectedOption === 'one-time'}
          onSelect={() => setSelectedOption('one-time')}
        >
          <OneTimeForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        </PricingCard>

        <PricingCard
          title="Subscription / Membership"
          description="Charge students recurring monthly fee for access to course content"
          isSelected={selectedOption === 'subscription'}
          onSelect={() => setSelectedOption('subscription')}
        >
          <SubscriptionForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        </PricingCard>

        <PricingCard
          title="Monthly Payment Plan"
          description="Divide the full price of your course into monthly payments"
          isSelected={selectedOption === 'monthly'}
          onSelect={() => setSelectedOption('monthly')}
        >
          <MonthlyPlanForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        </PricingCard>
      </div>
    </div>
  );
};
