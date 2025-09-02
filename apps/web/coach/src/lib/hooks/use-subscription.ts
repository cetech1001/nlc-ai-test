import {useState} from 'react';
import {sdkClient} from '@/lib';
import {UserType} from "@nlc-ai/sdk-users";
import {BillingCycle} from "@nlc-ai/sdk-billing";

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const createSubscription = async (
    coachID: string,
    planID: string,
    billingCycle: BillingCycle = BillingCycle.MONTHLY
  ) => {
    try {
      setIsLoading(true);
      setError('');

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

  return {
    createSubscription,
    isLoading,
    error,
    clearError: () => setError('')
  };
};
