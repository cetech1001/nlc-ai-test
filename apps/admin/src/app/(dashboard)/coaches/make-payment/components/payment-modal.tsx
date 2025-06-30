import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Listbox, RadioGroup } from "@headlessui/react";
import { Copy, ChevronDown, CheckIcon } from "lucide-react";
import { Button } from "@nlc-ai/ui";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachName: string;
  selectedPlan?: string;
  onPaymentComplete?: () => void;
}

const planOptions = [
  { name: "Solo Agent", price: 360 },
  { name: "Starter Pack", price: 360 },
  { name: "Growth Pro", price: 1099 },
  { name: "Scale Elite", price: 1899 },
];

const paymentModes = [
  { id: "send-link", name: "Send A Link" },
  { id: "pay-here", name: "Pay Here" },
];

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     coachName,
                                                     selectedPlan = "Growth Pro",
                                                     onPaymentComplete,
                                                   }) => {
  const [selectedPlanOption, setSelectedPlanOption] = useState(
    planOptions.find(p => p.name === selectedPlan) || planOptions[2]
  );
  const [amount, setAmount] = useState(selectedPlanOption.price);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(paymentModes[0]);
  const [paymentLink, setPaymentLink] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    const plan = planOptions.find(p => p.name === selectedPlan) || planOptions[2];
    setSelectedPlanOption(plan);
    setAmount(plan.price);
  }, [selectedPlan]);

  useEffect(() => {
    setAmount(selectedPlanOption.price);
  }, [selectedPlanOption]);

  const handleCopyPaymentLink = () => {
    const link = `https://payment.example.com/pay/${coachName.replace(/\s+/g, "-").toLowerCase()}/${selectedPlanOption.name.replace(/\s+/g, "-").toLowerCase()}/${amount}`;
    setPaymentLink(link);

    navigator.clipboard.writeText(link).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    });
  };

  const handleDiscard = () => {
    const plan = planOptions.find(p => p.name === selectedPlan) || planOptions[2];
    setSelectedPlanOption(plan);
    setAmount(plan.price);
    setSelectedPaymentMode(paymentModes[0]);
    setPaymentLink("");
    setIsLinkCopied(false);
    onClose();
  };

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
                            {selectedPlanOption.name} - ${selectedPlanOption.price}
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
                            {planOptions.map((plan, planIdx) => (
                              <Listbox.Option
                                key={planIdx}
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
                                      {plan.name} - ${plan.price}
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
                        className="w-full pl-7 pr-3 py-2 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
                        placeholder="1200"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-white text-sm font-medium block">
                      Payment Mode
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <RadioGroup value={selectedPaymentMode} onChange={setSelectedPaymentMode}>
                      <div className="flex gap-6">
                        {paymentModes.map((mode) => (
                          <RadioGroup.Option
                            key={mode.id}
                            value={mode}
                            className={({ active, checked }) =>
                              `${active ? "ring-2 ring-[#7B21BA]/50" : ""}
                              ${checked ? "text-white" : "text-white"}
                              relative flex cursor-pointer items-center space-x-2 focus:outline-none`
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

                  {paymentLink && (
                    <div className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
                      <p className="text-[#A0A0A0] text-xs mb-2 font-medium">
                        Payment Link:
                      </p>
                      <p className="text-white text-sm break-all bg-[#1A1A1A] p-2 rounded border font-mono">
                        {paymentLink}
                      </p>
                      {isLinkCopied && (
                        <p className="text-green-400 text-xs mt-2">
                          ✓ Link copied to clipboard!
                        </p>
                      )}
                    </div>
                  )}

                  {selectedPaymentMode.id === "pay-here" && (
                    <div className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
                      <p className="text-[#A0A0A0] text-sm mb-3">
                        Payment integration coming soon...
                      </p>
                      <div className="opacity-50">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input
                            placeholder="Card number"
                            disabled
                            className="px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded text-white placeholder:text-[#A0A0A0]"
                          />
                          <input
                            placeholder="MM/YY"
                            disabled
                            className="px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded text-white placeholder:text-[#A0A0A0]"
                          />
                        </div>
                        <input
                          placeholder="CVV"
                          disabled
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded text-white placeholder:text-[#A0A0A0] mb-3"
                        />
                        <input
                          placeholder="Cardholder name"
                          disabled
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded text-white placeholder:text-[#A0A0A0]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3 mt-3">
                  <Button
                    onClick={handleCopyPaymentLink}
                    disabled={selectedPaymentMode.id === "pay-here"}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] disabled:bg-[#4A4A4A] disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {isLinkCopied ? "Link Copied!" : "Copy Payment Link"}
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={handleDiscard}
                    className="flex-1 bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
                  >
                    Discard
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentModal;
