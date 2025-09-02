import React, { useState } from 'react';
import { AlertTriangle, X, XCircle, Calendar } from 'lucide-react';
import { Button } from '@nlc-ai/web-ui';
import { Subscription, BillingCycle } from '@nlc-ai/sdk-billing';
import { formatCurrency } from '@nlc-ai/web-utils';

interface CancelSubscriptionFlowProps {
  subscription?: Subscription;
  onCancelSubscription: (reason: string, feedback?: string) => Promise<void>;
}

export const CancelSubscriptionFlow: React.FC<CancelSubscriptionFlowProps> = ({
  subscription,
  onCancelSubscription,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const reasons = [
    'Too expensive',
    'Not using it enough',
    'Found a better alternative',
    'Missing features I need',
    'Technical issues',
    'Changing business needs',
    'Temporary break',
    'Other'
  ];

  const handleStartCancel = () => {
    setShowModal(true);
    setStep(1);
    setCancelReason('');
    setFeedback('');
  };

  const handleClose = () => {
    if (!isCancelling) {
      setShowModal(false);
      setStep(1);
      setCancelReason('');
      setFeedback('');
    }
  };

  const handleNextStep = () => {
    if (step === 1 && cancelReason) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalCancel = async () => {
    try {
      setIsCancelling(true);
      await onCancelSubscription(cancelReason, feedback);
      // Parent component should handle success state and UI updates
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      // Error handling should be done by parent component
    } finally {
      setIsCancelling(false);
    }
  };

  if (!subscription) {
    return null;
  }

  const nextBillingDate = new Date(subscription.currentPeriodEnd || '');
  const monthlyPrice = subscription.plan?.monthlyPrice || 0;
  const annualPrice = subscription.plan?.annualPrice || 0;
  const currentPrice = subscription.billingCycle === BillingCycle.MONTHLY ? monthlyPrice : annualPrice;

  return (
    <>
      {/* Cancel Subscription Button */}
      <div className="mt-6 pt-6 border-t border-neutral-700">
        <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-orange-400 text-lg font-semibold mb-2">Cancel Subscription</h3>
              <p className="text-stone-400 text-sm mb-4">
                Cancel your current {subscription.plan?.name} plan. You'll continue to have access until your next billing date.
              </p>
              <Button
                onClick={handleStartCancel}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-300"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-xl font-semibold text-white">
                {step === 1 && 'Why are you cancelling?'}
                {step === 2 && 'Help us improve'}
                {step === 3 && 'Confirm cancellation'}
              </h2>
              {!isCancelling && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-6">
              {/* Step 1: Reason for cancellation */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-stone-400 text-sm mb-4">
                    We're sorry to see you go. Please let us know why you're cancelling your subscription:
                  </p>

                  <div className="space-y-2">
                    {reasons.map((reason) => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-4 h-4 text-violet-500 border-neutral-600 focus:ring-violet-500 focus:ring-2"
                        />
                        <span className="text-white text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="flex-1 border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500"
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!cancelReason}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Optional feedback */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-stone-400 text-sm mb-4">
                    Your feedback helps us improve our service. What could we have done better?
                  </p>

                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what we could improve (optional)..."
                    className="w-full h-32 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handlePrevStep}
                      variant="outline"
                      className="flex-1 border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Final confirmation */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-orange-400 font-medium mb-2">Subscription Cancellation</h4>
                        <div className="text-stone-400 text-sm space-y-1">
                          <div>• Your {subscription.plan?.name} subscription will be cancelled</div>
                          <div>• You'll continue to have access until {nextBillingDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}</div>
                          <div>• No further charges of {formatCurrency(currentPrice)} will occur</div>
                          <div>• You can reactivate anytime before your access expires</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-medium">What happens next?</h4>
                    </div>
                    <div className="text-stone-400 text-sm space-y-1">
                      <div>• Your subscription remains active until {nextBillingDate.toLocaleDateString()}</div>
                      <div>• All features continue to work normally until then</div>
                      <div>• You'll receive a confirmation email shortly</div>
                      <div>• You can resubscribe anytime from the billing page</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handlePrevStep}
                      disabled={isCancelling}
                      variant="outline"
                      className="flex-1 border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleFinalCancel}
                      disabled={isCancelling}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isCancelling ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Cancelling...
                        </div>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
