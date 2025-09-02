import { useState, useCallback } from 'react';
import { PaymentMethod, PaymentMethodType } from '@nlc-ai/sdk-billing';
import { sdkClient } from '@/lib';

interface CreatePaymentMethodData {
  coachID: string;
  type: PaymentMethodType;
  isDefault?: boolean;
  cardLast4: string;
  cardBrand: string;
  cardExpMonth: number;
  cardExpYear: number;
  stripePaymentMethodID: string;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchPaymentMethods = useCallback(async (userID: string, userType: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await sdkClient.billing.paymentMethods.getPaymentMethods(userID, userType);
      const methods = response.data || [];
      setPaymentMethods(methods);
      return methods;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch payment methods';
      setError(errorMessage);
      console.error('Error fetching payment methods:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const savePaymentMethod = useCallback(async (data: CreatePaymentMethodData) => {
    try {
      setError('');

      const savedMethod = await sdkClient.billing.paymentMethods.savePaymentMethod({
        coachID: data.coachID,
        type: data.type,
        isDefault: data.isDefault ?? paymentMethods.length === 0,
        cardLast4: data.cardLast4,
        cardBrand: data.cardBrand,
        cardExpMonth: data.cardExpMonth,
        cardExpYear: data.cardExpYear,
        stripePaymentMethodID: data.stripePaymentMethodID,
      });

      // Update local state
      setPaymentMethods(prev => {
        const updated = [...prev, savedMethod];
        // If this is the default, update other methods
        if (savedMethod.isDefault) {
          return updated.map(pm => ({
            ...pm,
            isDefault: pm.id === savedMethod.id
          }));
        }
        return updated;
      });

      return savedMethod;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [paymentMethods.length]);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodID: string) => {
    try {
      setError('');

      await sdkClient.billing.paymentMethods.setDefaultPaymentMethod(paymentMethodID);

      // Update local state
      setPaymentMethods(prev =>
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodID
        }))
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set default payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deletePaymentMethod = useCallback(async (paymentMethodID: string) => {
    try {
      setError('');

      await sdkClient.billing.paymentMethods.deletePaymentMethod(paymentMethodID);

      // Update local state
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodID));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getDefaultPaymentMethod = useCallback(() => {
    return paymentMethods.find(pm => pm.isDefault) || paymentMethods[0] || null;
  }, [paymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    hasPaymentMethods: paymentMethods.length > 0,
    fetchPaymentMethods,
    savePaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    getDefaultPaymentMethod,
    clearError: () => setError('')
  };
};
