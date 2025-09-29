export interface ExtendedSubscription {
  subscriber: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  plan?: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
  community?: {
    name: string;
    slug: string;
    pricingType: string;
  };
  course?: {
    title: string;
    pricingType: string;
  };
}
