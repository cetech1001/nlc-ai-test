import {UserType} from "../auth";

export interface UserReference {
  id: string;
  type: UserType;
}

export interface AmountDetails {
  amount: number;
  currency: string;
  platformFeeAmount?: number;
  platformFeeRate?: number;
}

export interface PaymentContext {
  planID?: string;
  courseID?: string;
  communityID?: string;
  subscriptionID?: string;
  paymentRequestID?: string;
}
