export interface CoachPaymentRequest {
  id: string;
  coachID: string;
  planName: string;
  amount: number;
  currency: string;
  description?: string | null;
  paymentLinkUrl: string;
  isActive: boolean;
  paymentsReceived: number;
  totalAmountReceived: number;
  expiresAt?: Date | null;
  createdAt: Date;
  status: 'pending' | 'paid' | 'expired';
}

export interface CoachPaymentRequestStats {
  total: number;
  pending: number;
  paid: number;
  expired: number;
  totalAmountPaid: number;
}

export interface DataTableCoachPaymentRequest {
  id: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
  expiresAt?: string;
  paymentLinkUrl: string;
}
