import React, {useEffect, useState} from 'react';
import {BillingCycle, PaymentMethodType, Plan} from '@nlc-ai/sdk-billing';
import {Button} from '@nlc-ai/web-ui';
import {AlertCircle, Check, CheckCircle2, CreditCard, Loader2, Plus, X} from 'lucide-react';
import {usePaymentMethods, useStripeElements, useSubscription} from '@/lib';
import {UserType} from "@nlc-ai/sdk-users";

interface PlanUpgradeModalProps {
  plan: Plan;
  currentPlan?: Plan;
  coachID: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'plan-details' | 'payment-method' | 'add-payment-method' | 'processing' | 'success' | 'error';

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
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { createSubscription } = useSubscription();
  const {
    paymentMethods,
    fetchPaymentMethods,
    createPaymentMethod
  } = usePaymentMethods();

  const {
    StripeElementsProvider,
    PaymentElementComponent,
    confirmPayment,
    isElementsLoading
  } = useStripeElements();

  // Load payment methods when modal opens
  useEffect(() => {
    if (isOpen && coachID) {
      fetchPaymentMethods(coachID, UserType.coach);
    }
  }, [isOpen, coachID]);

  // Set default payment method
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      setSelectedPaymentMethodID(defaultMethod.id);
    }
  }, [paymentMethods]);

  if (!isOpen) return null;

  const isUpgrade = currentPlan && plan.monthlyPrice > currentPlan.monthlyPrice;
  const isDowngrade = currentPlan && plan.monthlyPrice < currentPlan.monthlyPrice;

  const selectedPrice = billingCycle === BillingCycle.ANNUAL ? plan.annualPrice : plan.monthlyPrice;
  const displayPrice = Math.floor(selectedPrice / 100);
  const savings = billingCycle === BillingCycle.ANNUAL
    ? Math.floor(((plan.monthlyPrice * 12) - plan.annualPrice) / 100)
    : 0;

  const resetModal = () => {
    setCurrentStep('plan-details');
    setErrorMessage('');
    setSelectedPaymentMethodID('');
    setSaveNewCard(true);
  };

  const handleClose = () => {
    if (currentStep !== 'processing') {
      onClose();
      setTimeout(resetModal, 300); // Reset after modal animation
    }
  };

  const handleContinue = () => {
    if (paymentMethods.length === 0) {
      setCurrentStep('add-payment-method');
    } else {
      setCurrentStep('payment-method');
    }
  };

  const handlePaymentMethodSubmit = async () => {
    if (!selectedPaymentMethodID && currentStep === 'payment-method') return;

    try {
      setCurrentStep('processing');
      await createSubscription(coachID, plan.id, billingCycle, selectedPaymentMethodID);
      setCurrentStep('success');

      // Auto close after success
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to process payment');
      setCurrentStep('error');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setCurrentStep('processing');

      const result = await confirmPayment();
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Save the payment method
      if (saveNewCard && result.paymentMethod) {
        await createPaymentMethod(coachID, {
          coachID,
          type: PaymentMethodType.STRIPE,
          stripePaymentMethodID: result.paymentMethod.id,
          cardLast4: result.paymentMethod.card?.last4,
          cardBrand: result.paymentMethod.card?.brand,
          cardExpMonth: result.paymentMethod.card?.exp_month,
          cardExpYear: result.paymentMethod.card?.exp_year,
          isDefault: paymentMethods.length === 0
        });
      }

      // Create subscription
      await createSubscription(coachID, plan.id, billingCycle, result.paymentMethod?.id);
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

      {/* Billing Cycle Selection */}
      <div className="space-y-3">
        <label className="text-white font-medium">Billing Cycle</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-neutral-800/30 border-neutral-600 hover:border-purple-500/50">
            <input
              type="radio"
              name="billing"
              value="annual"
              checked={billingCycle === BillingCycle.ANNUAL}
              onChange={() => setBillingCycle(BillingCycle.ANNUAL)}
              className="w-4 h-4 text-purple-600 border-neutral-500 focus:ring-purple-500 focus:ring-2"
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
              <div className="text-neutral-400 text-sm mt-1">
                Best value - 2 months free
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-neutral-800/30 border-neutral-600 hover:border-purple-500/50">
            <input
              type="radio"
              name="billing"
              value="monthly"
              checked={billingCycle === BillingCycle.MONTHLY}
              onChange={() => setBillingCycle(BillingCycle.MONTHLY)}
              className="w-4 h-4 text-purple-600 border-neutral-500 focus:ring-purple-500 focus:ring-2"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Monthly</span>
                <div className="text-white font-bold text-lg">
                  ${Math.floor(plan.monthlyPrice / 100)}/month
                </div>
              </div>
              <div className="text-neutral-400 text-sm mt-1">
                Pay as you go
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Price Summary */}
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

      {/* Action Buttons */}
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
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white"
        >
          Continue
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
              className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-neutral-800/30 border-neutral-600 hover:border-purple-500/50"
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

          {/* Add New Payment Method Option */}
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('plan-details')}
          className="flex-1 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
        >
          Back
        </Button>
        <Button
          onClick={handlePaymentMethodSubmit}
          disabled={!selectedPaymentMethodID}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Confirm {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscription'}
          </div>
        </Button>
      </div>
    </div>
  );

  const renderAddPaymentMethod = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-4">Add Payment Method</h4>

        <StripeElementsProvider
          coachID={coachID}
          amount={selectedPrice}
          currency="usd"
        >
          <div className="bg-neutral-800/50 border border-neutral-600 rounded-xl p-4">
            <PaymentElementComponent />
          </div>
        </StripeElementsProvider>

        {/* Save Card Option */}
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={saveNewCard}
            onChange={(e) => setSaveNewCard(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-neutral-500 rounded focus:ring-purple-500 focus:ring-2"
          />
          <span className="text-neutral-300 text-sm">
            Save this payment method for future purchases
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => paymentMethods.length > 0 ? setCurrentStep('payment-method') : setCurrentStep('plan-details')}
          disabled={isElementsLoading}
          className="flex-1 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
        >
          Back
        </Button>
        <Button
          onClick={handleAddPaymentMethod}
          disabled={isElementsLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Complete {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscription'}
          </div>
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
          Please wait while we process your payment. This may take a few seconds...
        </p>
      </div>
      <div className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-300">Plan</span>
          <span className="text-white font-medium">{plan.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-neutral-300">Amount</span>
          <span className="text-white font-medium">
            ${displayPrice}/{billingCycle === BillingCycle.ANNUAL ? 'year' : 'month'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscription'} Successful!
        </h3>
        <p className="text-neutral-400">
          Your plan has been updated successfully. You now have access to all {plan.name} features.
        </p>
      </div>
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-300">New Plan</span>
          <span className="text-white font-medium">{plan.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-neutral-300">Billing</span>
          <span className="text-white font-medium">
            ${displayPrice}/{billingCycle === BillingCycle.ANNUAL ? 'year' : 'month'}
          </span>
        </div>
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
          We couldn't process your payment. Please check your payment details and try again.
        </p>
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex-1 border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-500"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setErrorMessage('');
            setCurrentStep(paymentMethods.length > 0 ? 'payment-method' : 'add-payment-method');
          }}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'plan-details':
        return isUpgrade ? 'Upgrade Plan' : isDowngrade ? 'Downgrade Plan' : 'Subscribe to Plan';
      case 'payment-method':
        return 'Payment Method';
      case 'add-payment-method':
        return 'Add Payment Method';
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Success';
      case 'error':
        return 'Payment Failed';
      default:
        return 'Upgrade Plan';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Glow Orbs */}
        {renderGlowOrbs()}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-xl font-semibold text-white">
            {getStepTitle()}
          </h2>
          {(currentStep !== 'processing') && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
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
  );
};
