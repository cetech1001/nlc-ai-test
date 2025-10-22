import {Plan, TransformedPlan} from "../types";

export const getPlanColorClass = (color: string) => {
  const colorVal = PLAN_COLORS.filter(({ value }) => value === color);
  if (colorVal.length > 0) {
    return colorVal[0].class;
  }
  return 'bg-[#7B21BA]';
};

export const PLAN_COLORS = [
  { value: '#7B21BA', label: 'Purple', class: 'bg-[#7B21BA]' },
  { value: '#9C55FF', label: 'Light Purple', class: 'bg-[#9C55FF]' },
  { value: '#B347FF', label: 'Violet', class: 'bg-[#B347FF]' },
  { value: '#E879F9', label: 'Fuchsia', class: 'bg-fuchsia-400' },
  { value: '#8B5CF6', label: 'Deep Violet', class: 'bg-violet-500' },
  { value: '#A855F7', label: 'Purple 500', class: 'bg-[#A855F7]' },
  { value: '#C084FC', label: 'Purple 400', class: 'bg-[#C084FC]' },
  { value: '#EC4899', label: 'Pink', class: 'bg-[#EC4899]' },
  { value: 'gradient-violet-fuchsia', label: 'Violet Gradient', class: 'bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200' },
  { value: 'gradient-fuchsia-violet', label: 'Fuchsia Gradient', class: 'bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-violet-600' },
  { value: 'gradient-pink-purple', label: 'Pink Purple Gradient', class: 'bg-gradient-to-bl from-pink-500 via-fuchsia-500 to-purple-600' },
  { value: 'gradient-deep-violet', label: 'Deep Violet Gradient', class: 'bg-gradient-to-tr from-violet-900 via-violet-700 to-violet-500' },
  { value: 'gradient-magenta-purple', label: 'Magenta Purple', class: 'bg-gradient-to-tr from-fuchsia-700 via-purple-600 to-purple-800' },
  { value: 'gradient-berry-purple', label: 'Berry Purple', class: 'bg-gradient-to-bl from-rose-600 via-pink-600 to-purple-700' },
  { value: 'gradient-orchid', label: 'Orchid Gradient', class: 'bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500' },
  { value: 'gradient-lavender-pink', label: 'Lavender Pink', class: 'bg-gradient-to-tr from-violet-300 via-pink-300 to-fuchsia-400' },
  { value: 'gradient-royal-purple', label: 'Royal Purple', class: 'bg-gradient-to-br from-purple-700 via-violet-600 to-fuchsia-500' },
  { value: 'gradient-amethyst', label: 'Amethyst Glow', class: 'bg-gradient-to-bl from-violet-500 via-purple-600 to-fuchsia-700' },
  { value: 'gradient-twilight', label: 'Twilight Glow', class: 'bg-gradient-to-tr from-purple-800 via-fuchsia-600 to-pink-500' },
  { value: 'gradient-cosmic', label: 'Cosmic Purple', class: 'bg-gradient-to-br from-fuchsia-700 via-violet-700 to-purple-900' },
  { value: 'gradient-plum-rose', label: 'Plum Rose', class: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500' },
  { value: 'gradient-electric-violet', label: 'Electric Violet', class: 'bg-gradient-to-tl from-violet-500 via-purple-500 to-fuchsia-600' },
  { value: 'gradient-midnight', label: 'Midnight Violet', class: 'bg-gradient-to-b from-purple-900 via-violet-800 to-purple-700' },
  { value: 'gradient-soft-lilac', label: 'Soft Lilac', class: 'bg-gradient-to-tr from-purple-300 via-violet-400 to-fuchsia-300' },
];

export const transformPlan = (plan: Plan, currentPlan?: Plan): TransformedPlan => ({
  id: plan.id,
  title: plan.name,
  subtitle: plan.description || `Access to ${plan.maxAiAgents || 'unlimited'} agents`,
  price: Math.floor(plan.annualPrice / 100),
  monthlyPrice: Math.floor(plan.monthlyPrice / 100),
  billingCycle: "per user/month billed annually",
  monthlyBilling: `$${Math.floor(plan.monthlyPrice / 100)} billed monthly`,
  features: plan.features || [],
  aiAgents: plan.planAiAgents?.map(paa => paa.aiAgent) || [],
  isCurrentPlan: plan.id === currentPlan?.id,
  colorClass: getPlanColorClass(plan.color || '#7B21BA'),
  colorValue: plan.color || '#7B21BA',
  isDeleted: plan.isDeleted,
});
