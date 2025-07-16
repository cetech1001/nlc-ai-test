import {Plan, TransformedPlan} from "@nlc-ai/types";

const getColorClass = (color: string) => {
  const colorVal = PLAN_COLORS.filter(({ value }) => value === color);
  if (colorVal.length > 0) {
    return colorVal[0].class;
  }
  return 'bg-[#7B21BA]';
};

export const PLAN_COLORS = [
  // Solid Colors
  { value: '#7B21BA', label: 'Purple', class: 'bg-[#7B21BA]' },
  { value: '#9C55FF', label: 'Light Purple', class: 'bg-[#9C55FF]' },
  { value: '#B347FF', label: 'Violet', class: 'bg-[#B347FF]' },
  { value: '#E879F9', label: 'Fuchsia', class: 'bg-fuchsia-400' },
  { value: '#8B5CF6', label: 'Deep Violet', class: 'bg-violet-500' },
  { value: '#A855F7', label: 'Purple 500', class: 'bg-[#A855F7]' },
  { value: '#C084FC', label: 'Purple 400', class: 'bg-[#C084FC]' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },

  // Original Gradients (Fixed)
  { value: 'gradient-violet-fuchsia', label: 'Violet Gradient', class: 'bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200' },
  // { value: 'gradient-purple-pink', label: 'Purple Pink Gradient', class: 'bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400' },
  { value: 'gradient-fuchsia-violet', label: 'Fuchsia Gradient', class: 'bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-violet-600' },
  { value: 'gradient-pink-purple', label: 'Pink Purple Gradient', class: 'bg-gradient-to-bl from-pink-500 via-fuchsia-500 to-purple-600' },

  // New Dark Purple Gradients (Compatible)
  // { value: 'gradient-dark-purple', label: 'Dark Purple Gradient', class: 'bg-gradient-to-b from-purple-900 via-purple-700 to-purple-500' },
  // { value: 'gradient-midnight-purple', label: 'Midnight Purple', class: 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600' },
  { value: 'gradient-deep-violet', label: 'Deep Violet Gradient', class: 'bg-gradient-to-tr from-violet-900 via-violet-700 to-violet-500' },
  // { value: 'gradient-royal-purple', label: 'Royal Purple', class: 'bg-gradient-to-bl from-purple-800 via-purple-600 to-purple-500' },

  // New Purple/Pink Variations (Compatible)
  // { value: 'gradient-plum-rose', label: 'Plum Rose Gradient', class: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500' },
  // { value: 'gradient-lavender-pink', label: 'Lavender Pink', class: 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-300' },
  { value: 'gradient-magenta-purple', label: 'Magenta Purple', class: 'bg-gradient-to-tr from-fuchsia-700 via-purple-600 to-purple-800' },
  { value: 'gradient-berry-purple', label: 'Berry Purple', class: 'bg-gradient-to-bl from-rose-600 via-pink-600 to-purple-700' },/*

  // New Sophisticated Gradients (Compatible)
  { value: 'gradient-amethyst', label: 'Amethyst Gradient', class: 'bg-gradient-to-r from-purple-700 via-violet-600 to-purple-500' },
  { value: 'gradient-cosmic-purple', label: 'Cosmic Purple', class: 'bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600' },
  { value: 'gradient-twilight', label: 'Twilight Gradient', class: 'bg-gradient-to-tr from-purple-900 via-fuchsia-700 to-pink-500' },
  { value: 'gradient-orchid', label: 'Orchid Gradient', class: 'bg-gradient-to-bl from-purple-500 via-pink-500 to-fuchsia-400' },

  // New Diagonal & Reverse Gradients (Compatible)
  { value: 'gradient-diagonal-purple', label: 'Diagonal Purple', class: 'bg-gradient-to-br from-purple-800 via-fuchsia-600 to-purple-400' },
  { value: 'gradient-reverse-purple', label: 'Reverse Purple', class: 'bg-gradient-to-tl from-purple-400 via-pink-500 to-purple-800' },
  { value: 'gradient-intense-purple', label: 'Intense Purple', class: 'bg-gradient-to-b from-purple-800 via-violet-700 to-purple-900' },
  { value: 'gradient-soft-purple', label: 'Soft Purple', class: 'bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400' },*/
];

export const transformPlan = (plan: Plan, currentPlanName?: string): TransformedPlan => ({
  id: plan.id,
  title: plan.name,
  subtitle: plan.description || `Access to ${plan.maxAiAgents || 'unlimited'} agents`,
  price: Math.floor(plan.annualPrice / 100),
  monthlyPrice: Math.floor(plan.monthlyPrice / 100),
  billingCycle: "per user/month billed annually",
  monthlyBilling: `$${Math.floor(plan.monthlyPrice / 100)} billed monthly`,
  features: plan.features || [],
  isCurrentPlan: plan.name === currentPlanName,
  colorClass: getColorClass(plan.color || '#7B21BA'),
});
