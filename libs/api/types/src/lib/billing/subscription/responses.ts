import {Subscription} from "@prisma/client";

export interface ExtendedSubscription extends Subscription {
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
