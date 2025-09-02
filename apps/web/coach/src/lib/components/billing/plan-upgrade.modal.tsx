import React, { useEffect, useState } from 'react';
import {BillingCycle, Plan, PaymentMethodType, PaymentMethod} from '@nlc-ai/sdk-billing';
import { Button } from '@nlc-ai/web-ui';
import { AlertCircle, Check, CheckCircle2, CreditCard, Loader2, Plus, X } from 'lucide-react';
import { sdkClient } from '@/lib';
import { UserType } from '@nlc-ai/sdk-users';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from "@nlc-ai/web-auth";
import { appConfig } from "@nlc-ai/web-shared";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PlanUpgradeModalProps {
  plan: Plan;
  currentPlan?: Plan;
  coachID: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'plan-details' | 'payment-method' | 'add-payment-method' | 'processing' | 'success' | 'error';

const AddPaymentMethodForm = ({
                                coachID,
                                planID,
                                billingCycle,
                                onSuccess,
                                onError,
                                displayPrice
                              }: {
  coachID: string;
  planID: string;
  billingCycle: BillingCycle;
  onSuccess: () => void;
  onError: (error: string) => void;
  displayPrice: number;
}) => {
  const { user } = useAuth();

  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(true);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      onError('Stripe not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      return;
    }

    setIsProcessing(true);

    try {
      const setupResponse = await sdkClient.billing.payments.createSetupIntent({
        payerID: coachID,
        payerType: UserType.coach,
      });

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: user?.firstName + ' ' + user?.lastName,
          email: user?.email,
        },
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || 'Failed to create payment method');
      }

      if (!setupResponse.success || !setupResponse.data?.client_secret) {
        throw new Error('Failed to create setup intent');
      }

      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupResponse.data.client_secret,
        {
          payment_method: paymentMethod.id
        }
      );

      // Confirm the setup intent
      /*const { error, setupIntent } = await stripe.confirmCardSetup(
        setupResponse.data.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.firstName + ' ' + user?.lastName,
              email: user?.email,
            },
          }
        }
      );*/

      if (error) {
        throw new Error(error.message);
      }

      if (!setupIntent?.payment_method) {
        throw new Error('No payment method created');
      }

      let paymentMethodID = typeof setupIntent.payment_method === 'string' ? setupIntent.payment_method : setupIntent.payment_method.id;

      if (saveCard) {
        await sdkClient.billing.paymentMethods.savePaymentMethod({
          coachID,
          type: PaymentMethodType.STRIPE,
          stripePaymentMethodID: paymentMethod.id,
          cardLast4: paymentMethod.card?.last4,
          cardBrand: paymentMethod.card?.brand,
          cardExpMonth: paymentMethod.card?.exp_month,
          cardExpYear: paymentMethod.card?.exp_year,
          isDefault: false
        });
      }

      const selectedPrice = billingCycle === BillingCycle.ANNUAL ?
          (await sdkClient.billing.plans.getPlan(planID)).annualPrice :
          (await sdkClient.billing.plans.getPlan(planID)).monthlyPrice;

      const paymentResult = await sdkClient.billing.payments.processPayment({
        payerID: coachID,
        payerType: UserType.coach,
        planID,
        amount: selectedPrice,
        paymentMethodID,
        description: `Subscription payment`,
        returnUrl: appConfig.platforms.coach,
      });

      if (!paymentResult.paymentSuccessful) {
        throw new Error('Payment failed');
      }

      await sdkClient.billing.subscriptions.createSubscription({
        subscriberID: coachID,
        subscriberType: UserType.coach,
        planID: planID,
        billingCycle,
        amount: selectedPrice,
      });

      onSuccess();
    } catch (error: any) {
      onError(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-4">Add Payment Method</h4>

        <div className="bg-neutral-800/50 border border-neutral-600 rounded-xl p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                  iconColor: '#ffffff',
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
                complete: {
                  color: '#10b981',
                  iconColor: '#10b981',
                }
              },
              hidePostalCode: true,
            }}
          />
        </div>

        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-neutral-500 rounded focus:ring-purple-500 focus:ring-2"
          />
          <span className="text-neutral-300 text-sm">
            Save this payment method for future purchases
          </span>
        </label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pay ${displayPrice}
          </div>
        )}
      </Button>
    </div>
  );
};

export const PlanUpgradeModal = ({
                                   plan,
                                   currentPlan,
                                   coachID,
                                   isOpen,
                                   onClose,
                                   onSuccess
                                 }: PlanUpgradeModalProps) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.ANNUAL);
  const [currentStep, setCurrentStep] = useState<ModalStep>('plan-details');
  const [selectedPaymentMethodID, setSelectedPaymentMethodID] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && coachID) {
      fetchPaymentMethods();
    }
  }, [isOpen, coachID]);

  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      setSelectedPaymentMethodID(defaultMethod.id);
    }
  }, [paymentMethods]);

  if (!isOpen) return null;

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await sdkClient.billing.paymentMethods.getPaymentMethods(coachID, UserType.coach);
      setPaymentMethods(response.data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPrice = billingCycle === BillingCycle.ANNUAL ? plan.annualPrice : plan.monthlyPrice;
  const displayPrice = Math.floor(selectedPrice / 100);
  const savings = billingCycle === BillingCycle.ANNUAL
    ? Math.floor(((plan.monthlyPrice * 12) - plan.annualPrice) / 100)
    : 0;

  const resetModal = () => {
    setCurrentStep('plan-details');
    setErrorMessage('');
    setSelectedPaymentMethodID('');
  };

  const handleClose = () => {
    if (currentStep !== 'processing') {
      onClose();
      setTimeout(resetModal, 300);
    }
  };

  const handleContinue = () => {
    if (paymentMethods.length === 0) {
      setCurrentStep('add-payment-method');
    } else {
      setCurrentStep('payment-method');
    }
  };

  const processPaymentWithExistingMethod = async () => {
    try {
      setCurrentStep('processing');
      setErrorMessage('');

      const paymentMethod = paymentMethods.find(({ id }) => id === selectedPaymentMethodID)!;

      // Process payment first
      const paymentResult = await sdkClient.billing.payments.processPayment({
        payerID: coachID,
        payerType: UserType.coach,
        planID: plan.id,
        amount: selectedPrice,
        paymentMethodID: paymentMethod.stripePaymentMethodID!,
        description: `Subscription to ${plan.name} plan`,
        returnUrl: appConfig.platforms.coach,
      });

      if (!paymentResult.paymentSuccessful) {
        throw new Error('Payment failed');
      }

      // Create subscription after successful payment
      await sdkClient.billing.subscriptions.createSubscription({
        subscriberID: coachID,
        subscriberType: UserType.coach,
        planID: plan.id,
        billingCycle,
        amount: selectedPrice,
      });

      setCurrentStep('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to process payment');
      setCurrentStep('error');
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setErrorMessage(error);
    setCurrentStep('error');
  };

  const renderGlowOrbs = () => (
    <>
      <div className="absolute w-64 h-64 -left-12 -top-12 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
      <div className="absolute w-48 h-48 -right-8 top-1/2 opacity-20 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-600 rounded-full blur-[100px]" />
      <div className="absolute w-32 h-32 left-1/2 -bottom-8 opacity-25 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-[80px]" />
    </>
  );

  const renderPlanDetails = () => (
    <div className="space-y-6">
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
        <h4 className="font-semibold text-white mb-2">{plan.name}</h4>
        <p className="text-neutral-300 text-sm mb-4">{plan.description}</p>

        {plan.features && (
          <div className="space-y-2">
            {plan.features.slice(0, 4).map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-neutral-300">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-white font-medium">Billing Cycle</label>
        <div className="space-y-3">
          <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-neutral-800/30 ${
            billingCycle === BillingCycle.ANNUAL
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-neutral-600 hover:border-purple-500/50'
          }`}>
            <input
              type="radio"
              name="billing"
              value="annual"
              checked={billingCycle === BillingCycle.ANNUAL}
              onChange={() => setBillingCycle(BillingCycle.ANNUAL)}
              className="w-4 h-4 text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Annual</span>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    ${Math.floor(plan.annualPrice / 100)}/year
                  </div>
                  {savings > 0 && (
                    <div className="text-green-400 text-sm font-medium">
                      Save ${savings}/year
                    </div>
                  )}
                </div>
              </div>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-neutral-800/30 ${
            billingCycle === BillingCycle.MONTHLY
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-neutral-600 hover:border-purple-500/50'
          }`}>
            <input
              type="radio"
              name="billing"
              value="monthly"
              checked={billingCycle === BillingCycle.MONTHLY}
              onChange={() => setBillingCycle(BillingCycle.MONTHLY)}
              className="w-4 h-4 text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Monthly</span>
                <div className="text-white font-bold text-lg">
                  ${Math.floor(plan.monthlyPrice / 100)}/month
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-neutral-300">Total</span>
          <span className="text-white text-2xl font-bold">
            ${displayPrice}
            <span className="text-lg font-normal text-neutral-400">
              /{billingCycle === BillingCycle.ANNUAL ? 'year' : 'month'}
            </span>
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex-1 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
        >
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white"
        >
          {isLoading ? 'Loading...' : 'Continue'}
        </Button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-4">Select Payment Method</h4>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-neutral-800/30 ${
                selectedPaymentMethodID === method.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-neutral-600 hover:border-purple-500/50'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedPaymentMethodID === method.id}
                onChange={() => setSelectedPaymentMethodID(method.id)}
                className="w-4 h-4 text-purple-600"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-8 bg-neutral-700 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">
                    •••• •••• •••• {method.cardLast4}
                  </div>
                  <div className="text-neutral-400 text-sm">
                    {method.cardBrand?.toUpperCase()} • Expires {method.cardExpMonth}/{method.cardExpYear}
                  </div>
                </div>
                {method.isDefault && (
                  <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    Default
                  </div>
                )}
              </div>
            </label>
          ))}

          <button
            onClick={() => setCurrentStep('add-payment-method')}
            className="w-full flex items-center gap-3 p-4 border border-dashed border-neutral-600 rounded-xl hover:border-purple-500/50 hover:bg-neutral-800/30 transition-all"
          >
            <div className="w-10 h-8 bg-neutral-700 rounded flex items-center justify-center">
              <Plus className="w-4 h-4 text-neutral-400" />
            </div>
            <span className="text-neutral-300">Add New Payment Method</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('plan-details')}
          className="flex-1 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
        >
          Back
        </Button>
        <Button
          onClick={processPaymentWithExistingMethod}
          disabled={!selectedPaymentMethodID}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pay ${displayPrice}
          </div>
        </Button>
      </div>
    </div>
  );

  const renderAddPaymentMethod = () => (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <AddPaymentMethodForm
        coachID={coachID}
        planID={plan.id}
        billingCycle={billingCycle}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        displayPrice={displayPrice}
      />

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => paymentMethods.length > 0 ? setCurrentStep('payment-method') : setCurrentStep('plan-details')}
          className="flex-1 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
        >
          Back
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
        <p className="text-neutral-400">
          Please wait while we process your payment...
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
        <p className="text-neutral-400">
          Your plan has been updated successfully.
        </p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Payment Failed</h3>
        <p className="text-neutral-400 mb-4">
          {errorMessage || 'Please try again.'}
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex-1 border-neutral-600 text-neutral-300"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setErrorMessage('');
            setCurrentStep(paymentMethods.length > 0 ? 'payment-method' : 'add-payment-method');
          }}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'plan-details': return 'Plan Details';
      case 'payment-method': return 'Payment Method';
      case 'add-payment-method': return 'Add Payment Method';
      case 'processing': return 'Processing';
      case 'success': return 'Success';
      case 'error': return 'Error';
      default: return 'Plan Upgrade';
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {renderGlowOrbs()}

          <div className="relative z-10 flex items-center justify-between p-6 border-b border-neutral-700">
            <h2 className="text-xl font-semibold text-white">{getStepTitle()}</h2>
            {currentStep !== 'processing' && (
              <button onClick={handleClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="relative z-10 p-6">
            {currentStep === 'plan-details' && renderPlanDetails()}
            {currentStep === 'payment-method' && renderPaymentMethods()}
            {currentStep === 'add-payment-method' && renderAddPaymentMethod()}
            {currentStep === 'processing' && renderProcessing()}
            {currentStep === 'success' && renderSuccess()}
            {currentStep === 'error' && renderError()}
          </div>
        </div>
      </div>
    </Elements>
  );
};
