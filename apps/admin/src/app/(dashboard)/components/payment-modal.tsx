import React, { useState } from "react";
import { Button } from "@nlc-ai/ui";
import { Input } from "@nlc-ai/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nlc-ai/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nlc-ai/ui";
import { RadioGroup, RadioGroupItem } from "@nlc-ai/ui";
import { Label } from "@nlc-ai/ui";
import { Copy } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachName: string;
  selectedPlan?: string;
  onPaymentComplete?: () => void;
}

const planPrices = {
  "Solo Agent": 360,
  "Starter Pack": 360,
  "Growth Pro": 1099,
  "Scale Elite": 1899,
};

const PaymentModal: React.FC<PaymentModalProps> = ({
 isOpen,
 onClose,
 coachName,
 selectedPlan = "Growth Pro",
 onPaymentComplete,
}) => {
  const [plan, setPlan] = useState(selectedPlan);
  const [amount, setAmount] = useState(
    planPrices[selectedPlan as keyof typeof planPrices] || 1099,
  );
  const [paymentMode, setPaymentMode] = useState("send-link");
  const [paymentLink, setPaymentLink] = useState("");

  const handlePlanChange = (newPlan: string) => {
    setPlan(newPlan);
    setAmount(planPrices[newPlan as keyof typeof planPrices] || 0);
  };

  const handleCopyPaymentLink = () => {
    // Generate a mock payment link
    const link = `https://payment.example.com/pay/${coachName.replace(/\s+/g, "-").toLowerCase()}/${plan.replace(/\s+/g, "-").toLowerCase()}/${amount}`;
    setPaymentLink(link);

    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
      console.log("Payment link copied to clipboard");
      // You could show a toast notification here
    });
  };

  const handleDiscard = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1A1A1A] border-[#2A2A2A] text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Make Payment for <span className="text-[#7B21BA]">{coachName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Select Plan */}
          <div className="space-y-2">
            <Label htmlFor="plan" className="text-white text-sm font-medium">
              Select Plan
            </Label>
            <Select value={plan} onValueChange={handlePlanChange}>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectItem
                  value="Solo Agent"
                  className="text-white hover:bg-[#3A3A3A]"
                >
                  Solo Agent
                </SelectItem>
                <SelectItem
                  value="Starter Pack"
                  className="text-white hover:bg-[#3A3A3A]"
                >
                  Starter Pack
                </SelectItem>
                <SelectItem
                  value="Growth Pro"
                  className="text-white hover:bg-[#3A3A3A]"
                >
                  Growth Pro
                </SelectItem>
                <SelectItem
                  value="Scale Elite"
                  className="text-white hover:bg-[#3A3A3A]"
                >
                  Scale Elite
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white text-sm font-medium">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
              placeholder="Enter amount"
            />
          </div>

          {/* Payment Mode */}
          <div className="space-y-3">
            <Label className="text-white text-sm font-medium">
              Payment Mode
            </Label>
            <RadioGroup value={paymentMode} className={"flex gap-6"} onValueChange={setPaymentMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="send-link"
                  id="send-link"
                  className="border-[#7B21BA] text-[#7B21BA]"
                />
                <Label htmlFor="send-link" className="text-white text-sm">
                  Send A Link
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="pay-here"
                  id="pay-here"
                  className="border-[#A0A0A0] text-[#A0A0A0]"
                />
                <Label htmlFor="pay-here" className="text-white text-sm">
                  Pay Here
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Display Payment Link if generated */}
          {paymentLink && (
            <div className="p-3 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
              <p className="text-[#A0A0A0] text-xs mb-1">Payment Link:</p>
              <p className="text-white text-sm break-all">{paymentLink}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleCopyPaymentLink}
            className="flex-1 bg-[#7B21BA] hover:bg-[#8B31CA] text-white"
            disabled={paymentMode === "pay-here"}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Payment Link
          </Button>
          <Button
            onClick={handleDiscard}
            variant="outline"
            className="flex-1 bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
          >
            Discard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
