import { useState, useCallback } from 'react';
import {CreatePaymentMethodRequest, PaymentMethod, PaymentMethodType} from '@nlc-ai/sdk-billing';
import { sdkClient } from '@/lib';

interface CreatePaymentMethodData {
  coachID?: string;
  clientID?: string;
  type: PaymentMethodType;
  isDefault?: boolean;
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  stripePaymentMethodID?: string;
  paypalEmail?: string;
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
      setPaymentMethods(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment methods');
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentMethod = useCallback(async (userID: string, data: CreatePaymentMethodData) => {
    try {
      setError('');

      const newMethod: CreatePaymentMethodRequest = {
        coachID: userID,
        type: data.type,
        isDefault: data.isDefault || false,
        cardLast4: data.cardLast4,
        cardBrand: data.cardBrand,
        cardExpMonth: data.cardExpMonth,
        cardExpYear: data.cardExpYear,
        stripePaymentMethodID: data.stripePaymentMethodID,
        paypalEmail: data.paypalEmail,
      };

      const method = await sdkClient.billing.paymentMethods.savePaymentMethod(newMethod);

      setPaymentMethods(prev => [...prev, method]);
      return newMethod;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment method');
      throw err;
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodID: string) => {
    try {
      setError('');

      await sdkClient.billing.paymentMethods.setDefaultPaymentMethod(paymentMethodID);

      setPaymentMethods(prev =>
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodID
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to set default payment method');
      throw err;
    }
  }, []);

  const deletePaymentMethod = useCallback(async (paymentMethodID: string) => {
    try {
      setError('');

      await sdkClient.billing.paymentMethods.deletePaymentMethod(paymentMethodID);

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodID));
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment method');
      throw err;
    }
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    createPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    clearError: () => setError('')
  };
};
