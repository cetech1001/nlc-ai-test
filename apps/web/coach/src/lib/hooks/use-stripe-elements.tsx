import React, {ReactNode, useEffect, useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {sdkClient} from "@/lib";
import {UserType} from "@nlc-ai/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Create a separate component to handle Stripe operations
const StripeConfirmationHandler = ({ onConfirm }: { onConfirm: (result: any) => void }) => {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Expose the confirmation function to the parent component
    if (stripe && elements) {
      (window as any).stripeConfirmSetup = async () => {
        if (!stripe || !elements) {
          throw new Error('Stripe has not loaded yet');
        }

        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/settings/billing`,
          },
          redirect: 'if_required',
        });

        if (error) {
          return { error, setupIntent: null, paymentMethod: null };
        }

        return {
          error: null,
          setupIntent,
          paymentMethod: setupIntent?.payment_method
        };
      };
    }

    return () => {
      // Clean up the function when component unmounts
      delete (window as any).stripeConfirmSetup;
    };
  }, [stripe, elements]);

  return null; // This component doesn't render anything
};

interface StripeElementsProviderProps {
  children: ReactNode;
  coachID: string;
  amount: number;
  currency: string;
}

export const useStripeElements = () => {
  const [isElementsLoading, setIsElementsLoading] = useState(false);

  const StripeElementsProvider = ({
                                    children,
                                    coachID,
                                    amount,
                                    currency
                                  }: StripeElementsProviderProps) => {
    const [clientSecret, setClientSecret] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const createSetupIntent = async () => {
        try {
          setIsLoading(true);

          const response = await sdkClient.billing.payments.createSetupIntent({
            payerID: coachID,
            payerType: UserType.coach,
          });

          if (!response.success) {
            throw new Error('Failed to create setup intent');
          }

          const { client_secret } = response.data!;
          setClientSecret(client_secret);
        } catch (error) {
          console.error('Error creating setup intent:', error);
        } finally {
          setIsLoading(false);
        }
      };

      createSetupIntent();
    }, [coachID]);

    const options = {
      clientSecret,
      appearance: {
        theme: 'night' as const,
        variables: {
          colorPrimary: '#8B5CF6',
          colorBackground: '#1F1F23',
          colorText: '#FFFFFF',
          colorDanger: '#EF4444',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
        rules: {
          '.Input': {
            backgroundColor: '#374151',
            border: '1px solid #4B5563',
            color: '#FFFFFF',
          },
          '.Input:focus': {
            border: '1px solid #8B5CF6',
            boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
          },
          '.Label': {
            color: '#D1D5DB',
            fontWeight: '500',
          }
        }
      }
    };

    if (isLoading || !clientSecret) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise} options={options}>
        <StripeConfirmationHandler onConfirm={() => {}} />
        {children}
      </Elements>
    );
  };

  const PaymentElementComponent = () => {
    return (
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'never',
                address: {
                  country: 'never',
                  line1: 'never',
                  line2: 'never',
                  city: 'never',
                  state: 'never',
                  postalCode: 'never',
                }
              }
            }
          }}
        />
      </div>
    );
  };

  const confirmPayment = async () => {
    setIsElementsLoading(true);
    console.log("Came in here");

    try {
      const confirmSetup = (window as any).stripeConfirmSetup;

      if (!confirmSetup) {
        throw new Error('Payment form not ready. Please wait and try again.');
      }

      console.log("Confirm setup ran");

      const result = await confirmSetup();

      console.log("Result: ", result);

      if (result.error) {
        return {
          error: result.error,
          paymentMethod: null
        };
      }

      const paymentMethod = result.paymentMethod || result.setupIntent?.payment_method;

      if (!paymentMethod) {
        throw new Error('No payment method was created');
      }

      return {
        error: null,
        paymentMethod: {
          id: paymentMethod.id,
          card: paymentMethod.card ? {
            last4: paymentMethod.card.last4,
            brand: paymentMethod.card.brand,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
          } : null,
          type: paymentMethod.type,
        }
      };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Payment failed'
        },
        paymentMethod: null
      };
    } finally {
      setIsElementsLoading(false);
    }
  };

  return {
    StripeElementsProvider,
    PaymentElementComponent,
    confirmPayment,
    isElementsLoading
  };
};
