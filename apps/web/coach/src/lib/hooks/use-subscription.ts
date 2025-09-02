import { useState } from 'react';
import { sdkClient } from '@/lib';
import { BillingCycle } from '@nlc-ai/sdk-billing';
import { UserType } from '@nlc-ai/sdk-users';

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const createSubscription = async (
    coachID: string,
    planID: string,
    billingCycle: BillingCycle = BillingCycle.MONTHLY,
    paymentMethodID?: string
  ) => {
    try {
      setIsLoading(true);
      setError('');

      // Process payment first if payment method provided
      if (paymentMethodID) {
        const plan = await sdkClient.billing.plans.getPlan(planID);
        const amount = billingCycle === BillingCycle.ANNUAL ? plan.annualPrice : plan.monthlyPrice;

        const paymentResult = await sdkClient.billing.payments.processPayment({
          payerID: coachID,
          payerType: UserType.coach,
          planID,
          amount,
          paymentMethodID,
          description: `Subscription to ${plan.name} plan`
        });

        if (!paymentResult.success) {
          throw new Error('Payment failed');
        }
      }

      // Create subscription after successful payment
      const subscription = await sdkClient.billing.subscriptions.createSubscription(
        coachID,
        UserType.coach,
        planID,
        billingCycle
      );

      return subscription;
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (
    subscriptionID: string,
    reason: string,
    feedback?: string
  ) => {
    try {
      setIsLoading(true);
      setError('');

      return await sdkClient.billing.subscriptions.cancelSubscription(
        subscriptionID,
        reason,
        feedback
      );
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBillingCycle = async (
    subscriptionID: string,
    billingCycle: BillingCycle
  ) => {
    try {
      setIsLoading(true);
      setError('');

      return await sdkClient.billing.subscriptions.updateBillingCycle(
        subscriptionID,
        billingCycle
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update billing cycle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSubscription,
    cancelSubscription,
    updateBillingCycle,
    isLoading,
    error,
    clearError: () => setError('')
  };
};
