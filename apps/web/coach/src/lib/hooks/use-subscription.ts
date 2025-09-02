import {useState} from 'react';
import {sdkClient} from '@/lib';
import {BillingCycle} from "@nlc-ai/sdk-billing";
import {UserType} from "@nlc-ai/types";

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

      if (paymentMethodID) {
        const paymentResult = await sdkClient.billing.payments.processPayment({
          payerID: coachID,
          payerType: UserType.coach,
          planID,
          amount: billingCycle === BillingCycle.ANNUAL ?
            (await sdkClient.billing.plans.getPlan(planID)).annualPrice :
            (await sdkClient.billing.plans.getPlan(planID)).monthlyPrice,
          paymentMethodID,
          description: `Subscription to plan ${planID}`
        });

        if (!paymentResult.success) {
          throw new Error('Payment failed');
        }
      }

      return await sdkClient.billing.subscriptions.createSubscription(
        coachID,
        UserType.coach,
        planID,
        billingCycle
      );
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

  const reactivateSubscription = async (subscriptionID: string) => {
    try {
      setIsLoading(true);
      setError('');

      return await sdkClient.billing.subscriptions.reactivateSubscription(subscriptionID);
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate subscription');
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
    reactivateSubscription,
    updateBillingCycle,
    isLoading,
    error,
    clearError: () => setError('')
  };
};
