import { Input, Label } from '@nlc-ai/web-ui';
import { DollarSign, Users, Calendar, CreditCard, Zap } from 'lucide-react';
import { CommunityResponse } from '@nlc-ai/sdk-community';

interface PricingSettingsProps {
  community: CommunityResponse;
  errors: Record<string, string>;
  onUpdatePricing: (field: string, value: any) => void;
}

const pricingOptions = [
  {
    value: 'free',
    label: 'Free',
    icon: Users,
    description: 'Community is free to join',
    color: 'text-green-400 border-green-600/30 bg-green-600/20',
    popular: false,
  },
  {
    value: 'monthly',
    label: 'Monthly Subscription',
    icon: Calendar,
    description: 'Recurring monthly payment',
    color: 'text-blue-400 border-blue-600/30 bg-blue-600/20',
    popular: true,
  },
  {
    value: 'annual',
    label: 'Annual Subscription',
    icon: CreditCard,
    description: 'Recurring annual payment',
    color: 'text-purple-400 border-purple-600/30 bg-purple-600/20',
    popular: false,
  },
  {
    value: 'one_time',
    label: 'One-Time Payment',
    icon: Zap,
    description: 'Single payment for lifetime access',
    color: 'text-amber-400 border-amber-600/30 bg-amber-600/20',
    popular: false,
  },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const PricingSettings = ({ community, errors, onUpdatePricing }: PricingSettingsProps) => {
  const formatPrice = (amount: number | null | undefined, currency: string = 'USD') => {
    if (!amount) return '0.00';
    const currencyData = currencies.find(c => c.code === currency);
    return `${currencyData?.symbol || '$'}${(amount / 100).toFixed(2)}`;
  };

  const isPaidCommunity = community.pricingType !== 'free';

  // Get current price based on pricing type
  const getCurrentPrice = () => {
    switch (community.pricingType) {
      case 'one_time':
        return community.oneTimePrice || 0;
      case 'monthly':
        return community.monthlyPrice || 0;
      case 'annual':
        return community.annualPrice || 0;
      default:
        return 0;
    }
  };

  // Get current price field name and error
  const getCurrentPriceField = () => {
    switch (community.pricingType) {
      case 'one_time':
        return { field: 'oneTimePrice', error: errors.oneTimePrice };
      case 'monthly':
        return { field: 'monthlyPrice', error: errors.monthlyPrice };
      case 'annual':
        return { field: 'annualPrice', error: errors.annualPrice };
      default:
        return { field: '', error: '' };
    }
  };

  const { field: priceField, error: priceError } = getCurrentPriceField();
  const currentPrice = getCurrentPrice();

  const calculatePotentialRevenue = () => {
    const price = getCurrentPrice();
    if (!price || community.pricingType === 'free') return 0;
    return price * community.memberCount;
  };

  const getRevenuePeriod = () => {
    switch (community.pricingType) {
      case 'monthly':
        return 'monthly revenue';
      case 'annual':
        return 'annual revenue';
      case 'one_time':
        return 'revenue';
      default:
        return 'revenue';
    }
  };

  return (
    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6 lg:p-8">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 -right-16 -bottom-24 bg-gradient-to-l from-amber-400 via-orange-500 to-red-600 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Pricing & Access</h2>
            {isPaidCommunity && (
              <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium border border-green-600/30">
                💰 Monetized
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Pricing Model Selection */}
            <div>
              <Label className="text-stone-300 text-sm font-medium mb-4 block">
                Pricing Model
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pricingOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                        community.pricingType === option.value
                          ? `${option.color} border-current transform scale-[1.02]`
                          : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                      }`}
                      onClick={() => onUpdatePricing('pricingType', option.value)}
                    >
                      {option.popular && (
                        <div className="absolute -top-2 left-4">
                          <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-medium rounded">
                            Popular
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5" />
                        <div className="text-white font-medium text-sm">{option.label}</div>
                      </div>
                      <div className="text-stone-400 text-xs">{option.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Details - Only show for paid options */}
            {isPaidCommunity && (
              <div className="space-y-6 p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <div className="flex items-center gap-2 text-white font-medium">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Pricing Configuration
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price Amount */}
                  <div className="space-y-2">
                    <Label htmlFor={priceField} className="text-stone-300 text-sm font-medium">
                      {community.pricingType === 'monthly' ? 'Monthly Price' :
                        community.pricingType === 'annual' ? 'Annual Price' :
                          'One-Time Price'} <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        id={priceField}
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPrice ? (currentPrice / 100).toFixed(2) : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const amount = value ? Math.round(parseFloat(value) * 100) : 0;
                          onUpdatePricing(priceField, amount);
                        }}
                        placeholder="0.00"
                        className={`bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400 focus:border-purple-500 focus:ring-purple-500/20 pl-10 ${
                          priceError ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {priceError && (
                      <p className="text-red-400 text-sm">{priceError}</p>
                    )}
                    <p className="text-stone-400 text-xs">
                      Choose the currency for your community pricing
                    </p>
                  </div>
                </div>

                {/* Pricing Preview */}
                <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-600/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-sm">Pricing Preview</div>
                      <div className="text-stone-300 text-xs mt-1">
                        What members will see when joining
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(currentPrice, community.currency)}
                      </div>
                      <div className="text-purple-400 text-xs font-medium">
                        {community.pricingType === 'monthly' ? 'per month' :
                          community.pricingType === 'annual' ? 'per year' :
                            'one-time'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Projection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
                    <div className="text-lg font-bold text-green-400">
                      {formatPrice(calculatePotentialRevenue(), community.currency)}
                    </div>
                    <div className="text-stone-400 text-xs">
                      Current potential {getRevenuePeriod()}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">
                      {community.memberCount}
                    </div>
                    <div className="text-stone-400 text-xs">Current members</div>
                  </div>
                </div>
              </div>
            )}

            {/* Free Community Benefits */}
            {community.pricingType === 'free' && (
              <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-lg">🆓</div>
                  <div>
                    <div className="text-green-400 font-medium text-sm mb-1">Free Community Benefits</div>
                    <ul className="text-green-300 text-xs space-y-1">
                      <li>• No barriers to entry - maximum growth potential</li>
                      <li>• Build community and trust before monetizing</li>
                      <li>• Focus on content and engagement over payments</li>
                      <li>• Easy to convert to paid later with established base</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Monetization Tips */}
            {isPaidCommunity && (
              <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 text-lg">💡</div>
                  <div>
                    <div className="text-blue-400 font-medium text-sm mb-1">Monetization Tips</div>
                    <ul className="text-blue-300 text-xs space-y-1">
                      <li>• Start with a lower price to build initial membership</li>
                      <li>• Offer exclusive content and perks to justify the cost</li>
                      <li>• Consider a free trial period for new members</li>
                      <li>• Regular engagement increases perceived value</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Access Control Info */}
            <div className="border border-neutral-600/50 rounded-xl p-4 bg-neutral-800/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">Access Control</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    community.visibility === 'public' ? 'bg-green-400' :
                      community.visibility === 'private' ? 'bg-red-400' :
                        'bg-yellow-400'
                  }`} />
                  <span className="text-xs text-stone-400 capitalize">
                    {community.visibility?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="text-xs text-stone-400">
                {community.visibility === 'public' && 'Anyone can discover and join this community'}
                {community.visibility === 'private' && 'Only members can see this community'}
                {community.visibility === 'invite_only' && 'Members must be invited to join'}
                {isPaidCommunity && ' • Payment required for access'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
