import {Plan, TransformedPlan} from "@nlc-ai/types";

const getColorClass = (color: string) => {
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
  { value: '#A855F7', label: 'Purple 500', class: 'bg-purple-500' },
  { value: '#C084FC', label: 'Purple 400', class: 'bg-purple-400' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gradient-violet-fuchsia', label: 'Violet Gradient', class: 'bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200' },
  { value: 'gradient-purple-pink', label: 'Purple Gradient', class: 'bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 rotate-45' },
  { value: 'gradient-fuchsia-violet', label: 'Fuchsia Gradient', class: 'bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-violet-600' },
  { value: 'gradient-pink-purple', label: 'Pink Gradient', class: 'bg-gradient-to-bl from-pink-500 via-fuchsia-500 to-purple-600' },
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
