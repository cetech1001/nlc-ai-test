import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Listbox, RadioGroup } from "@headlessui/react";
import { Copy, ChevronDown, CheckIcon, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@nlc-ai/web-ui";
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentsAPI, plansAPI } from "@nlc-ai/web-api-client";
import {PaymentModalSkeleton} from "@/lib";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachName: string;
  coachID: string;
  selectedPlan?: string;
  onPaymentComplete?: () => void;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const paymentModes = [
  { id: "send-link", name: "Send A Link" },
  { id: "pay-here", name: "Pay Here" },
];

// Stripe payment form component
const StripePaymentForm: React.FC<{
  selectedPlan: Plan;
  amount: number;
  coachID: string;
  coachName: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}> = ({ selectedPlan, amount, coachID, coachName, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await paymentsAPI.createPaymentIntent({
          coachID: coachID,
          planID: selectedPlan.id,
          amount: amount * 100, // Convert to cents
          description: `Payment for ${coachName} - ${selectedPlan.name} plan`,
        });
        setClientSecret(response.clientSecret);
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        onPaymentError(error.message || 'Failed to initialize payment');
      }
    };

    if (selectedPlan && coachID && amount > 0) {
      createPaymentIntent();
    }
  }, [selectedPlan, coachID, amount, coachName, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onPaymentError('Stripe is not properly initialized');
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: coachName,
          },
        },
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (error: any) {
      onPaymentError(error.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#a0a0a0',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
        <p className="text-[#A0A0A0] text-sm mb-3">Card Details</p>
        <div className="p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
        <h4 className="text-white font-medium mb-2">Payment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#A0A0A0]">Coach:</span>
            <span className="text-white">{coachName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A0A0A0]">Plan:</span>
            <span className="text-white">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-[#A0A0A0]">Amount:</span>
            <span className="text-white">${amount}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] disabled:bg-[#4A4A4A] disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Process Payment ${amount}
          </>
        )}
      </Button>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
 isOpen,
 onClose,
 coachName,
 coachID,
 selectedPlan = "Growth Pro",
 onPaymentComplete,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanOption, setSelectedPlanOption] = useState<Plan | null>(null);
  const [amount, setAmount] = useState(0);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(paymentModes[0]);
  const [paymentLink, setPaymentLink] = useState("");
  const [linkID, setPaymentLinkID] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load plans on component mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        const plansData = await plansAPI.getPlans(false, false); // Only active plans

        const transformedPlans: Plan[] = plansData.map(plan => ({
          id: plan.id,
          name: plan.name,
          monthlyPrice: Math.floor(plan.monthlyPrice / 100), // Convert from cents
          annualPrice: Math.floor(plan.annualPrice / 100),
        }));

        setPlans(transformedPlans);

        // Set default selected plan
        const defaultPlan = transformedPlans.find(p => p.name === selectedPlan) || transformedPlans[0];
        if (defaultPlan) {
          setSelectedPlanOption(defaultPlan);
          setAmount(defaultPlan.monthlyPrice);
        }
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPlans();
    }
  }, [isOpen, selectedPlan]);

  useEffect(() => {
    if (selectedPlanOption) {
      setAmount(selectedPlanOption.monthlyPrice);
    }
  }, [selectedPlanOption]);

  const handleCopyPaymentLink = async () => {
    if (!selectedPlanOption || !coachID) {
      setPaymentError('Please select a plan first');
      return;
    }

    setIsCreatingLink(true);
    setPaymentError('');

    try {
      let linkToSend = paymentLink;

      if (!paymentLink) {
        const response = await paymentsAPI.sendPaymentRequest({
          coachID: coachID,
          planID: selectedPlanOption.id,
          amount: amount * 100, // Convert to cents
          description: `Payment for ${coachName} - ${selectedPlanOption.name} plan`,
        });

        linkToSend = response.paymentLink;
        setPaymentLink(response.paymentLink);
        setPaymentLinkID(response.linkID);

        if (!response.emailSent) {
          setPaymentError('Payment link was created but the system failed to send it to the coach. Try sending it again!');
        }
      } else {
        await paymentsAPI.sendPaymentRequest({
          coachID: coachID,
          planID: selectedPlanOption.id,
          amount: amount * 100,
          description: `Payment for ${coachName} - ${selectedPlanOption.name} plan`,
          paymentLink,
          linkID,
        });
      }

      // Copy the link
      navigator.clipboard.writeText(linkToSend).then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
      });
    } catch (error: any) {
      setPaymentError(error.message || 'Failed to send payment request');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError('');
    setTimeout(() => {
      onPaymentComplete?.();
      handleDiscard();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const handleDiscard = () => {
    // Reset all state
    const defaultPlan = plans.find(p => p.name === selectedPlan) || plans[0];
    if (defaultPlan) {
      setSelectedPlanOption(defaultPlan);
      setAmount(defaultPlan.monthlyPrice);
    }
    setSelectedPaymentMode(paymentModes[0]);
    setPaymentLink("");
    setPaymentLinkID("");
    setIsLinkCopied(false);
    setIsCreatingLink(false);
    setPaymentError('');
    setPaymentSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  const stripeElementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#7B21BA',
        colorBackground: '#1a1a1a',
        colorText: '#ffffff',
        colorDanger: '#dc2626',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    },
  };

  if (isLoading) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#2A2A2A] p-6 text-left align-middle shadow-xl transition-all">
                  <PaymentModalSkeleton/>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#2A2A2A] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg text-center font-semibold leading-6 text-white mb-6"
                >
                  Make Payment for{" "}
                  <span className="text-[#7B21BA]">{coachName}</span>
                </Dialog.Title>

                {paymentSuccess && (
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-medium">Payment successful!</p>
                    </div>
                    <p className="text-green-300 text-sm mt-1">
                      Payment has been processed successfully for {coachName}.
                    </p>
                  </div>
                )}

                {paymentError && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 font-medium">Payment failed</p>
                    <p className="text-red-300 text-sm mt-1">{paymentError}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      Select Plan
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Listbox value={selectedPlanOption} onChange={setSelectedPlanOption}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#3A3A3A] py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]">
                          <span className="block truncate">
                            {selectedPlanOption ? `${selectedPlanOption.name} - ${selectedPlanOption.monthlyPrice}` : 'Select a plan'}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                              className="h-5 w-5 text-[#A0A0A0]"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#2A2A2A] border border-[#3A3A3A] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                            {plans.map((plan) => (
                              <Listbox.Option
                                key={plan.id}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? "bg-[#3A3A3A] text-white" : "text-white"
                                  }`
                                }
                                value={plan}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {plan.name} - ${plan.monthlyPrice}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7B21BA]">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-white text-sm font-medium block">
                      Amount
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)]">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] text-sm">
                        $
                      </span>
                      <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-transparent border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
                        placeholder="1200"
                        min="0"
                        readOnly={true}
                        disabled={isProcessing || paymentSuccess}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-white text-sm font-medium block">
                      Payment Mode
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <RadioGroup value={selectedPaymentMode} onChange={setSelectedPaymentMode} disabled={isProcessing || paymentSuccess}>
                      <div className="flex gap-6">
                        {paymentModes.map((mode) => (
                          <RadioGroup.Option
                            key={mode.id}
                            value={mode}
                            className={({ active, checked }) =>
                              `${active ? "ring-2 ring-[#7B21BA]/50" : ""}
                              ${checked ? "text-white" : "text-white"}
                              relative flex cursor-pointer items-center space-x-2 focus:outline-none ${
                                isProcessing || paymentSuccess ? 'opacity-50 pointer-events-none' : ''
                              }`
                            }
                          >
                            {({ checked }) => (
                              <>
                                <div
                                  className={`${
                                    checked
                                      ? "bg-[#7B21BA] border-[#7B21BA]"
                                      : "bg-transparent border-[#A0A0A0]"
                                  } h-4 w-4 rounded-full border-2 flex items-center justify-center`}
                                >
                                  {checked && (
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <RadioGroup.Label
                                  as="span"
                                  className="text-white text-sm cursor-pointer"
                                >
                                  {mode.name}
                                </RadioGroup.Label>
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {selectedPaymentMode.id === "send-link" && paymentLink && (
                    <div className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
                      <p className="text-[#A0A0A0] text-xs mb-2 font-medium">
                        Stripe Payment Link:
                      </p>
                      <p className="text-white text-sm break-all bg-[#1A1A1A] p-2 rounded border font-mono">
                        {paymentLink}
                      </p>
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                        <p className="text-blue-300 text-sm">
                          <strong>Instructions:</strong> This link has been sent to the coach. They can use it to make a secure payment directly through Stripe.
                        </p>
                        <ul className="text-blue-300 text-xs mt-2 space-y-1">
                          <li>• Link expires automatically after payment</li>
                          <li>• Secure payment processing by Stripe</li>
                          <li>• Automatic subscription activation</li>
                          <li>• Email receipt sent to coach</li>
                        </ul>
                      </div>
                      {isLinkCopied && (
                        <p className="text-green-400 text-xs mt-2">
                          ✓ Link copied to clipboard!
                        </p>
                      )}
                    </div>
                  )}

                  {selectedPaymentMode.id === "pay-here" && selectedPlanOption && (
                    <Elements stripe={stripePromise} options={stripeElementsOptions}>
                      <StripePaymentForm
                        selectedPlan={selectedPlanOption}
                        amount={amount}
                        coachID={coachID}
                        coachName={coachName}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                      />
                    </Elements>
                  )}
                </div>

                {selectedPaymentMode.id === "send-link" && (
                  <div className="flex gap-3 pt-3 mt-3">
                    <Button
                      onClick={handleCopyPaymentLink}
                      disabled={isProcessing || paymentSuccess || isCreatingLink}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] disabled:bg-[#4A4A4A] disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {isCreatingLink ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Payment Request...
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {paymentLink ? (isLinkCopied ? "Request Sent!" : "Send Request Again") : "Send Payment Request"}
                        </>
                      )}
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={handleDiscard}
                      disabled={isProcessing || isCreatingLink}
                      className="flex-1 bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
                    >
                      {paymentSuccess ? "Close" : "Cancel"}
                    </Button>
                  </div>
                )}

                {selectedPaymentMode.id === "pay-here" && !paymentSuccess && (
                  <div className="flex gap-3 pt-3 mt-3">
                    <Button
                      variant={"outline"}
                      onClick={handleDiscard}
                      disabled={isProcessing}
                      className="w-full bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
