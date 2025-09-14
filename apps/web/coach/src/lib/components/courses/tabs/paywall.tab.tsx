import { cn } from "@nlc-ai/web-ui";
import React, { useState } from 'react';

type PricingOption = 'free' | 'one-time' | 'subscription' | 'monthly';

interface PricingCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  isDisabled?: boolean;
  availabilityBadge?: string;
  onSelect: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
                                                   title,
                                                   description,
                                                   isSelected,
                                                   isDisabled = false,
                                                   availabilityBadge,
                                                   onSelect
                                                 }) => {
  return (
    <div
      className={cn(
        "flex p-6 flex-col items-start gap-4 self-stretch rounded-2xl border border-[#454444] cursor-pointer transition-colors",
        "bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]",
        isSelected && "border-[#DF69FF]",
        isDisabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={!isDisabled ? onSelect : undefined}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex w-5 h-5 p-1 justify-center items-center gap-[10px] rounded-full border",
          isSelected ? "border-[#DF69FF]" : "border-white/40"
        )}>
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-[#DF69FF]"></div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className={cn(
            "font-inter text-xl font-medium leading-6",
            isDisabled ? "text-[#F9F9F9]/60" : "text-[#F9F9F9]"
          )}>
            {title}
          </span>

          {availabilityBadge && (
            <div className="flex px-[6px] py-1 justify-center items-center gap-[10px] rounded-lg bg-[#333]">
              <span className="text-white font-inter text-sm font-semibold leading-5">
                {availabilityBadge}
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="self-stretch text-[#838383] font-inter text-base font-normal">
        {description}
      </p>
    </div>
  );
};

interface PaywallTabProps {
  courseID: string;
}

export const PaywallTab: React.FC<PaywallTabProps> = ({ courseID }) => {
  const [selectedOption, setSelectedOption] = useState<PricingOption>('one-time');

  /*const [paywallSettings, setPaywallSettings] = useState({
    isEnabled: false,
    freePreviewChapters: 1,
    paywallMessage: 'Unlock the full course to continue your learning journey!',
    priceOptions: [
      { type: 'one_time', price: 99, label: 'Full Access' },
      { type: 'installment', price: 33, installments: 3, label: '3 Monthly Payments' }
    ]
  });*/

  const handleSave = () => {
    // TODO: Implement save functionality
    // console.log('Saving paywall settings for course:', courseID, paywallSettings);
  };

  const handleOptionSelect = (option: PricingOption) => {
    setSelectedOption(option);
  };

  /*const updatePriceOption = (index: number, field: string, value: string) => {
    const newOptions = [...paywallSettings.priceOptions];
    (newOptions[index] as any)[field] = value;
    setPaywallSettings(prev => ({ ...prev, priceOptions: newOptions }));
  };*/

  return (
    <div className="space-y-6 relative z-10 overflow-scroll">
      <h3 className="text-white text-xl font-semibold">Paywall Settings</h3>

      <div className="flex flex-col items-start gap-3 self-stretch">
        <PricingCard
          title="Free"
          description="Offer free content to your subscribers. Optionally, you can set an enrollement duration that will limit the time students have access to your content"
          isSelected={selectedOption === 'free'}
          onSelect={() => handleOptionSelect('free')}
        />

        <div className="flex flex-col items-start gap-6 self-stretch">
          <PricingCard
            title="One-time payment"
            description="Charge studets a one time fee to access the content. Optionally, you can set an enrollment duration that will limit the time students have access to your content."
            isSelected={selectedOption === 'one-time'}
            onSelect={() => handleOptionSelect('one-time')}
          />

          {/* Your Primary Price Display */}
          {selectedOption === 'one-time' && (
            <div className="flex p-6 items-center gap-[30px] self-stretch rounded-[20px] border border-[#2B2A2A] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
              <div className="flex flex-col items-start gap-2 flex-1">
                <h4 className="text-white font-inter text-xl font-semibold leading-[25.6px]">
                  Your primary price
                </h4>
                <p className="self-stretch text-white font-inter text-lg font-normal">
                  One Time payment of $2,000.00
                </p>
              </div>

              <div className="flex items-center gap-5">
                <button className="flex h-10 px-[18px] py-[13px] justify-center items-center gap-2 rounded-lg border border-white">
                        <span className="text-white font-inter text-sm font-semibold leading-6 tracking-[-0.32px]">
                          Copy
                        </span>
                </button>

                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.75 12C6.75 12.1989 6.67098 12.3897 6.53033 12.5303C6.38968 12.671 6.19891 12.75 6 12.75C5.80109 12.75 5.61032 12.671 5.46967 12.5303C5.32902 12.3897 5.25 12.1989 5.25 12C5.25 11.8011 5.32902 11.6103 5.46967 11.4697C5.61032 11.329 5.80109 11.25 6 11.25C6.19891 11.25 6.38968 11.329 6.53033 11.4697C6.67098 11.6103 6.75 11.8011 6.75 12ZM12.75 12C12.75 12.1989 12.671 12.3897 12.5303 12.5303C12.3897 12.671 12.1989 12.75 12 12.75C11.8011 12.75 11.6103 12.671 11.4697 12.5303C11.329 12.3897 11.25 12.1989 11.25 12C11.25 11.8011 11.329 11.6103 11.4697 11.4697C11.6103 11.329 11.8011 11.25 12 11.25C12.1989 11.25 12.3897 11.329 12.5303 11.4697C12.671 11.6103 12.75 11.8011 12.75 12ZM18.75 12C18.75 12.1989 18.671 12.3897 18.5303 12.5303C18.3897 12.671 18.1989 12.75 18 12.75C17.8011 12.75 17.6103 12.671 17.4697 12.5303C17.329 12.3897 17.25 12.1989 17.25 12C17.25 11.8011 17.329 11.6103 17.4697 11.4697C17.6103 11.329 17.8011 11.25 18 11.25C18.1989 11.25 18.3897 11.329 18.5303 11.4697C18.671 11.6103 18.75 11.8011 18.75 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        <PricingCard
          title="Subscription / Membership"
          description="Charge students recurring monthly feed for access to course content"
          isSelected={selectedOption === 'subscription'}
          isDisabled={true}
          availabilityBadge="Avaible on Start and above"
          onSelect={() => handleOptionSelect('subscription')}
        />

        <PricingCard
          title="Monthly Payment Plan"
          description="Divide the full price of your course into montly payments"
          isSelected={selectedOption === 'monthly'}
          isDisabled={true}
          availabilityBadge="Avaible on Start and above"
          onSelect={() => handleOptionSelect('monthly')}
        />
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
